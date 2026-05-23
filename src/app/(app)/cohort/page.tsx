"use client";

import {
  ExternalLink,
  GitBranch,
  Globe,
  Play,
  Trophy,
} from "lucide-react";
import { useStore } from "@/lib/store";

export default function CohortPage() {
  const { state } = useStore();
  const members = [...state.users].sort((a, b) =>
    a.name.localeCompare(b.name),
  );

  const competing = members.filter((m) => m.competeForWin === true).length;
  const submissions = members.filter((m) => m.projectLiveUrl).length;

  return (
    <div className="space-y-10">
      <header className="max-w-2xl">
        <p className="text-muted-foreground text-xs font-medium">
          {state.cohort?.name ?? "Cohort"}
        </p>
        <h1 className="text-foreground mt-1 text-2xl font-semibold tracking-tight">
          The Cohort
        </h1>
        <p className="text-muted-foreground mt-2 text-sm">
          {members.length} builders shipping in public. Pulled live from the
          Cursor Boston submissions repo — when a new member submits, they
          appear here automatically.
        </p>
      </header>

      <section className="grid grid-cols-3 gap-px overflow-hidden rounded-lg border border-border bg-border">
        <Stat label="Builders" value={members.length.toString()} />
        <Stat
          label="Competing for the win"
          value={competing.toString()}
          icon={Trophy}
        />
        <Stat label="Live submissions" value={submissions.toString()} />
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {members.map((m) => (
          <article
            key={m.id}
            className="border-border bg-background overflow-hidden rounded-lg border p-5"
          >
            <div className="flex items-start gap-3">
              {m.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={m.avatarUrl}
                  alt={m.name}
                  className="size-11 rounded-full"
                />
              ) : (
                <div className="bg-muted size-11 rounded-full" />
              )}
              <div className="min-w-0 flex-1">
                <h2 className="text-foreground text-base font-semibold leading-tight">
                  {m.name}
                </h2>
                <a
                  href={`https://github.com/${m.githubHandle}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-xs"
                >
                  @{m.githubHandle}
                  <ExternalLink className="size-3 opacity-60" />
                </a>
              </div>
              {m.competeForWin ? (
                <span className="bg-amber-50 text-amber-700 border-amber-200 inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium dark:bg-amber-950/40">
                  <Trophy className="size-3" />
                  Competing
                </span>
              ) : null}
            </div>

            {m.pitch ? (
              <p className="text-muted-foreground mt-4 line-clamp-3 text-sm leading-relaxed">
                “{m.pitch}”
              </p>
            ) : null}

            <div className="border-border mt-4 flex flex-wrap gap-2 border-t pt-4">
              {m.projectRepoUrl ? (
                <ProjectLink href={m.projectRepoUrl} icon={GitBranch} label="Repo" />
              ) : null}
              {m.projectLiveUrl ? (
                <ProjectLink href={m.projectLiveUrl} icon={Globe} label="Live" />
              ) : null}
              {m.loomUrl ? (
                <ProjectLink href={m.loomUrl} icon={Play} label="Loom" />
              ) : null}
            </div>

            {m.skills.length > 0 ? (
              <div className="text-muted-foreground mt-3 text-[11px]">
                {m.skills.join(" · ")}
              </div>
            ) : null}
          </article>
        ))}
      </section>
    </div>
  );
}

function Stat({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon?: typeof Trophy;
}) {
  return (
    <div className="bg-background flex items-center gap-3 px-5 py-4">
      {Icon ? (
        <span className="border-border grid size-8 place-items-center rounded-md border">
          <Icon className="size-4" />
        </span>
      ) : null}
      <div>
        <div className="text-foreground text-2xl font-semibold tabular-nums leading-none">
          {value}
        </div>
        <div className="text-muted-foreground mt-1 text-[11px]">{label}</div>
      </div>
    </div>
  );
}

function ProjectLink({
  href,
  icon: Icon,
  label,
}: {
  href: string;
  icon: typeof GitBranch;
  label: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="border-border text-foreground hover:bg-muted inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium transition-colors"
    >
      <Icon className="size-3" />
      {label}
      <ExternalLink className="size-2.5 opacity-60" />
    </a>
  );
}
