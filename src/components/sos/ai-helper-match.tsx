"use client";

import { useEffect, useRef, useState } from "react";
import { Sparkles, Loader2, UserCheck } from "lucide-react";
import { useStore } from "@/lib/store";
import {
  cosineSimilarity,
  embedText,
  warmEmbedder,
} from "@/lib/ai-search";
import { UserAvatar } from "./user-avatar";
import type { User } from "@/lib/types";

interface Match {
  user: User;
  score: number;
  reason: string;
}

interface AiHelperMatchProps {
  query: string;
  category: string;
}

export function AiHelperMatch({ query, category }: AiHelperMatchProps) {
  const { state } = useStore();
  const [matches, setMatches] = useState<Match[]>([]);
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const indexRef = useRef<Map<string, Float32Array>>(new Map());

  useEffect(() => {
    warmEmbedder();
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function build() {
      const fresh = new Map<string, Float32Array>();
      for (const u of state.users) {
        if (cancelled) return;
        if (u.id === state.currentUserId) continue;
        const cached = indexRef.current.get(u.id);
        if (cached) {
          fresh.set(u.id, cached);
          continue;
        }
        const helpedCategories = state.sosRequests
          .filter(
            (s) => s.helperIds.includes(u.id) && s.status === "resolved",
          )
          .map((s) => s.category)
          .join(", ");
        const profile = [
          `${u.name}`,
          `Skills: ${u.skills.join(", ")}`,
          helpedCategories ? `Has resolved: ${helpedCategories}` : "",
          u.pitch ?? "",
        ]
          .filter(Boolean)
          .join("\n");
        try {
          const vec = await embedText(profile);
          fresh.set(u.id, vec);
        } catch {
          /* skip */
        }
      }
      if (!cancelled) {
        indexRef.current = fresh;
        setReady(true);
      }
    }
    void build();
    return () => {
      cancelled = true;
    };
  }, [state.users, state.sosRequests, state.currentUserId]);

  useEffect(() => {
    if (!ready) return;
    const text = query.trim();
    if (text.length < 12) {
      setMatches([]);
      return;
    }
    let cancelled = false;
    setLoading(true);
    const handle = setTimeout(async () => {
      try {
        const qVec = await embedText(`${category}\n${text}`);
        const scored: Match[] = [];
        for (const user of state.users) {
          if (user.id === state.currentUserId) continue;
          const vec = indexRef.current.get(user.id);
          if (!vec) continue;
          const semantic = cosineSimilarity(qVec, vec);
          const skillBoost = user.skills.includes(category) ? 0.15 : 0;
          const helped = state.sosRequests.filter(
            (s) =>
              s.helperIds.includes(user.id) &&
              s.status === "resolved" &&
              s.category === category,
          ).length;
          const historyBoost = Math.min(helped * 0.04, 0.12);
          const score = semantic + skillBoost + historyBoost;
          let reason = "Strong semantic match";
          if (helped > 0) {
            reason = `Resolved ${helped} ${category} issue${helped === 1 ? "" : "s"}`;
          } else if (user.skills.includes(category)) {
            reason = `${category} specialist`;
          }
          scored.push({ user, score, reason });
        }
        scored.sort((a, b) => b.score - a.score);
        if (!cancelled) setMatches(scored.slice(0, 3));
      } catch {
        if (!cancelled) setMatches([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 350);
    return () => {
      cancelled = true;
      clearTimeout(handle);
    };
  }, [
    query,
    category,
    ready,
    state.users,
    state.sosRequests,
    state.currentUserId,
  ]);

  if (matches.length === 0 && !loading) return null;

  return (
    <div className="border-foreground/15 bg-foreground/[0.03] rounded-md border p-3">
      <div className="text-foreground flex items-center gap-1.5 text-xs font-semibold">
        <Sparkles className="size-3.5" />
        AI suggests who can help
        {loading ? (
          <Loader2 className="text-muted-foreground size-3 animate-spin" />
        ) : null}
      </div>
      <ul className="mt-2 space-y-1.5">
        {matches.map((m) => (
          <li
            key={m.user.id}
            className="border-border bg-background flex items-center gap-3 rounded border p-2"
          >
            <UserAvatar user={m.user} className="size-7 shrink-0" />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-foreground line-clamp-1 text-sm font-medium">
                  {m.user.name}
                </span>
                <span className="text-muted-foreground shrink-0 text-[11px] tabular-nums">
                  {(m.score * 100).toFixed(0)}% match
                </span>
              </div>
              <div className="text-muted-foreground flex items-center gap-1 text-[11px]">
                <UserCheck className="size-3" />
                {m.reason}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
