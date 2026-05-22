"use client";

import { useEffect } from "react";
import { emitShortcut } from "@/lib/shortcut-bus";

function isTypingInField(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return true;
  if (target.isContentEditable) return true;
  return false;
}

export function ShortcutListener() {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const mod = e.metaKey || e.ctrlKey;

      // ⌘K — focus search (works anywhere)
      if (mod && e.key.toLowerCase() === "k") {
        e.preventDefault();
        emitShortcut("focus-search");
        return;
      }

      // ⌘N — new SOS (skip if typing)
      if (mod && e.key.toLowerCase() === "n" && !isTypingInField(e.target)) {
        e.preventDefault();
        emitShortcut("new-sos");
        return;
      }

      // ? — show help / cheatsheet
      if (e.key === "?" && !isTypingInField(e.target)) {
        e.preventDefault();
        emitShortcut("show-help");
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  return null;
}
