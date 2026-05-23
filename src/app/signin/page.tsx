"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Check, GitBranch, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useStore } from "@/lib/store";

interface VerifyResult {
  verified: boolean;
  member?: {
    githubHandle: string;
    name: string;
    photoUrl?: string;
    repoUrl?: string;
    liveUrl?: string;
    loomUrl?: string;
    pitch?: string;
    competeForWin?: boolean;
  };
}

export default function SignInPage() {
  const router = useRouter();
  const { setCurrentUserByHandle } = useStore();
  const [handle, setHandle] = useState("");
  const [status, setStatus] = useState<
    "idle" | "verifying" | "ok" | "missing" | "error"
  >("idle");
  const [member, setMember] = useState<VerifyResult["member"] | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const clean = handle.replace(/^@/, "").trim();
    if (!clean) return;
    setStatus("verifying");
    try {
      const res = await fetch(
        `/api/cohort/verify?handle=${encodeURIComponent(clean)}`,
      );
      if (res.status === 404) {
        setStatus("missing");
        return;
      }
      if (!res.ok) throw new Error(`status ${res.status}`);
      const data = (await res.json()) as VerifyResult;
      if (!data.verified || !data.member) {
        setStatus("missing");
        return;
      }
      setMember(data.member);
      setStatus("ok");
    } catch {
      setStatus("error");
    }
  }

  function handleClaim() {
    if (!member) return;
    setCurrentUserByHandle(member.githubHandle, {
      name: member.name,
      avatarUrl: member.photoUrl ?? "",
      projectRepoUrl: member.repoUrl,
      projectLiveUrl: member.liveUrl,
      loomUrl: member.loomUrl,
      pitch: member.pitch,
      competeForWin: member.competeForWin,
    });
    router.push("/board");
  }

  return (
    <div className="bg-background flex min-h-screen items-center justify-center px-4">
      <div className="border-border bg-background w-full max-w-md rounded-lg border p-7">
        <Link
          href="/"
          className="text-foreground flex items-center gap-2 text-[15px] font-semibold tracking-tight"
        >
          <span className="bg-foreground size-2 rounded-full" />
          Cohort SOS
        </Link>
        <h1 className="text-foreground mt-6 text-2xl font-semibold tracking-tight">
          Sign in
        </h1>
        <p className="text-muted-foreground mt-1.5 text-sm">
          Cursor Boston · Summer Cohort 1. We verify you against the cohort
          submissions repo.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="handle">GitHub handle</Label>
            <div className="relative">
              <GitBranch className="text-muted-foreground absolute left-3 top-1/2 size-4 -translate-y-1/2" />
              <Input
                id="handle"
                value={handle}
                onChange={(e) => {
                  setHandle(e.target.value);
                  setStatus("idle");
                }}
                placeholder="nebullii"
                className="pl-9"
                autoComplete="off"
                autoFocus
              />
            </div>
          </div>

          {status === "missing" ? (
            <p className="text-amber-600 flex items-start gap-1.5 text-xs">
              <AlertCircle className="mt-0.5 size-3.5 shrink-0" />
              <span>
                We don&apos;t see <strong>@{handle}</strong> in Cohort 1 yet.
                Ask Roger to add your submission, or{" "}
                <Link href="/board" className="underline">
                  browse as guest
                </Link>
                .
              </span>
            </p>
          ) : null}
          {status === "error" ? (
            <p className="text-red-600 text-xs">
              Couldn&apos;t reach the cohort repo. Try again.
            </p>
          ) : null}

          {status !== "ok" ? (
            <Button
              type="submit"
              className="w-full"
              disabled={status === "verifying" || !handle.trim()}
            >
              {status === "verifying" ? "Verifying…" : "Continue"}
              {status !== "verifying" ? <ArrowRight className="size-3.5" /> : null}
            </Button>
          ) : null}
        </form>

        {status === "ok" && member ? (
          <div className="border-border bg-muted/40 mt-4 rounded-md border p-4">
            <div className="flex items-center gap-3">
              {member.photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={member.photoUrl}
                  alt={member.name}
                  className="size-10 rounded-full"
                />
              ) : (
                <div className="bg-muted size-10 rounded-full" />
              )}
              <div className="min-w-0">
                <div className="text-foreground flex items-center gap-1.5 text-sm font-semibold">
                  <Check className="text-emerald-600 size-3.5" />
                  {member.name}
                </div>
                <div className="text-muted-foreground text-xs">
                  @{member.githubHandle}
                </div>
              </div>
            </div>
            <Button onClick={handleClaim} className="mt-4 w-full">
              Continue as {member.name} <ArrowRight className="size-3.5" />
            </Button>
          </div>
        ) : null}

        <p className="text-muted-foreground mt-6 text-[11px] leading-relaxed">
          Trust-based until GitHub OAuth lands. Anyone with a real cohort
          submission can claim their handle. Not in Cohort 1?{" "}
          <Link href="/board" className="underline">
            Browse as guest
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
