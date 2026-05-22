"use client";

import { useState } from "react";
import { ExternalLink, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useStore } from "@/lib/store";
import { timeAgo } from "@/lib/format";

export default function KnowledgePage() {
  const { state } = useStore();
  const [search, setSearch] = useState("");

  const solved = state.sosRequests.filter((sos) => sos.status === "resolved");
  const query = search.toLowerCase();
  const filtered = solved.filter((sos) =>
    `${sos.title} ${sos.context} ${sos.fixNote ?? ""} ${sos.category}`
      .toLowerCase()
      .includes(query),
  );

  return (
    <div className="space-y-8">
      <header className="max-w-2xl">
        <h1 className="text-foreground text-2xl font-semibold tracking-tight">
          Knowledge Base
        </h1>
        <p className="text-muted-foreground mt-2 text-sm">
          Every resolved SOS becomes a reusable fix. Search before you ask.
        </p>
      </header>

      <div className="relative max-w-md">
        <Search className="text-muted-foreground pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search fixes"
          className="pl-9"
        />
      </div>

      <section>
        {filtered.length === 0 ? (
          <div className="text-muted-foreground border-border rounded-lg border border-dashed p-12 text-center text-sm">
            <p>No solved fixes found.</p>
          </div>
        ) : (
          <ul className="divide-border border-border divide-y rounded-lg border">
            {filtered.map((sos) => {
              const helpers = sos.helperIds
                .map((id) => state.users.find((u) => u.id === id))
                .filter((u): u is NonNullable<typeof u> => Boolean(u));
              return (
                <li
                  key={sos.id}
                  className="hover:bg-muted/40 px-5 py-4 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-muted-foreground">
                          {sos.category}
                        </span>
                        <span className="text-muted-foreground">·</span>
                        <span className="text-muted-foreground">
                          Resolved {timeAgo(sos.resolvedAt ?? sos.createdAt)}
                        </span>
                      </div>
                      <h3 className="text-foreground mt-1.5 text-base font-medium leading-snug">
                        {sos.title}
                      </h3>
                      <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                        {sos.fixNote ?? "No final fix note recorded."}
                      </p>
                      {sos.fixCommitUrl ? (
                        <a
                          href={sos.fixCommitUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-foreground hover:underline mt-2 inline-flex items-center gap-1 text-xs"
                        >
                          <ExternalLink className="size-3 opacity-60" />
                          {sos.fixCommitUrl.replace(/^https?:\/\//, "")}
                        </a>
                      ) : null}
                      {helpers.length > 0 ? (
                        <p className="text-muted-foreground mt-2.5 text-xs">
                          Fixed by{" "}
                          {helpers
                            .map((h) => `@${h.githubHandle}`)
                            .join(", ")}
                        </p>
                      ) : null}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
