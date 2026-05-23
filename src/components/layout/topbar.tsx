"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store";
import { useTheme } from "@/lib/theme";
import { LaunchDialog } from "@/components/sos/launch-dialog";
import { ProfileDialog } from "@/components/sos/profile-dialog";
import { NotificationsBell } from "@/components/sos/notifications-bell";
import { UserAvatar } from "@/components/sos/user-avatar";
import { CohortSwitcher } from "@/components/layout/cohort-switcher";
import { onShortcut } from "@/lib/shortcut-bus";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/board", label: "Help" },
  { href: "/cohort", label: "Cohort" },
  { href: "/leaderboard", label: "Leaderboard" },
  { href: "/knowledge", label: "Knowledge" },
] as const;

export function Topbar() {
  const { state, reset } = useStore();
  const { theme, toggle } = useTheme();
  const pathname = usePathname();
  const [launchOpen, setLaunchOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const me = state.users.find((u) => u.id === state.currentUserId);

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
        <CohortSwitcher />

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

        <div className="ml-auto flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={toggle}
            aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          >
            {theme === "dark" ? (
              <Sun className="size-4" />
            ) : (
              <Moon className="size-4" />
            )}
          </Button>
          <NotificationsBell />
          {me?.githubHandle === "nebullii" ? (
            <Button variant="ghost" size="sm" onClick={reset} title="Dev only">
              Reset
            </Button>
          ) : null}
          <Button size="sm" onClick={() => setLaunchOpen(true)}>
            New SOS
            <kbd className="border-foreground/20 bg-foreground/10 text-foreground/80 ml-1.5 hidden rounded border px-1 text-[10px] font-medium sm:inline-block">
              ⌘N
            </kbd>
          </Button>
          {me ? (
            <button
              type="button"
              onClick={() => setProfileOpen(true)}
              className="ml-1 rounded-full ring-offset-background outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              aria-label="Edit profile"
            >
              <UserAvatar user={me} className="size-7" />
            </button>
          ) : null}
        </div>
      </div>

      <LaunchDialog open={launchOpen} onOpenChange={setLaunchOpen} />
      <ProfileDialog open={profileOpen} onOpenChange={setProfileOpen} />
    </header>
  );
}
