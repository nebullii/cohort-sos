"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ExternalLink, Search, Sparkles, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useStore } from "@/lib/store";
import { timeAgo } from "@/lib/format";
import { cosineSimilarity, embedText, warmEmbedder } from "@/lib/ai-search";

interface Scored {
  id: string;
  score: number;
}

export default function KnowledgePage() {
  const { state } = useStore();
  const [search, setSearch] = useState("");
  const [useAi, setUseAi] = useState(true);
  const [aiReady, setAiReady] = useState(false);
  const [aiScores, setAiScores] = useState<Scored[]>([]);
  const [aiLoading, setAiLoading] = useState(false);
  const indexRef = useRef<Map<string, Float32Array>>(new Map());

  const solved = useMemo(
    () => state.sosRequests.filter((sos) => sos.status === "resolved"),
    [state.sosRequests],
  );

  useEffect(() => {
    warmEmbedder();
  }, []);

  useEffect(() => {
    if (!useAi) return;
    let cancelled = false;
    async function build() {
      const fresh = new Map<string, Float32Array>();
      for (const sos of solved) {
        if (cancelled) return;
        const cached = indexRef.current.get(sos.id);
        if (cached) {
          fresh.set(sos.id, cached);
          continue;
        }
        try {
          const vec = await embedText(
            `${sos.title}\n${sos.context}\n${sos.fixNote ?? ""}`,
          );
          fresh.set(sos.id, vec);
        } catch {
          /* skip */
        }
      }
      if (!cancelled) {
        indexRef.current = fresh;
        setAiReady(true);
      }
    }
    void build();
    return () => {
      cancelled = true;
    };
  }, [solved, useAi]);

  useEffect(() => {
    if (!useAi || !aiReady) return;
    const trimmed = search.trim();
    if (trimmed.length < 4) {
      setAiScores([]);
      return;
    }
    let cancelled = false;
    setAiLoading(true);
    const handle = setTimeout(async () => {
      try {
        const qVec = await embedText(trimmed);
        const scored: Scored[] = [];
        for (const sos of solved) {
          const vec = indexRef.current.get(sos.id);
          if (!vec) continue;
          const score = cosineSimilarity(qVec, vec);
          scored.push({ id: sos.id, score });
        }
        scored.sort((a, b) => b.score - a.score);
        if (!cancelled) setAiScores(scored);
      } catch {
        if (!cancelled) setAiScores([]);
      } finally {
        if (!cancelled) setAiLoading(false);
      }
    }, 250);
    return () => {
      cancelled = true;
      clearTimeout(handle);
    };
  }, [search, solved, useAi, aiReady]);

  const aiFiltered = useMemo(() => {
    if (!useAi || !search.trim() || aiScores.length === 0) return null;
    const scoreMap = new Map(aiScores.map((s) => [s.id, s.score]));
    return solved
      .map((sos) => ({ sos, score: scoreMap.get(sos.id) ?? 0 }))
      .filter((x) => x.score > 0.25)
      .sort((a, b) => b.score - a.score)
      .map((x) => ({ sos: x.sos, score: x.score }));
  }, [solved, aiScores, useAi, search]);

  const keywordFiltered = useMemo(() => {
    const q = search.toLowerCase();
    return solved.filter((sos) =>
      `${sos.title} ${sos.context} ${sos.fixNote ?? ""} ${sos.category}`
        .toLowerCase()
        .includes(q),
    );
  }, [solved, search]);

  const displayed = useAi && aiFiltered
    ? aiFiltered
    : keywordFiltered.map((sos) => ({ sos, score: 0 }));

  return (
    <div className="space-y-8">
      <header className="max-w-2xl">
        <h1 className="text-foreground text-2xl font-semibold tracking-tight">
          Knowledge Base
        </h1>
        <p className="text-muted-foreground mt-2 text-sm">
          Every resolved SOS becomes a reusable fix. Search by intent. We embed
          your query in your browser so it understands meaning, not just words.
        </p>
      </header>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative max-w-md flex-1">
          {useAi ? (
            <Sparkles className="text-foreground pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2" />
          ) : (
            <Search className="text-muted-foreground pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2" />
          )}
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={
              useAi ? "Describe the issue (AI semantic search)" : "Search fixes"
            }
            className="pl-9"
          />
          {aiLoading ? (
            <Loader2 className="text-muted-foreground absolute right-3 top-1/2 size-3.5 -translate-y-1/2 animate-spin" />
          ) : null}
        </div>
        <button
          type="button"
          onClick={() => setUseAi((v) => !v)}
          className={
            "border-border text-xs font-medium inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 transition-colors " +
            (useAi
              ? "bg-foreground text-background"
              : "text-muted-foreground hover:text-foreground")
          }
        >
          <Sparkles className="size-3" />
          AI search {useAi ? "on" : "off"}
        </button>
      </div>

      <section>
        {displayed.length === 0 ? (
          <div className="text-muted-foreground border-border rounded-lg border border-dashed p-12 text-center text-sm">
            <p>No solved fixes found.</p>
            {useAi && search.trim().length > 0 && !aiReady ? (
              <p className="mt-2 text-xs">
                Loading the AI search model (first run only, ~22MB cached).
              </p>
            ) : null}
          </div>
        ) : (
          <ul className="divide-border border-border divide-y rounded-lg border">
            {displayed.map(({ sos, score }) => {
              const helpers = sos.helperIds
                .map((id) => state.users.find((u) => u.id === id))
                .filter((u): u is NonNullable<typeof u> => Boolean(u));
              return (
                <li
                  key={sos.id}
                  className="hover:bg-muted/40 px-5 py-4 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-muted-foreground">
                          {sos.category}
                        </span>
                        <span className="text-muted-foreground">·</span>
                        <span className="text-muted-foreground">
                          Resolved {timeAgo(sos.resolvedAt ?? sos.createdAt)}
                        </span>
                        {useAi && score > 0 ? (
                          <>
                            <span className="text-muted-foreground">·</span>
                            <span className="text-foreground font-medium tabular-nums">
                              {(score * 100).toFixed(0)}% match
                            </span>
                          </>
                        ) : null}
                      </div>
                      <h3 className="text-foreground mt-1.5 text-base font-medium leading-snug">
                        {sos.title}
                      </h3>
                      <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                        {sos.fixNote ?? "No final fix note recorded."}
                      </p>
                      {sos.fixCommitUrl ? (
                        <a
                          href={sos.fixCommitUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-foreground hover:underline mt-2 inline-flex items-center gap-1 text-xs"
                        >
                          <ExternalLink className="size-3 opacity-60" />
                          {sos.fixCommitUrl.replace(/^https?:\/\//, "")}
                        </a>
                      ) : null}
                      {helpers.length > 0 ? (
                        <p className="text-muted-foreground mt-2.5 text-xs">
                          Fixed by{" "}
                          {helpers
                            .map((h) => `@${h.githubHandle}`)
                            .join(", ")}
                        </p>
                      ) : null}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
