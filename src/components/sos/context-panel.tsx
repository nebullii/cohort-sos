"use client";

import Link from "next/link";
import { ArrowRight, ExternalLink } from "lucide-react";
import { useStore } from "@/lib/store";
import type { SosRequest } from "@/lib/types";
import { UserAvatar } from "./user-avatar";

interface ContextPanelProps {
  sos: SosRequest | null;
}

export function ContextPanel({ sos }: ContextPanelProps) {
  const { state } = useStore();

  if (!sos) {
    return (
      <aside className="bg-background border-border hidden h-full overflow-y-auto border-l lg:block">
        <div className="text-muted-foreground p-6 text-center text-sm">
          No request selected.
        </div>
      </aside>
    );
  }

  const requester = state.users.find((u) => u.id === sos.requesterId);
  const helpers = sos.helperIds
    .map((id) => state.users.find((u) => u.id === id))
    .filter((u): u is NonNullable<typeof u> => Boolean(u));
  const ranked = [...state.users]
    .sort((a, b) => b.rescueRep - a.rescueRep)
    .slice(0, 5);

  return (
    <aside className="bg-background border-border hidden h-full min-h-0 overflow-y-auto border-l lg:block">
      <Section title="Details">
        <DetailRow label="Requester" value={requester?.name ?? "·"} />
        <DetailRow label="Time" value={`${sos.timeNeededMinutes} min`} />
        <DetailRow
          label="Repo"
          value={
            sos.repoUrl ? (
              <ExternalAnchor href={sos.repoUrl}>
                {sos.repoUrl.replace(/^https?:\/\//, "")}
              </ExternalAnchor>
            ) : (
              <span className="text-muted-foreground">·</span>
            )
          }
        />
        <DetailRow
          label="Live"
          value={
            sos.liveUrl ? (
              <ExternalAnchor href={sos.liveUrl}>
                {sos.liveUrl.replace(/^https?:\/\//, "")}
              </ExternalAnchor>
            ) : (
              <span className="text-muted-foreground">·</span>
            )
          }
        />
      </Section>

      <Section title="Helpers">
        {helpers.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            No helpers yet.
          </p>
        ) : (
          <ul className="space-y-2.5">
            {helpers.map((helper) => (
              <li
                key={helper.id}
                className="grid grid-cols-[auto_1fr] items-center gap-2.5"
              >
                <UserAvatar user={helper} className="size-7" />
                <div className="min-w-0">
                  <div className="text-sm font-medium">{helper.name}</div>
                  <div className="text-muted-foreground text-xs">
                    {helper.rescueRep} rep
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section
        title="Top Rescuers"
        action={
          <Link
            href="/leaderboard"
            className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-xs"
          >
            View all <ArrowRight className="size-3" />
          </Link>
        }
      >
        <ul className="space-y-2">
          {ranked.map((user, i) => (
            <li
              key={user.id}
              className="grid grid-cols-[auto_1fr_auto] items-center gap-2.5"
            >
              <span className="text-muted-foreground w-4 text-right text-xs tabular-nums">
                {i + 1}
              </span>
              <div className="min-w-0">
                <div className="truncate text-sm">{user.name}</div>
              </div>
              <span className="text-foreground text-sm font-medium tabular-nums">
                {user.rescueRep}
              </span>
            </li>
          ))}
        </ul>
      </Section>
    </aside>
  );
}

interface SectionProps {
  title: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}

function Section({ title, children, action }: SectionProps) {
  return (
    <section className="border-border border-b px-5 py-4 last:border-b-0">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-muted-foreground text-[11px] font-medium uppercase tracking-wide">
          {title}
        </h2>
        {action}
      </div>
      {children}
    </section>
  );
}

interface DetailRowProps {
  label: string;
  value: React.ReactNode;
}

function DetailRow({ label, value }: DetailRowProps) {
  return (
    <div className="mb-2.5 grid grid-cols-[80px_1fr] gap-3 text-sm last:mb-0">
      <div className="text-muted-foreground text-xs">{label}</div>
      <div className="text-foreground break-words">{value}</div>
    </div>
  );
}

function ExternalAnchor({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="text-foreground hover:underline inline-flex items-center gap-1 break-all"
    >
      {children}
      <ExternalLink className="size-3 shrink-0 opacity-60" />
    </a>
  );
}
