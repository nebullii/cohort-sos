"use client";

import {
  ExternalLink,
  GitBranch,
  Globe,
  Play,
  Trophy,
} from "lucide-react";
import { useStore } from "@/lib/store";
import type { User } from "@/lib/types";

export default function CohortPage() {
  const { state } = useStore();
  const byName = (a: { name: string }, b: { name: string }) =>
    a.name.localeCompare(b.name);

  const members = [...state.users].sort(byName);
  const competing = members.filter((m) => m.competeForWin === true);
  const others = members.filter((m) => m.competeForWin !== true);
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
          Cursor Boston submissions repo. When a new member submits, they
          appear here automatically.
        </p>
      </header>

      <section className="grid grid-cols-3 gap-px overflow-hidden rounded-lg border border-border bg-border">
        <Stat label="Builders" value={members.length.toString()} />
        <Stat
          label="Competing for the win"
          value={competing.length.toString()}
          icon={Trophy}
        />
        <Stat label="Live submissions" value={submissions.toString()} />
      </section>

      {competing.length > 0 ? (
        <section>
          <div className="mb-3 flex items-center gap-2">
            <Trophy className="size-4 text-amber-600" />
            <h2 className="text-foreground text-sm font-semibold">
              Competing for the win
            </h2>
            <span className="text-muted-foreground text-xs">
              {competing.length} of {members.length}
            </span>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {competing.map((m) => (
              <MemberCard key={m.id} m={m} highlight />
            ))}
          </div>
        </section>
      ) : null}

      {others.length > 0 ? (
        <section>
          <h2 className="text-muted-foreground mb-3 text-[11px] font-semibold uppercase tracking-wide">
            Also in the cohort
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {others.map((m) => (
              <MemberCard key={m.id} m={m} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}

function MemberCard({ m, highlight }: { m: User; highlight?: boolean }) {
  return (
    <article
      className={
        "overflow-hidden rounded-lg border p-5 " +
        (highlight
          ? "border-amber-200 bg-amber-50/30 dark:bg-amber-950/10"
          : "border-border bg-background")
      }
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
          <h3 className="text-foreground text-base font-semibold leading-tight">
            {m.name}
          </h3>
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
        {highlight ? (
          <span className="bg-amber-100 text-amber-800 border-amber-200 inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium dark:bg-amber-950/40 dark:text-amber-300">
            <Trophy className="size-3" />
            Competing
          </span>
        ) : null}
      </div>

      {m.loomUrl ? (
        <div className="border-border bg-black mt-4 overflow-hidden rounded-md border">
          <LoomEmbed url={m.loomUrl} />
        </div>
      ) : null}

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

function LoomEmbed({ url }: { url: string }) {
  // Loom share URLs look like https://www.loom.com/share/<id>; embed is
  // https://www.loom.com/embed/<id>. Fall back to the raw link if we can't parse.
  const match = url.match(/loom\.com\/(?:share|embed)\/([a-z0-9]+)/i);
  if (!match) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noreferrer"
        className="text-muted-foreground block p-3 text-xs"
      >
        Open Loom
      </a>
    );
  }
  return (
    <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
      <iframe
        src={`https://www.loom.com/embed/${match[1]}?hideEmbedTopBar=true`}
        allow="fullscreen"
        loading="lazy"
        title="Loom demo"
        className="absolute inset-0 size-full"
      />
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
