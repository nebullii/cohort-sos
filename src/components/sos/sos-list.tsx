"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CATEGORIES, URGENCIES, type SosRequest } from "@/lib/types";
import { useStore } from "@/lib/store";
import { Dot, urgencyTone } from "./pills";
import { timeAgo, labelStatus } from "@/lib/format";
import { cn } from "@/lib/utils";

const STATUS_OPTIONS = ["All", "open", "claimed", "resolved"] as const;

const URGENCY_RANK: Record<string, number> = {
  "Deadline Panic": 0,
  High: 1,
  Medium: 2,
  Low: 3,
};

interface Filters {
  search: string;
  category: string;
  urgency: string;
  status: string;
}

interface SosListProps {
  filters: Filters;
  setFilters: (updater: (prev: Filters) => Filters) => void;
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export function SosList({ filters, setFilters, selectedId, onSelect }: SosListProps) {
  const { state } = useStore();

  const filtered = state.sosRequests
    .filter((sos) => {
      const haystack =
        `${sos.title} ${sos.context} ${sos.repoUrl} ${sos.liveUrl}`.toLowerCase();
      const matchesSearch =
        !filters.search || haystack.includes(filters.search.toLowerCase());
      const matchesCategory =
        filters.category === "All" || sos.category === filters.category;
      const matchesUrgency =
        filters.urgency === "All" || sos.urgency === filters.urgency;
      const matchesStatus =
        filters.status === "All" || sos.status === filters.status;
      return matchesSearch && matchesCategory && matchesUrgency && matchesStatus;
    })
    .sort((a, b) => {
      if (a.status === "resolved" && b.status !== "resolved") return 1;
      if (a.status !== "resolved" && b.status === "resolved") return -1;
      const rank =
        (URGENCY_RANK[a.urgency] ?? 9) - (URGENCY_RANK[b.urgency] ?? 9);
      if (rank !== 0) return rank;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  const activeCount = state.sosRequests.filter((s) => s.status !== "resolved").length;
  const resolvedCount = state.sosRequests.filter((s) => s.status === "resolved").length;

  return (
    <aside className="bg-background border-border flex h-full min-h-0 flex-col border-r">
      <div className="border-border flex items-baseline justify-between border-b px-4 py-3">
        <h1 className="text-sm font-semibold">Help Board</h1>
        <span className="text-muted-foreground text-xs tabular-nums">
          {activeCount} active · {resolvedCount} solved
        </span>
      </div>

      <div className="border-border space-y-2 border-b px-3 py-3">
        <div className="relative">
          <Search className="text-muted-foreground pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2" />
          <Input
            value={filters.search}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, search: e.target.value }))
            }
            placeholder="Search"
            className="h-8 pl-8 text-sm"
          />
        </div>
        <div className="grid grid-cols-3 gap-1.5">
          <Select
            value={filters.category}
            onValueChange={(value) => {
              if (value === null) return;
              setFilters((prev) => ({ ...prev, category: value }));
            }}
          >
            <SelectTrigger className="h-8 w-full text-xs">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All categories</SelectItem>
              {CATEGORIES.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={filters.urgency}
            onValueChange={(value) => {
              if (value === null) return;
              setFilters((prev) => ({ ...prev, urgency: value }));
            }}
          >
            <SelectTrigger className="h-8 w-full text-xs">
              <SelectValue placeholder="Urgency" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All urgency</SelectItem>
              {URGENCIES.map((u) => (
                <SelectItem key={u} value={u}>
                  {u}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={filters.status}
            onValueChange={(value) => {
              if (value === null) return;
              setFilters((prev) => ({ ...prev, status: value }));
            }}
          >
            <SelectTrigger className="h-8 w-full text-xs">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((s) => (
                <SelectItem key={s} value={s}>
                  {s === "All" ? "All status" : labelStatus(s)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="text-muted-foreground p-6 text-center text-sm">
            No matching requests.
          </div>
        ) : (
          filtered.map((sos) => (
            <SosListItem
              key={sos.id}
              sos={sos}
              active={selectedId === sos.id}
              onSelect={() => onSelect(sos.id)}
            />
          ))
        )}
      </div>
    </aside>
  );
}

interface SosListItemProps {
  sos: SosRequest;
  active: boolean;
  onSelect: () => void;
}

function SosListItem({ sos, active, onSelect }: SosListItemProps) {
  const { state } = useStore();
  const requester = state.users.find((u) => u.id === sos.requesterId);
  const helpers = sos.helperIds.length;
  const resolved = sos.status === "resolved";

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "border-border hover:bg-muted/50 relative block w-full border-b px-4 py-3 text-left transition-colors",
        active && "bg-muted/50",
        resolved && "opacity-60",
      )}
    >
      {active ? (
        <span className="bg-foreground absolute left-0 top-0 h-full w-0.5" />
      ) : null}
      <div className="flex items-center gap-2">
        <Dot tone={urgencyTone(sos.urgency)} />
        <h3 className="text-foreground line-clamp-1 flex-1 text-sm font-medium">
          {sos.title}
        </h3>
        <span className="text-muted-foreground shrink-0 text-xs tabular-nums">
          {timeAgo(sos.createdAt)}
        </span>
      </div>
      <p className="text-muted-foreground mt-1 line-clamp-1 text-xs leading-relaxed">
        {sos.context}
      </p>
      <div className="text-muted-foreground mt-2 flex items-center gap-1.5 text-[11px]">
        <span>{requester?.name ?? "Unknown"}</span>
        <span aria-hidden>·</span>
        <span>{sos.category}</span>
        <span aria-hidden>·</span>
        <span>
          {resolved
            ? "Resolved"
            : helpers
              ? `${helpers} helper${helpers === 1 ? "" : "s"}`
              : "Unclaimed"}
        </span>
      </div>
    </button>
  );
}
