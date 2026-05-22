"use client";

import { useEffect, useState } from "react";
import { LifeBuoy, MessageSquare, CheckCircle2, X } from "lucide-react";

const KEY = "cohortSosOnboardingDismissed";

const STEPS = [
  {
    icon: LifeBuoy,
    title: "Launch an SOS",
    body: "Hit ⌘N or the New SOS button. Pick a category template to speed-fill context.",
  },
  {
    icon: MessageSquare,
    title: "Claim & reply",
    body: "Tap any open SOS to jump in. Drop clues, paste code blocks, share repros.",
  },
  {
    icon: CheckCircle2,
    title: "Resolve & credit",
    body: "Save the fix note, credit your helpers, watch the cohort memory grow.",
  },
];

export function OnboardingBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const dismissed = localStorage.getItem(KEY);
      if (!dismissed) setVisible(true);
    } catch {
      /* ignore */
    }
  }, []);

  function dismiss() {
    setVisible(false);
    try {
      localStorage.setItem(KEY, "1");
    } catch {
      /* ignore */
    }
  }

  if (!visible) return null;

  return (
    <div className="border-border bg-muted/30 relative mb-4 overflow-hidden rounded-lg border">
      <button
        type="button"
        onClick={dismiss}
        className="text-muted-foreground hover:text-foreground absolute right-3 top-3 rounded p-1"
        aria-label="Dismiss"
      >
        <X className="size-3.5" />
      </button>
      <div className="p-5">
        <h2 className="text-foreground text-base font-semibold">
          Welcome to Cohort SOS
        </h2>
        <p className="text-muted-foreground mt-1 max-w-xl text-sm">
          A rescue network for builders. Three steps to get unstuck, three steps
          to help someone else.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {STEPS.map(({ icon: Icon, title, body }) => (
            <div
              key={title}
              className="border-border bg-background rounded-md border p-3"
            >
              <Icon className="text-foreground size-4" />
              <div className="text-foreground mt-2 text-sm font-semibold">
                {title}
              </div>
              <p className="text-muted-foreground mt-1 text-xs leading-relaxed">
                {body}
              </p>
            </div>
          ))}
        </div>
        <p className="text-muted-foreground mt-3 text-xs">
          Press <kbd className="border-border bg-muted rounded border px-1">?</kbd>{" "}
          for keyboard shortcuts.
        </p>
      </div>
    </div>
  );
}
