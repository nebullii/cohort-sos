"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Info, X } from "lucide-react";
import { onToast, type Toast } from "@/lib/toast";
import { cn } from "@/lib/utils";

export function Toaster() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const dispose = onToast((toast) => {
      setToasts((prev) => [...prev, toast]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== toast.id));
      }, 5000);
    });
    return () => {
      dispose();
    };
  }, []);

  function dismiss(id: string) {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }

  if (toasts.length === 0) return null;

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-50 flex w-full max-w-sm flex-col gap-2">
      {toasts.map((t) => {
        const Icon = t.tone === "success" ? CheckCircle2 : Info;
        return (
          <div
            key={t.id}
            className={cn(
              "border-border bg-background pointer-events-auto flex items-start gap-3 rounded-lg border p-3 shadow-md",
              t.tone === "success" && "border-emerald-200",
            )}
            role="status"
          >
            <Icon
              className={cn(
                "size-4 shrink-0 translate-y-0.5",
                t.tone === "success" ? "text-emerald-600" : "text-foreground",
              )}
            />
            <div className="min-w-0 flex-1">
              <div className="text-foreground text-sm font-semibold leading-snug">
                {t.title}
              </div>
              {t.description ? (
                <div className="text-muted-foreground mt-0.5 text-xs leading-relaxed">
                  {t.description}
                </div>
              ) : null}
            </div>
            <button
              type="button"
              onClick={() => dismiss(t.id)}
              className="text-muted-foreground hover:text-foreground -mr-1 -mt-1 rounded p-1"
              aria-label="Dismiss"
            >
              <X className="size-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
