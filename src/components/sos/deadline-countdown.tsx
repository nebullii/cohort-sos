"use client";

import { useEffect, useState } from "react";
import { AlarmClock } from "lucide-react";
import { cn } from "@/lib/utils";

interface DeadlineCountdownProps {
  deadlineAt: string;
}

function formatRemaining(ms: number): string {
  if (ms <= 0) return "Overdue";
  const totalMinutes = Math.floor(ms / 60000);
  if (totalMinutes < 60) return `${totalMinutes}m left`;
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  if (hours < 24) return `${hours}h ${mins}m left`;
  const days = Math.floor(hours / 24);
  return `${days}d ${hours % 24}h left`;
}

export function DeadlineCountdown({ deadlineAt }: DeadlineCountdownProps) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(interval);
  }, []);

  const ms = new Date(deadlineAt).getTime() - now;
  const totalMinutes = Math.floor(ms / 60000);
  const urgent = totalMinutes <= 30;
  const overdue = ms <= 0;

  return (
    <span
      className={cn(
        "border-border bg-background text-muted-foreground inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium",
        urgent && !overdue && "border-amber-200 text-amber-700",
        overdue && "border-red-200 text-red-700",
      )}
    >
      <AlarmClock className="size-3" />
      {formatRemaining(ms)}
    </span>
  );
}
