"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Check, Copy, ExternalLink, GitBranch, Sparkles } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { CohortConfig } from "@/lib/cohorts";
import { saveDraftCohort } from "@/lib/draft-cohort";

const REPO = "nebullii/cohort-sos";

function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);
}

export default function OnboardingPage() {
  const [name, setName] = useState("");
  const [motto, setMotto] = useState("Ship together, get unblocked together.");
  const [slug, setSlug] = useState("");
  const [sourceOwner, setSourceOwner] = useState("");
  const [sourceRepo, setSourceRepo] = useState("");
  const [sourceRef, setSourceRef] = useState("main");
  const [sourcePath, setSourcePath] = useState("submissions");
  const [startedAt, setStartedAt] = useState(
    new Date().toISOString().slice(0, 10),
  );
  const [endsAt, setEndsAt] = useState(
    new Date(Date.now() + 1000 * 60 * 60 * 24 * 56)
      .toISOString()
      .slice(0, 10),
  );
  const [verifyStatus, setVerifyStatus] = useState<
    "idle" | "checking" | "ok" | "missing" | "error"
  >("idle");
  const [verifyDetail, setVerifyDetail] = useState("");
  const [memberCount, setMemberCount] = useState(0);
  const [copied, setCopied] = useState(false);
  const [savedLocally, setSavedLocally] = useState(false);

  const effectiveSlug = slug || slugify(name);
  const config: CohortConfig = useMemo(
    () => ({
      slug: effectiveSlug,
      name: name || "New Cohort",
      motto,
      startedAt,
      endsAt,
      source: {
        owner: sourceOwner,
        repo: sourceRepo,
        ref: sourceRef,
        path: sourcePath,
      },
    }),
    [
      effectiveSlug,
      name,
      motto,
      startedAt,
      endsAt,
      sourceOwner,
      sourceRepo,
      sourceRef,
      sourcePath,
    ],
  );

  const configBlock = `{
  slug: "${config.slug}",
  name: "${config.name}",
  motto: "${config.motto}",
  startedAt: "${config.startedAt}",
  endsAt: "${config.endsAt}",
  source: {
    owner: "${config.source.owner}",
    repo: "${config.source.repo}",
    ref: "${config.source.ref}",
    path: "${config.source.path}",
  },
},`;

  const prUrl =
    sourceOwner && sourceRepo
      ? `https://github.com/${REPO}/edit/main/src/lib/cohorts.ts`
      : "";

  async function verifySource() {
    if (!sourceOwner || !sourceRepo || !sourcePath) {
      setVerifyStatus("error");
      setVerifyDetail("Fill in repo owner, repo name, and submissions path.");
      return;
    }
    setVerifyStatus("checking");
    setVerifyDetail("");
    try {
      const url = `https://api.github.com/repos/${sourceOwner}/${sourceRepo}/contents/${sourcePath}?ref=${encodeURIComponent(sourceRef || "main")}`;
      const res = await fetch(url);
      if (res.status === 404) {
        setVerifyStatus("missing");
        setVerifyDetail("That path doesn't exist on GitHub yet.");
        return;
      }
      if (!res.ok) {
        setVerifyStatus("error");
        setVerifyDetail(`GitHub returned ${res.status}.`);
        return;
      }
      const items = (await res.json()) as Array<{ name: string; type: string }>;
      const jsons = items.filter(
        (i) => i.type === "file" && i.name.endsWith(".json"),
      );
      setMemberCount(jsons.length);
      setVerifyStatus("ok");
      setVerifyDetail(
        `Found ${jsons.length} member submission${jsons.length === 1 ? "" : "s"}.`,
      );
    } catch (err) {
      setVerifyStatus("error");
      setVerifyDetail((err as Error).message);
    }
  }

  function tryLocally() {
    saveDraftCohort(config);
    setSavedLocally(true);
  }

  async function copyConfig() {
    await navigator.clipboard.writeText(configBlock);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="bg-background min-h-screen">
      <header className="border-border border-b">
        <div className="mx-auto flex h-14 w-full max-w-[1100px] items-center justify-between px-4 md:px-6">
          <Link
            href="/"
            className="text-foreground flex items-center gap-2 text-[15px] font-semibold tracking-tight"
          >
            <span className="bg-foreground size-2 rounded-full" />
            Cohort SOS
          </Link>
          <Link
            href="/board"
            className="text-muted-foreground hover:text-foreground text-sm"
          >
            Back to board
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[900px] px-4 py-12 md:px-6">
        <h1 className="text-foreground text-3xl font-semibold tracking-tight">
          Onboard your cohort
        </h1>
        <p className="text-muted-foreground mt-2 max-w-2xl text-sm">
          Cohort SOS uses a GitHub folder of one JSON file per member as the
          source of truth. Tell us where yours lives, preview it, and ship a
          PR to make it the default for your URL.
        </p>

        <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_360px]">
          <section className="space-y-6">
            <div className="space-y-1.5">
              <Label htmlFor="o-name">Cohort name</Label>
              <Input
                id="o-name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (!slug) setSlug(slugify(e.target.value));
                }}
                placeholder="Cursor Boston · Fall 1"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="o-slug">URL slug</Label>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground text-sm">/c/</span>
                <Input
                  id="o-slug"
                  value={effectiveSlug}
                  onChange={(e) => setSlug(slugify(e.target.value))}
                  placeholder="cursor-boston-fall-1"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="o-motto">Motto</Label>
              <Input
                id="o-motto"
                value={motto}
                onChange={(e) => setMotto(e.target.value)}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="o-start">Start date</Label>
                <Input
                  id="o-start"
                  type="date"
                  value={startedAt}
                  onChange={(e) => setStartedAt(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="o-end">End date</Label>
                <Input
                  id="o-end"
                  type="date"
                  value={endsAt}
                  onChange={(e) => setEndsAt(e.target.value)}
                />
              </div>
            </div>

            <div className="border-border bg-muted/30 space-y-3 rounded-md border p-4">
              <Label className="text-xs">
                <GitBranch className="size-3" />
                Roster source on GitHub
              </Label>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="o-owner" className="text-xs">
                    Owner / org
                  </Label>
                  <Input
                    id="o-owner"
                    value={sourceOwner}
                    onChange={(e) => setSourceOwner(e.target.value)}
                    placeholder="rogerSuperBuilderAlpha"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="o-repo" className="text-xs">
                    Repo
                  </Label>
                  <Input
                    id="o-repo"
                    value={sourceRepo}
                    onChange={(e) => setSourceRepo(e.target.value)}
                    placeholder="cursor-boston"
                  />
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="o-ref" className="text-xs">
                    Branch / ref
                  </Label>
                  <Input
                    id="o-ref"
                    value={sourceRef}
                    onChange={(e) => setSourceRef(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="o-path" className="text-xs">
                    Submissions path
                  </Label>
                  <Input
                    id="o-path"
                    value={sourcePath}
                    onChange={(e) => setSourcePath(e.target.value)}
                    placeholder="content/cohort/submissions"
                  />
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={verifySource}
                  disabled={verifyStatus === "checking"}
                >
                  {verifyStatus === "checking" ? "Checking…" : "Verify source"}
                </Button>
                {verifyStatus === "ok" ? (
                  <span className="text-emerald-700 inline-flex items-center gap-1 text-xs">
                    <Check className="size-3.5" />
                    {verifyDetail}
                  </span>
                ) : null}
                {verifyStatus === "missing" || verifyStatus === "error" ? (
                  <span className="text-red-600 text-xs">{verifyDetail}</span>
                ) : null}
              </div>
              <p className="text-muted-foreground text-[11px] leading-relaxed">
                Each member needs one JSON file at this path named after their
                GitHub handle, e.g. <code className="bg-muted rounded px-1">nebullii.json</code>.
                Required keys: <code className="bg-muted rounded px-1">githubHandle</code>, <code className="bg-muted rounded px-1">name</code>.
                Optional: <code className="bg-muted rounded px-1">photoUrl</code>, <code className="bg-muted rounded px-1">repoUrl</code>, <code className="bg-muted rounded px-1">liveUrl</code>, <code className="bg-muted rounded px-1">loomUrl</code>, <code className="bg-muted rounded px-1">pitch</code>, <code className="bg-muted rounded px-1">competeForWin</code>.
              </p>
            </div>

            <div className="border-border flex flex-wrap items-center gap-3 border-t pt-6">
              <Button
                type="button"
                onClick={tryLocally}
                disabled={!name || !sourceOwner || !sourceRepo}
              >
                <Sparkles className="size-3.5" />
                {savedLocally ? "Saved locally" : "Try it locally"}
              </Button>
              {savedLocally ? (
                <Link
                  href="/board"
                  className={buttonVariants({ variant: "outline", size: "default" })}
                >
                  Open board <ArrowRight className="size-3.5" />
                </Link>
              ) : null}
              {prUrl ? (
                <a
                  href={prUrl}
                  target="_blank"
                  rel="noreferrer"
                  className={buttonVariants({ variant: "outline" })}
                >
                  <ExternalLink className="size-3.5" />
                  Open PR to register
                </a>
              ) : null}
            </div>
            <p className="text-muted-foreground text-[11px] leading-relaxed">
              <strong>Try it locally</strong> stores this cohort in your browser
              and lets you preview your board and roster right now.
              <strong> Open PR</strong> takes you to GitHub with the config
              snippet ready to paste into <code className="bg-muted rounded px-1">src/lib/cohorts.ts</code> so
              your cohort becomes a real entry. Until persistence lands on the
              backend (Convex/Supabase), each cohort member&apos;s data lives
              locally; PR-registered cohorts share roster + URL globally.
            </p>
          </section>

          <aside className="lg:sticky lg:top-6 lg:self-start">
            <h2 className="text-muted-foreground text-[11px] font-semibold uppercase tracking-wide">
              Config preview
            </h2>
            <div className="border-border bg-muted/40 mt-2 overflow-hidden rounded-md border">
              <div className="border-border flex items-center justify-between border-b px-3 py-1.5">
                <span className="text-muted-foreground text-[10px]">
                  src/lib/cohorts.ts
                </span>
                <button
                  type="button"
                  onClick={copyConfig}
                  className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-[11px]"
                >
                  {copied ? (
                    <Check className="size-3" />
                  ) : (
                    <Copy className="size-3" />
                  )}
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>
              <pre className="overflow-x-auto p-3 font-mono text-[11px] leading-relaxed">
                {configBlock}
              </pre>
            </div>

            <div className="border-border bg-background mt-4 rounded-md border p-3 text-xs">
              <div className="text-foreground font-semibold">Your cohort URL</div>
              <code className="text-muted-foreground mt-1 block text-[11px]">
                /c/{effectiveSlug || "(slug)"}/board
              </code>
              {memberCount > 0 ? (
                <div className="text-muted-foreground mt-2">
                  {memberCount} member{memberCount === 1 ? "" : "s"} detected at
                  the source.
                </div>
              ) : null}
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
