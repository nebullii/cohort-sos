"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { onShortcut } from "@/lib/shortcut-bus";

const SHORTCUTS = [
  { keys: ["⌘", "N"], action: "Launch a new SOS" },
  { keys: ["⌘", "K"], action: "Focus the SOS list search" },
  { keys: ["⌘", "↵"], action: "Send reply in the conversation" },
  { keys: ["?"], action: "Show this cheatsheet" },
  { keys: ["Esc"], action: "Close any dialog" },
];

const FORMATTING = [
  { token: "```code```", action: "Code block (triple-backticks)" },
  { token: "`code`", action: "Inline code (single backticks)" },
  { token: "https://...png", action: "Auto-embed image previews" },
  { token: "https://...", action: "Auto-link URLs" },
];

export function Cheatsheet() {
  const [open, setOpen] = useState(false);

  useEffect(() => onShortcut("show-help", () => setOpen((o) => !o)), []);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Keyboard shortcuts</DialogTitle>
          <DialogDescription>Press ? anywhere to open this.</DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          <section>
            <h3 className="text-muted-foreground mb-2 text-[11px] font-semibold uppercase tracking-wide">
              Navigation
            </h3>
            <ul className="space-y-1.5">
              {SHORTCUTS.map(({ keys, action }) => (
                <li
                  key={action}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="text-foreground">{action}</span>
                  <span className="flex items-center gap-1">
                    {keys.map((k) => (
                      <kbd
                        key={k}
                        className="border-border bg-muted text-foreground inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded border px-1 text-[11px] font-medium"
                      >
                        {k}
                      </kbd>
                    ))}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h3 className="text-muted-foreground mb-2 text-[11px] font-semibold uppercase tracking-wide">
              Message formatting
            </h3>
            <ul className="space-y-1.5">
              {FORMATTING.map(({ token, action }) => (
                <li
                  key={token}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="text-foreground">{action}</span>
                  <code className="bg-muted/70 rounded px-1.5 py-0.5 font-mono text-[12px]">
                    {token}
                  </code>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
}
