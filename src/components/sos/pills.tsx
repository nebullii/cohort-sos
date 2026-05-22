import type { Status, Urgency } from "@/lib/types";
import { labelStatus } from "@/lib/format";
import { cn } from "@/lib/utils";

const TONES = {
  red: "bg-background text-red-700 border-red-200",
  amber: "bg-background text-amber-700 border-amber-200",
  blue: "bg-background text-foreground border-border",
  green: "bg-background text-emerald-700 border-emerald-200",
  neutral: "bg-background text-muted-foreground border-border",
} as const;

type Tone = keyof typeof TONES;

interface PillProps {
  tone?: Tone;
  className?: string;
  children: React.ReactNode;
}

export function Pill({ tone = "neutral", className, children }: PillProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-medium",
        TONES[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

interface DotProps {
  tone: Tone;
  className?: string;
}

export function Dot({ tone, className }: DotProps) {
  const colors: Record<Tone, string> = {
    red: "bg-red-500",
    amber: "bg-amber-500",
    blue: "bg-foreground",
    green: "bg-emerald-500",
    neutral: "bg-muted-foreground",
  };
  return (
    <span
      className={cn("inline-block size-1.5 rounded-full", colors[tone], className)}
    />
  );
}

export function urgencyTone(urgency: Urgency): Tone {
  if (urgency === "Deadline Panic") return "red";
  if (urgency === "High") return "amber";
  if (urgency === "Medium") return "blue";
  return "green";
}

export function statusTone(status: Status): Tone {
  if (status === "resolved") return "green";
  if (status === "claimed") return "blue";
  return "neutral";
}

interface UrgencyPillProps {
  urgency: Urgency;
}

export function UrgencyPill({ urgency }: UrgencyPillProps) {
  return (
    <Pill tone={urgencyTone(urgency)}>
      <Dot tone={urgencyTone(urgency)} />
      {urgency}
    </Pill>
  );
}

interface StatusPillProps {
  status: Status;
}

export function StatusPill({ status }: StatusPillProps) {
  return <Pill tone={statusTone(status)}>{labelStatus(status)}</Pill>;
}
