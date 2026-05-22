"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store";
import { LaunchDialog } from "@/components/sos/launch-dialog";
import { onShortcut } from "@/lib/shortcut-bus";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/", label: "Help" },
  { href: "/leaderboard", label: "Leaderboard" },
  { href: "/knowledge", label: "Knowledge" },
] as const;

export function Topbar() {
  const { reset } = useStore();
  const pathname = usePathname();
  const [launchOpen, setLaunchOpen] = useState(false);

  useEffect(() => onShortcut("new-sos", () => setLaunchOpen(true)), []);

  return (
    <header className="bg-background border-border sticky top-0 z-30 border-b">
      <div className="mx-auto flex h-14 w-full max-w-[1480px] items-center gap-8 px-4 md:px-6">
        <Link
          href="/"
          className="text-foreground flex items-center gap-2 text-[15px] font-semibold tracking-tight"
        >
          <span className="bg-foreground size-2 rounded-full" />
          Cohort SOS
        </Link>

        <nav className="flex items-center gap-1">
          {NAV.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative rounded-md px-2.5 py-1.5 text-sm transition-colors",
                  active
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {item.label}
                {active ? (
                  <span className="bg-foreground absolute inset-x-2.5 -bottom-[15px] h-px" />
                ) : null}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={reset}>
            Reset
          </Button>
          <Button size="sm" onClick={() => setLaunchOpen(true)}>
            New SOS
            <kbd className="border-foreground/20 bg-foreground/10 text-foreground/80 ml-1.5 hidden rounded border px-1 text-[10px] font-medium sm:inline-block">
              ⌘N
            </kbd>
          </Button>
        </div>
      </div>

      <LaunchDialog open={launchOpen} onOpenChange={setLaunchOpen} />
    </header>
  );
}
