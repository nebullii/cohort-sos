"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Share2 } from "lucide-react";
import type { SosRequest, User } from "@/lib/types";

interface SocialShareProps {
  sos: SosRequest;
  helpers: User[];
  cohortName: string;
}

function minutesBetween(a: string, b: string): number {
  return Math.max(
    1,
    Math.round((new Date(b).getTime() - new Date(a).getTime()) / 60000),
  );
}

export function SocialShare({ sos, helpers, cohortName }: SocialShareProps) {
  const minutes = sos.resolvedAt ? minutesBetween(sos.createdAt, sos.resolvedAt) : 0;
  const helperNames = helpers
    .map((h) => h.name.split(" ")[0])
    .filter(Boolean)
    .join(" + ");

  const tweet = useMemo(() => {
    if (!minutes) return "";
    const cred = helperNames ? `Saved by ${helperNames}.` : "";
    return `Got unblocked in ${minutes} minutes by my cohort. ${sos.title}. ${cred} ${cohortName}. #cohortsos`.trim();
  }, [minutes, helperNames, sos.title, cohortName]);

  const linkedIn = useMemo(() => {
    if (!minutes) return "";
    const cred = helperNames
      ? `Saved by ${helperNames}.`
      : `Saved by my cohort.`;
    const fix = sos.fixNote
      ? `\n\nFix: ${sos.fixNote.length > 220 ? sos.fixNote.slice(0, 220) + "…" : sos.fixNote}`
      : "";
    return `${sos.title} - unblocked in ${minutes} minutes by my cohort. ${cred}${fix}\n\nBuilding Cohort SOS as part of ${cohortName}. Every rescue becomes searchable cohort memory.`;
  }, [minutes, helperNames, sos.title, sos.fixNote, cohortName]);

  const [copied, setCopied] = useState<"tweet" | "linkedin" | null>(null);

  async function copy(kind: "tweet" | "linkedin") {
    const text = kind === "tweet" ? tweet : linkedIn;
    if (!text) return;
    await navigator.clipboard.writeText(text);
    setCopied(kind);
    setTimeout(() => setCopied(null), 1500);
  }

  if (!minutes) return null;

  return (
    <div className="border-border bg-muted/30 mt-4 rounded-md border p-3">
      <div className="text-foreground flex items-center gap-1.5 text-xs font-semibold">
        <Share2 className="size-3.5" />
        Brag about it
      </div>
      <p className="text-muted-foreground mt-1 text-[11px]">
        AI-drafted, copy-ready captions. Edit freely.
      </p>

      <div className="mt-3 space-y-3">
        <div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground text-[11px] font-medium uppercase tracking-wide">
              Tweet
            </span>
            <button
              type="button"
              onClick={() => copy("tweet")}
              className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-[11px]"
            >
              {copied === "tweet" ? (
                <Check className="size-3" />
              ) : (
                <Copy className="size-3" />
              )}
              {copied === "tweet" ? "Copied" : "Copy"}
            </button>
          </div>
          <p className="text-foreground border-border bg-background mt-1 rounded border p-2 text-xs leading-relaxed">
            {tweet}
          </p>
        </div>

        <div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground text-[11px] font-medium uppercase tracking-wide">
              LinkedIn
            </span>
            <button
              type="button"
              onClick={() => copy("linkedin")}
              className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-[11px]"
            >
              {copied === "linkedin" ? (
                <Check className="size-3" />
              ) : (
                <Copy className="size-3" />
              )}
              {copied === "linkedin" ? "Copied" : "Copy"}
            </button>
          </div>
          <p className="text-foreground border-border bg-background mt-1 whitespace-pre-line rounded border p-2 text-xs leading-relaxed">
            {linkedIn}
          </p>
        </div>
      </div>
    </div>
  );
}
