type ShortcutEvent = "new-sos" | "focus-search" | "show-help";

type Listener = () => void;

const listeners = new Map<ShortcutEvent, Set<Listener>>();

export function emitShortcut(event: ShortcutEvent) {
  listeners.get(event)?.forEach((fn) => fn());
}

export function onShortcut(event: ShortcutEvent, listener: Listener) {
  if (!listeners.has(event)) listeners.set(event, new Set());
  listeners.get(event)!.add(listener);
  return () => {
    listeners.get(event)?.delete(listener);
  };
}
