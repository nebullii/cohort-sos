"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  ExternalLink,
  GitCommit,
  Globe,
  Play,
  Trophy,
  Zap,
} from "lucide-react";
import { useStore } from "@/lib/store";
import type { User } from "@/lib/types";
import { timeAgo } from "@/lib/format";

interface CommitItem {
  sha: string;
  message: string;
  date: string;
  url: string;
  author: { name: string; login?: string; avatar?: string };
}

interface RepoCommits {
  user: User;
  loading: boolean;
  notFound?: boolean;
  rateLimited?: boolean;
  commits: CommitItem[];
}

export default function CompetingPage() {
  const { state } = useStore();
  const competing = useMemo(
    () =>
      state.users.filter(
        (u) => u.competeForWin === true && Boolean(u.projectRepoUrl),
      ),
    [state.users],
  );

  const [byUser, setByUser] = useState<Map<string, RepoCommits>>(() => new Map());
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const initial = new Map<string, RepoCommits>();
      for (const u of competing) {
        initial.set(u.id, { user: u, loading: true, commits: [] });
      }
      setByUser(new Map(initial));

      for (const u of competing) {
        if (cancelled) return;
        if (!u.projectRepoUrl) continue;
        try {
          const r = await fetch(
            `/api/github/commits?repo=${encodeURIComponent(u.projectRepoUrl)}`,
          );
          const data = await r.json();
          if (cancelled) return;
          setByUser((prev) => {
            const next = new Map(prev);
            next.set(u.id, {
              user: u,
              loading: false,
              commits: data.commits ?? [],
              notFound: data.notFound,
              rateLimited: data.rateLimited,
            });
            return next;
          });
        } catch {
          if (cancelled) return;
          setByUser((prev) => {
            const next = new Map(prev);
            next.set(u.id, {
              user: u,
              loading: false,
              commits: [],
            });
            return next;
          });
        }
      }
      if (!cancelled) setLastRefreshed(new Date());
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [competing]);

  const allEvents = useMemo(() => {
    const events: Array<{ user: User; commit: CommitItem }> = [];
    for (const rc of byUser.values()) {
      for (const c of rc.commits) {
        events.push({ user: rc.user, commit: c });
      }
    }
    events.sort(
      (a, b) =>
        new Date(b.commit.date).getTime() - new Date(a.commit.date).getTime(),
    );
    return events;
  }, [byUser]);

  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const commitsThisWeek = allEvents.filter(
    (e) => new Date(e.commit.date).getTime() >= sevenDaysAgo,
  ).length;
  const leader = useMemo(() => {
    const counts = new Map<string, number>();
    for (const e of allEvents) {
      if (new Date(e.commit.date).getTime() < sevenDaysAgo) continue;
      counts.set(e.user.id, (counts.get(e.user.id) ?? 0) + 1);
    }
    let topId: string | null = null;
    let topN = 0;
    for (const [id, n] of counts) {
      if (n > topN) {
        topN = n;
        topId = id;
      }
    }
    if (!topId) return null;
    return { user: competing.find((u) => u.id === topId)!, count: topN };
  }, [allEvents, sevenDaysAgo, competing]);

  return (
    <div className="space-y-10">
      <header className="max-w-2xl">
        <p className="text-muted-foreground text-xs font-medium">
          {state.cohort?.name ?? "Cohort"}
        </p>
        <h1 className="text-foreground mt-1 flex items-center gap-2 text-2xl font-semibold tracking-tight">
          <Trophy className="text-amber-600 size-5" />
          Competition Watch
        </h1>
        <p className="text-muted-foreground mt-2 text-sm">
          Live feed of every competing project. Commits pulled from each
          builder&apos;s repo (last 14 days), refreshed every 2 minutes.
        </p>
        {lastRefreshed ? (
          <p className="text-muted-foreground mt-2 text-[11px]">
            Last refreshed {timeAgo(lastRefreshed.toISOString())}.
          </p>
        ) : null}
      </header>

      <section className="grid grid-cols-1 gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-3">
        <Stat
          icon={Activity}
          label="Commits this week"
          value={commitsThisWeek.toString()}
        />
        <Stat
          icon={Trophy}
          label="Top shipper this week"
          value={leader ? leader.user.name.split(" ")[0] : "·"}
          sub={leader ? `${leader.count} commits` : ""}
        />
        <Stat
          icon={Zap}
          label="Competing builders"
          value={competing.length.toString()}
        />
      </section>

      <section>
        <h2 className="text-foreground text-sm font-semibold">Projects</h2>
        <div className="mt-3 grid gap-4 lg:grid-cols-2">
          {competing.length === 0 ? (
            <div className="text-muted-foreground border-border col-span-full rounded-lg border border-dashed p-10 text-center text-sm">
              No competing builders yet.
            </div>
          ) : (
            competing.map((u) => {
              const rc = byUser.get(u.id);
              return <ProjectCard key={u.id} user={u} rc={rc} />;
            })
          )}
        </div>
      </section>

      <section>
        <h2 className="text-foreground text-sm font-semibold">All ship activity</h2>
        <p className="text-muted-foreground mt-1 text-xs">
          Every commit across every competing project, newest first.
        </p>
        <div className="border-border mt-3 overflow-hidden rounded-lg border">
          {allEvents.length === 0 ? (
            <div className="text-muted-foreground p-10 text-center text-sm">
              No commits in the last 14 days yet.
            </div>
          ) : (
            <ul className="divide-border divide-y">
              {allEvents.slice(0, 40).map((e) => (
                <li key={`${e.user.id}-${e.commit.sha}`}>
                  <a
                    href={e.commit.url}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:bg-muted/40 block px-4 py-3 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {e.user.avatarUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={e.user.avatarUrl}
                          alt={e.user.name}
                          className="size-6 shrink-0 rounded-full"
                        />
                      ) : (
                        <div className="bg-muted size-6 shrink-0 rounded-full" />
                      )}
                      <span className="text-foreground shrink-0 text-xs font-medium">
                        {e.user.name.split(" ")[0]}
                      </span>
                      <span className="text-muted-foreground line-clamp-1 flex-1 text-sm">
                        {e.commit.message}
                      </span>
                      <span className="bg-muted text-muted-foreground shrink-0 rounded px-1.5 py-0.5 font-mono text-[10px]">
                        {e.commit.sha}
                      </span>
                      <span className="text-muted-foreground shrink-0 text-[11px] tabular-nums">
                        {timeAgo(e.commit.date)}
                      </span>
                    </div>
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}

function ProjectCard({ user: u, rc }: { user: User; rc?: RepoCommits }) {
  return (
    <article className="border-border bg-background overflow-hidden rounded-lg border p-5">
      <div className="flex items-start gap-3">
        {u.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={u.avatarUrl}
            alt={u.name}
            className="size-10 rounded-full"
          />
        ) : (
          <div className="bg-muted size-10 rounded-full" />
        )}
        <div className="min-w-0 flex-1">
          <h3 className="text-foreground text-base font-semibold leading-tight">
            {u.name}
          </h3>
          {u.pitch ? (
            <p className="text-muted-foreground mt-0.5 line-clamp-1 text-xs">
              {u.pitch}
            </p>
          ) : null}
        </div>
        {u.projectLiveUrl ? (
          <a
            href={u.projectLiveUrl}
            target="_blank"
            rel="noreferrer"
            className="border-border text-muted-foreground hover:text-foreground inline-flex items-center gap-1 rounded-md border px-2 py-1 text-[11px]"
          >
            <Globe className="size-3" />
            Live
          </a>
        ) : null}
        {u.loomUrl ? (
          <a
            href={u.loomUrl}
            target="_blank"
            rel="noreferrer"
            className="border-border text-muted-foreground hover:text-foreground inline-flex items-center gap-1 rounded-md border px-2 py-1 text-[11px]"
          >
            <Play className="size-3" />
            Loom
          </a>
        ) : null}
      </div>

      <div className="border-border mt-4 border-t pt-4">
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-muted-foreground inline-flex items-center gap-1">
            <GitCommit className="size-3" />
            Recent commits
          </span>
          {rc && !rc.loading ? (
            <span className="text-muted-foreground tabular-nums">
              {rc.commits.length} in 14d
            </span>
          ) : null}
        </div>

        {!rc || rc.loading ? (
          <div className="mt-2 space-y-2">
            <div className="bg-muted h-3 w-3/4 animate-pulse rounded" />
            <div className="bg-muted h-3 w-2/3 animate-pulse rounded" />
            <div className="bg-muted h-3 w-1/2 animate-pulse rounded" />
          </div>
        ) : rc.notFound ? (
          <p className="text-muted-foreground mt-2 text-xs">
            Repo not found or private.
          </p>
        ) : rc.rateLimited ? (
          <p className="text-muted-foreground mt-2 text-xs">
            GitHub rate-limited. Try again later.
          </p>
        ) : rc.commits.length === 0 ? (
          <p className="text-muted-foreground mt-2 text-xs">
            No commits in the last 14 days.
          </p>
        ) : (
          <ul className="mt-2 space-y-2">
            {rc.commits.slice(0, 5).map((c) => (
              <li key={c.sha}>
                <a
                  href={c.url}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:bg-muted/40 flex items-center gap-2 rounded px-1 py-0.5 transition-colors"
                >
                  <span className="bg-muted text-muted-foreground shrink-0 rounded px-1.5 py-0.5 font-mono text-[10px]">
                    {c.sha}
                  </span>
                  <span className="text-foreground line-clamp-1 flex-1 text-xs">
                    {c.message}
                  </span>
                  <span className="text-muted-foreground shrink-0 text-[10px] tabular-nums">
                    {timeAgo(c.date)}
                  </span>
                  <ExternalLink className="text-muted-foreground size-3 shrink-0 opacity-60" />
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </article>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
  sub,
}: {
  icon: typeof Activity;
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="bg-background flex items-center gap-3 px-5 py-4">
      <span className="border-border grid size-8 place-items-center rounded-md border">
        <Icon className="size-4" />
      </span>
      <div>
        <div className="text-foreground text-2xl font-semibold tabular-nums leading-none">
          {value}
        </div>
        <div className="text-muted-foreground mt-1 text-[11px]">
          {label}
          {sub ? <span className="ml-1">{sub}</span> : null}
        </div>
      </div>
    </div>
  );
}
