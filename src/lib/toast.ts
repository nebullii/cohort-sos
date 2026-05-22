"use client";

export interface Toast {
  id: string;
  title: string;
  description?: string;
  tone?: "default" | "success" | "info";
}

type Listener = (toast: Toast) => void;
const listeners = new Set<Listener>();

export function pushToast(toast: Omit<Toast, "id">) {
  const id = `t${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  listeners.forEach((fn) => fn({ id, tone: "default", ...toast }));
}

export function onToast(fn: Listener) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
