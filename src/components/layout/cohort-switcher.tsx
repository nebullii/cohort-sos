"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, Plus } from "lucide-react";
import Link from "next/link";
import { useStore } from "@/lib/store";
import { BUILT_IN_COHORTS, type CohortConfig } from "@/lib/cohorts";
import { loadDraftCohorts } from "@/lib/draft-cohort";

export function CohortSwitcher() {
  const { activeCohortSlug, setActiveCohortSlug } = useStore();
  const [open, setOpen] = useState(false);
  const [drafts, setDrafts] = useState<CohortConfig[]>([]);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setDrafts(loadDraftCohorts());
  }, [open]);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  const all = [...BUILT_IN_COHORTS, ...drafts.filter((d) => !BUILT_IN_COHORTS.find((b) => b.slug === d.slug))];
  if (all.length <= 1 && drafts.length === 0) {
    return (
      <span className="border-border text-muted-foreground hidden h-5 items-center rounded-md border px-1.5 text-[11px] sm:inline-flex">
        {BUILT_IN_COHORTS[0]?.name ?? "Cohort"}
      </span>
    );
  }

  const active = all.find((c) => c.slug === activeCohortSlug) ?? all[0];

  return (
    <div ref={ref} className="relative hidden sm:block">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="border-border hover:bg-muted text-muted-foreground hover:text-foreground inline-flex h-5 items-center gap-1 rounded-md border px-1.5 text-[11px]"
      >
        {active?.name ?? "Cohort"}
        <ChevronDown className="size-3" />
      </button>
      {open ? (
        <div className="bg-popover border-border absolute left-0 top-7 z-40 w-64 rounded-md border shadow-md">
          <ul className="py-1">
            {all.map((c) => {
              const isDraft = !BUILT_IN_COHORTS.find((b) => b.slug === c.slug);
              return (
                <li key={c.slug}>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveCohortSlug(c.slug);
                      setOpen(false);
                    }}
                    className="hover:bg-muted text-foreground flex w-full items-start gap-2 px-3 py-2 text-left text-sm"
                  >
                    <Check
                      className={
                        "size-3.5 shrink-0 translate-y-0.5 " +
                        (c.slug === activeCohortSlug
                          ? "text-foreground"
                          : "text-transparent")
                      }
                    />
                    <div className="min-w-0 flex-1">
                      <div className="text-foreground line-clamp-1 font-medium">
                        {c.name}
                      </div>
                      <div className="text-muted-foreground text-[11px]">
                        /c/{c.slug}
                        {isDraft ? " · local draft" : ""}
                      </div>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
          <div className="border-border border-t p-1">
            <Link
              href="/onboarding"
              onClick={() => setOpen(false)}
              className="text-muted-foreground hover:bg-muted hover:text-foreground flex items-center gap-2 rounded px-3 py-2 text-sm"
            >
              <Plus className="size-3.5" />
              Add a new cohort
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  );
}
