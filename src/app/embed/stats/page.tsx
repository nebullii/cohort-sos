"use client";

import { useMemo } from "react";
import { useStore } from "@/lib/store";

export default function EmbedStatsPage() {
  const { state } = useStore();

  const stats = useMemo(() => {
    const resolved = state.sosRequests.filter((s) => s.status === "resolved");
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
    return {
      total: state.sosRequests.length,
      resolvedCount: resolved.length,
      builders: state.users.length,
      avg,
    };
  }, [state]);

  return (
    <div className="bg-background text-foreground min-h-screen p-6">
      <div className="mx-auto max-w-3xl">
        <p className="text-muted-foreground text-[11px] font-medium uppercase tracking-wide">
          {state.cohort?.name ?? "Cohort"}
        </p>
        <h1 className="text-foreground mt-1 text-lg font-semibold tracking-tight">
          Cohort SOS · Live stats
        </h1>
        <div className="border-border mt-3 grid grid-cols-2 gap-px overflow-hidden rounded-lg border bg-border sm:grid-cols-4">
          <Cell label="SOSes launched" value={stats.total.toString()} />
          <Cell
            label="Resolved"
            value={stats.resolvedCount.toString()}
          />
          <Cell
            label="Avg minutes to resolve"
            value={stats.avg > 0 ? `${stats.avg}m` : "·"}
          />
          <Cell label="Builders" value={stats.builders.toString()} />
        </div>
        <p className="text-muted-foreground mt-2 text-[10px]">
          Powered by{" "}
          <a
            href="https://cohort-sos.vercel.app"
            target="_blank"
            rel="noreferrer"
            className="underline"
          >
            Cohort SOS
          </a>
        </p>
      </div>
    </div>
  );
}

function Cell({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-background px-3 py-3">
      <div className="text-foreground text-xl font-semibold tabular-nums leading-none">
        {value}
      </div>
      <div className="text-muted-foreground mt-1 text-[10px]">{label}</div>
    </div>
  );
}
