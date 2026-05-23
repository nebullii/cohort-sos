"use client";

import { useMemo } from "react";
import {
  CheckCircle2,
  Clock,
  LifeBuoy,
  Trophy,
  Users,
  Zap,
} from "lucide-react";
import { useStore } from "@/lib/store";

export default function StandingsPage() {
  const { state } = useStore();

  const stats = useMemo(() => {
    const total = state.sosRequests.length;
    const resolved = state.sosRequests.filter((s) => s.status === "resolved");
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const weeklyResolved = resolved.filter(
      (s) =>
        s.resolvedAt && new Date(s.resolvedAt).getTime() >= sevenDaysAgo,
    ).length;
    const resolveDurations = resolved
      .filter((s) => s.resolvedAt)
      .map(
        (s) =>
          (new Date(s.resolvedAt!).getTime() -
            new Date(s.createdAt).getTime()) /
          60000,
      );
    const avg =
      resolveDurations.length === 0
        ? 0
        : Math.round(
            resolveDurations.reduce((a, b) => a + b, 0) /
              resolveDurations.length,
          );
    const totalRep = state.users.reduce((acc, u) => acc + u.rescueRep, 0);
    const topRescuer = [...state.users].sort(
      (a, b) => b.rescueRep - a.rescueRep,
    )[0];
    const competing = state.users.filter((u) => u.competeForWin === true).length;
    return {
      total,
      resolvedCount: resolved.length,
      weeklyResolved,
      avg,
      totalRep,
      topRescuer,
      builders: state.users.length,
      competing,
    };
  }, [state]);

  const startedAt = state.cohort?.startedAt
    ? new Date(state.cohort.startedAt)
    : null;
  const weeksRunning = startedAt
    ? Math.max(
        1,
        Math.round((Date.now() - startedAt.getTime()) / (7 * 24 * 60 * 60 * 1000)),
      )
    : 0;

  return (
    <div className="space-y-12">
      <header>
        <p className="text-muted-foreground text-xs font-medium">
          {state.cohort?.name ?? "Cohort"} · Week {weeksRunning}
        </p>
        <h1 className="text-foreground mt-2 text-4xl font-semibold tracking-tight sm:text-5xl">
          The cohort, in numbers.
        </h1>
        <p className="text-muted-foreground mt-3 max-w-2xl text-sm">
          A snapshot of what {state.cohort?.name ?? "the cohort"} has shipped.
          Pulled live from the rescue network we built and use ourselves.
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Hero
          icon={LifeBuoy}
          label="SOSes launched"
          value={stats.total.toString()}
        />
        <Hero
          icon={CheckCircle2}
          label="SOSes resolved"
          value={stats.resolvedCount.toString()}
          sub={`${stats.weeklyResolved} this week`}
          accent="emerald"
        />
        <Hero
          icon={Clock}
          label="Avg time to resolve"
          value={stats.avg > 0 ? `${stats.avg}m` : "·"}
        />
        <Hero
          icon={Users}
          label="Builders shipping"
          value={stats.builders.toString()}
          sub={`${stats.competing} competing`}
        />
        <Hero
          icon={Zap}
          label="Total Rescue Rep awarded"
          value={stats.totalRep.toString()}
        />
        <Hero
          icon={Trophy}
          label="Top rescuer"
          value={stats.topRescuer?.name?.split(" ")[0] ?? "·"}
          sub={
            stats.topRescuer ? `${stats.topRescuer.rescueRep} rep` : ""
          }
          accent="amber"
        />
      </section>

      <section className="border-border bg-muted/20 rounded-lg border p-8">
        <h2 className="text-foreground text-lg font-semibold">
          The compounding loop
        </h2>
        <p className="text-muted-foreground mt-2 max-w-2xl text-sm">
          Every SOS resolved is a fix saved. Every fix saved is a question the
          next builder will never have to ask. The longer this cohort runs,
          the smarter the network gets.
        </p>
        <div className="mt-6 grid gap-3 sm:grid-cols-4">
          {[
            { label: "Launch", body: "30 seconds, in or out of Cursor" },
            { label: "Claim", body: "AI surfaces who can help fastest" },
            { label: "Resolve", body: "Credit teammates, save the fix" },
            { label: "Compound", body: "Searchable cohort memory forever" },
          ].map(({ label, body }, i) => (
            <div
              key={label}
              className="border-border bg-background rounded-md border p-4"
            >
              <div className="text-muted-foreground text-[10px] font-medium tabular-nums">
                0{i + 1}
              </div>
              <div className="text-foreground mt-1 font-semibold">{label}</div>
              <p className="text-muted-foreground mt-1 text-xs leading-relaxed">
                {body}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-border border-t pt-8">
        <h2 className="text-foreground text-base font-semibold">
          Want to embed this in your own site?
        </h2>
        <p className="text-muted-foreground mt-1 text-sm">
          The stats above also render at <code className="bg-muted rounded px-1 py-0.5 text-xs">/embed/stats</code> as a
          standalone widget. Drop it on the cohort homepage as an iframe.
        </p>
        <pre className="border-border bg-muted/40 mt-3 overflow-x-auto rounded-md border p-3 font-mono text-[11px]">
{`<iframe src="https://cohort-sos.vercel.app/embed/stats" width="100%" height="220" style="border:0"></iframe>`}
        </pre>
      </section>
    </div>
  );
}

function Hero({
  icon: Icon,
  label,
  value,
  sub,
  accent,
}: {
  icon: typeof Trophy;
  label: string;
  value: string;
  sub?: string;
  accent?: "amber" | "emerald";
}) {
  const tint =
    accent === "amber"
      ? "border-amber-200 bg-amber-50/40 dark:bg-amber-950/10"
      : accent === "emerald"
        ? "border-emerald-200 bg-emerald-50/40 dark:bg-emerald-950/10"
        : "border-border bg-background";
  return (
    <div className={"rounded-lg border p-6 " + tint}>
      <Icon className="text-muted-foreground size-5" />
      <div className="text-foreground mt-4 text-4xl font-semibold tabular-nums leading-none sm:text-5xl">
        {value}
      </div>
      <div className="text-foreground mt-3 text-sm font-medium">{label}</div>
      {sub ? (
        <div className="text-muted-foreground mt-0.5 text-xs">{sub}</div>
      ) : null}
    </div>
  );
}
