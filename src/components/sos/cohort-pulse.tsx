"use client";

import { useMemo } from "react";
import { Activity, CheckCircle2, Clock, Users } from "lucide-react";
import { useStore } from "@/lib/store";
import { usePresenceCount } from "@/lib/presence";
import { timeAgo } from "@/lib/format";

interface Event {
  id: string;
  text: string;
  at: string;
}

export function CohortPulse() {
  const { state } = useStore();
  const online = usePresenceCount();

  const { weekSos, weekResolved, avgMinutesToResolve, recent } = useMemo(() => {
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

    const recentLaunches = state.sosRequests.filter(
      (s) => new Date(s.createdAt).getTime() >= sevenDaysAgo,
    );

    const resolvedThisWeek = state.sosRequests.filter(
      (s) =>
        s.status === "resolved" &&
        s.resolvedAt &&
        new Date(s.resolvedAt).getTime() >= sevenDaysAgo,
    );

    const resolveDurations = state.sosRequests
      .filter((s) => s.status === "resolved" && s.resolvedAt)
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

    const events: Event[] = [];
    for (const sos of state.sosRequests) {
      const requester = state.users.find((u) => u.id === sos.requesterId);
      events.push({
        id: `launch-${sos.id}`,
        text: `${requester?.name ?? "Someone"} launched “${sos.title}”`,
        at: sos.createdAt,
      });
      if (sos.status === "resolved" && sos.resolvedAt) {
        const helper =
          state.users.find((u) => u.id === sos.helperIds[0])?.name ?? "Helpers";
        events.push({
          id: `resolve-${sos.id}`,
          text: `${helper} resolved “${sos.title}”`,
          at: sos.resolvedAt,
        });
      }
      for (const comment of sos.comments.slice(-1)) {
        const user = state.users.find((u) => u.id === comment.userId);
        events.push({
          id: `comment-${comment.id}`,
          text: `${user?.name ?? "Someone"} replied on “${sos.title}”`,
          at: comment.createdAt,
        });
      }
    }
    events.sort(
      (a, b) => new Date(b.at).getTime() - new Date(a.at).getTime(),
    );

    return {
      weekSos: recentLaunches.length,
      weekResolved: resolvedThisWeek.length,
      avgMinutesToResolve: avg,
      recent: events.slice(0, 6),
    };
  }, [state.sosRequests, state.users]);

  return (
    <div className="border-border bg-background mb-4 overflow-hidden rounded-lg border">
      <div className="grid grid-cols-2 gap-px bg-border md:grid-cols-4">
        <Stat
          icon={Users}
          label="Online now"
          value={online.toString()}
          accent
        />
        <Stat icon={Activity} label="SOS this week" value={weekSos.toString()} />
        <Stat
          icon={CheckCircle2}
          label="Resolved this week"
          value={weekResolved.toString()}
        />
        <Stat
          icon={Clock}
          label="Avg time to resolve"
          value={avgMinutesToResolve > 0 ? `${avgMinutesToResolve}m` : "·"}
        />
      </div>

      {recent.length > 0 ? (
        <div className="border-border flex items-center gap-2 overflow-x-auto border-t px-4 py-2.5 text-xs">
          <span className="text-muted-foreground bg-muted shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide">
            Live
          </span>
          <div className="flex items-center gap-4 whitespace-nowrap">
            {recent.map((event) => (
              <span
                key={event.id}
                className="text-muted-foreground inline-flex items-center gap-1.5"
              >
                <span className="text-foreground">{event.text}</span>
                <span className="text-muted-foreground/70">
                  · {timeAgo(event.at)}
                </span>
              </span>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: typeof Activity;
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="bg-background flex items-center gap-3 px-4 py-3">
      <span
        className={
          "border-border grid size-8 place-items-center rounded-md border " +
          (accent ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40" : "")
        }
      >
        <Icon className="size-4" />
      </span>
      <div className="min-w-0">
        <div className="text-foreground text-base font-semibold tabular-nums leading-none">
          {value}
        </div>
        <div className="text-muted-foreground mt-0.5 text-[11px]">{label}</div>
      </div>
    </div>
  );
}
