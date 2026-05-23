"use client";

import { useEffect, useRef, useState } from "react";
import { Sparkles, ExternalLink, Loader2 } from "lucide-react";
import { useStore } from "@/lib/store";
import {
  cosineSimilarity,
  embedText,
  warmEmbedder,
} from "@/lib/ai-search";
import { cn } from "@/lib/utils";

interface Suggestion {
  sosId: string;
  title: string;
  fixNote: string;
  score: number;
  helperName?: string;
}

interface AiSuggestionsProps {
  query: string;
}

export function AiSuggestions({ query }: AiSuggestionsProps) {
  const { state } = useStore();
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [ready, setReady] = useState(false);
  const indexRef = useRef<Map<string, Float32Array>>(new Map());

  useEffect(() => {
    warmEmbedder();
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function buildIndex() {
      const resolved = state.sosRequests.filter(
        (s) => s.status === "resolved" && s.fixNote,
      );
      if (resolved.length === 0) {
        if (!cancelled) setReady(true);
        return;
      }
      const fresh = new Map<string, Float32Array>();
      try {
        for (const sos of resolved) {
          if (cancelled) return;
          const cached = indexRef.current.get(sos.id);
          if (cached) {
            fresh.set(sos.id, cached);
            continue;
          }
          const vec = await embedText(
            `${sos.title}\n${sos.context}\n${sos.fixNote ?? ""}`,
          );
          fresh.set(sos.id, vec);
        }
      } catch {
        /* model failed to load; leave suggestions empty */
      }
      if (!cancelled) {
        indexRef.current = fresh;
        setReady(true);
      }
    }
    void buildIndex();
    return () => {
      cancelled = true;
    };
  }, [state.sosRequests]);

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 12 || !ready) {
      setSuggestions([]);
      return;
    }
    let cancelled = false;
    setLoading(true);
    const handle = setTimeout(async () => {
      try {
        const qVec = await embedText(trimmed);
        const scored: Suggestion[] = [];
        for (const sos of state.sosRequests) {
          if (sos.status !== "resolved" || !sos.fixNote) continue;
          const vec = indexRef.current.get(sos.id);
          if (!vec) continue;
          const score = cosineSimilarity(qVec, vec);
          if (score < 0.4) continue;
          const helper = state.users.find((u) => u.id === sos.helperIds[0]);
          scored.push({
            sosId: sos.id,
            title: sos.title,
            fixNote: sos.fixNote,
            score,
            helperName: helper?.name,
          });
        }
        scored.sort((a, b) => b.score - a.score);
        if (!cancelled) setSuggestions(scored.slice(0, 3));
      } catch {
        if (!cancelled) setSuggestions([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 350);
    return () => {
      cancelled = true;
      clearTimeout(handle);
    };
  }, [query, ready, state.sosRequests, state.users]);

  if (suggestions.length === 0 && !loading) return null;

  return (
    <div className="border-foreground/15 bg-foreground/[0.03] rounded-md border p-3">
      <div className="text-foreground flex items-center gap-1.5 text-xs font-semibold">
        <Sparkles className="size-3.5" />
        AI suggests similar resolved fixes
        {loading ? (
          <Loader2 className="text-muted-foreground size-3 animate-spin" />
        ) : null}
      </div>
      <ul className="mt-2 space-y-2">
        {suggestions.map((s) => (
          <li key={s.sosId}>
            <a
              href={`/board/${s.sosId}`}
              target="_blank"
              rel="noreferrer"
              className={cn(
                "border-border bg-background hover:bg-muted block rounded border p-2 transition-colors",
              )}
            >
              <div className="flex items-center gap-2">
                <span className="text-foreground line-clamp-1 flex-1 text-sm font-medium">
                  {s.title}
                </span>
                <span className="text-muted-foreground shrink-0 text-[11px] tabular-nums">
                  {(s.score * 100).toFixed(0)}% match
                </span>
                <ExternalLink className="text-muted-foreground size-3" />
              </div>
              <p className="text-muted-foreground mt-1 line-clamp-2 text-xs leading-relaxed">
                {s.fixNote}
              </p>
              {s.helperName ? (
                <p className="text-muted-foreground mt-1 text-[11px]">
                  Fixed by {s.helperName}
                </p>
              ) : null}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
