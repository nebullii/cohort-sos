"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { SosList } from "@/components/sos/sos-list";
import { Conversation } from "@/components/sos/conversation";
import { ContextPanel } from "@/components/sos/context-panel";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

const URGENCY_RANK: Record<string, number> = {
  "Deadline Panic": 0,
  High: 1,
  Medium: 2,
  Low: 3,
};

interface BoardClientProps {
  initialId?: string;
}

export function BoardClient({ initialId }: BoardClientProps) {
  const { state } = useStore();
  const router = useRouter();
  const [selectedId, setSelectedId] = useState<string | null>(initialId ?? null);
  const [filters, setFilters] = useState({
    search: "",
    category: "All",
    urgency: "All",
    status: "All",
  });

  useEffect(() => {
    if (initialId) setSelectedId(initialId);
  }, [initialId]);

  const sortedRequests = useMemo(() => {
    return [...state.sosRequests].sort((a, b) => {
      if (a.status === "resolved" && b.status !== "resolved") return 1;
      if (a.status !== "resolved" && b.status === "resolved") return -1;
      const rank =
        (URGENCY_RANK[a.urgency] ?? 9) - (URGENCY_RANK[b.urgency] ?? 9);
      if (rank !== 0) return rank;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [state.sosRequests]);

  const activeSos =
    state.sosRequests.find((sos) => sos.id === selectedId) ??
    sortedRequests[0] ??
    null;

  function handleSelect(id: string) {
    setSelectedId(id);
    router.replace(`/board/${id}`, { scroll: false });
  }

  function handleBack() {
    setSelectedId(null);
    router.replace("/board", { scroll: false });
  }

  const showDetailOnMobile = selectedId !== null;

  return (
    <div className="bg-background border-border grid h-[calc(100vh-7rem)] grid-cols-1 overflow-hidden rounded-lg border md:grid-cols-[320px_minmax(0,1fr)] lg:grid-cols-[320px_minmax(0,1fr)_300px]">
      <div className={cn("min-h-0", showDetailOnMobile ? "hidden md:block" : "block")}>
        <SosList
          filters={filters}
          setFilters={setFilters}
          selectedId={activeSos?.id ?? null}
          onSelect={handleSelect}
        />
      </div>
      <div className={cn("min-h-0", showDetailOnMobile ? "block" : "hidden md:block")}>
        <Conversation sos={activeSos} onBack={handleBack} />
      </div>
      <ContextPanel sos={activeSos} />
    </div>
  );
}
