"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Bell } from "lucide-react";
import { useStore } from "@/lib/store";
import { timeAgo } from "@/lib/format";
import { Dot, urgencyTone } from "./pills";
import { cn } from "@/lib/utils";

export function NotificationsBell() {
  const { state } = useStore();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const me = state.users.find((u) => u.id === state.currentUserId);
  const mySkills = new Set(me?.skills ?? []);

  const relevant = state.sosRequests
    .filter((sos) => {
      if (sos.status === "resolved") return false;
      const involved =
        sos.requesterId === state.currentUserId ||
        sos.helperIds.includes(state.currentUserId);
      const inSkill = mySkills.has(sos.category);
      return involved || inSkill;
    })
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    .slice(0, 6);

  const count = relevant.length;

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "border-border text-foreground hover:bg-muted relative inline-flex h-7 w-7 items-center justify-center rounded-md border outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring",
          open && "bg-muted",
        )}
        aria-label={`${count} relevant SOS${count === 1 ? "" : "es"}`}
      >
        <Bell className="size-3.5" />
        {count > 0 ? (
          <span className="bg-foreground text-background absolute -right-1 -top-1 inline-flex h-3.5 min-w-[0.875rem] items-center justify-center rounded-full px-1 text-[10px] font-semibold leading-none">
            {count > 9 ? "9+" : count}
          </span>
        ) : null}
      </button>

      {open ? (
        <div className="bg-popover text-popover-foreground border-border absolute right-0 top-9 z-40 w-80 rounded-md border shadow-md">
          <div className="border-border flex items-baseline justify-between border-b px-3 py-2">
            <h3 className="text-sm font-semibold">For you</h3>
            <span className="text-muted-foreground text-[11px]">
              Based on your skills
            </span>
          </div>
          {relevant.length === 0 ? (
            <div className="text-muted-foreground p-6 text-center text-sm">
              You&apos;re all caught up.
            </div>
          ) : (
            <ul className="max-h-80 overflow-y-auto py-1">
              {relevant.map((sos) => {
                const requester = state.users.find(
                  (u) => u.id === sos.requesterId,
                );
                return (
                  <li key={sos.id}>
                    <Link
                      href={`/board/${sos.id}`}
                      onClick={() => setOpen(false)}
                      className="hover:bg-muted block px-3 py-2"
                    >
                      <div className="flex items-center gap-2">
                        <Dot tone={urgencyTone(sos.urgency)} />
                        <span className="text-foreground line-clamp-1 flex-1 text-sm font-medium">
                          {sos.title}
                        </span>
                        <span className="text-muted-foreground shrink-0 text-[11px]">
                          {timeAgo(sos.createdAt)}
                        </span>
                      </div>
                      <div className="text-muted-foreground mt-0.5 text-[11px]">
                        {requester?.name ?? "Unknown"} · {sos.category}
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      ) : null}
    </div>
  );
}
