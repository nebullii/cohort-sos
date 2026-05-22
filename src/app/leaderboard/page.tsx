"use client";

import { useStore } from "@/lib/store";
import { UserAvatar } from "@/components/sos/user-avatar";
import { Pill } from "@/components/sos/pills";
import { labelReward } from "@/lib/format";
import type { SosRequest, User } from "@/lib/types";

function badgesFor(user: User, sosList: SosRequest[]): string[] {
  const helped = sosList.filter(
    (sos) => sos.helperIds.includes(user.id) && sos.status === "resolved",
  );
  const counts = helped.reduce<Record<string, number>>((acc, sos) => {
    acc[sos.category] = (acc[sos.category] ?? 0) + 1;
    return acc;
  }, {});
  const badges: string[] = [];
  if ((counts.Auth ?? 0) >= 1) badges.push("Auth Medic");
  if ((counts.Deploy ?? 0) >= 1) badges.push("Deploy Rescuer");
  if (((counts.Frontend ?? 0) + (counts.Design ?? 0)) >= 1)
    badges.push("UI Surgeon");
  if ((counts.Pitch ?? 0) >= 1) badges.push("Pitch Doctor");
  if (helped.length >= 2) badges.push("First Responder");
  if (user.rescueRep >= 35) badges.push("Cohort Hero");
  return badges;
}

export default function LeaderboardPage() {
  const { state } = useStore();
  const ranked = [...state.users].sort((a, b) => b.rescueRep - a.rescueRep);

  const rewards = state.sosRequests.flatMap((sos) =>
    sos.rewards
      .filter((r) => r.kudosMessage)
      .map((reward) => ({ reward, sos })),
  );
  rewards.sort(
    (a, b) =>
      new Date(b.reward.createdAt).getTime() -
      new Date(a.reward.createdAt).getTime(),
  );

  return (
    <div className="space-y-10">
      <header className="max-w-2xl">
        <h1 className="text-foreground text-2xl font-semibold tracking-tight">
          Leaderboard
        </h1>
        <p className="text-muted-foreground mt-2 text-sm">
          Rescue Rep is earned from resolved SOS requests — unblocking,
          diagnosing, testing, fix notes, and fast response.
        </p>
      </header>

      <section>
        <div className="border-border overflow-hidden rounded-lg border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-border text-muted-foreground border-b text-xs">
                <th className="w-12 px-4 py-2.5 text-left font-medium">#</th>
                <th className="px-4 py-2.5 text-left font-medium">Builder</th>
                <th className="hidden px-4 py-2.5 text-left font-medium md:table-cell">
                  Skills
                </th>
                <th className="hidden px-4 py-2.5 text-left font-medium lg:table-cell">
                  Badges
                </th>
                <th className="px-4 py-2.5 text-right font-medium">Rep</th>
              </tr>
            </thead>
            <tbody>
              {ranked.map((user, i) => {
                const badges = badgesFor(user, state.sosRequests);
                return (
                  <tr
                    key={user.id}
                    className="border-border hover:bg-muted/40 border-b transition-colors last:border-b-0"
                  >
                    <td className="text-muted-foreground px-4 py-3 tabular-nums">
                      {i + 1}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <UserAvatar user={user} className="size-8" />
                        <div className="min-w-0">
                          <div className="text-foreground font-medium">
                            {user.name}
                          </div>
                          <div className="text-muted-foreground text-xs">
                            @{user.githubHandle}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="text-muted-foreground hidden px-4 py-3 text-xs md:table-cell">
                      {user.skills.join(", ")}
                    </td>
                    <td className="hidden px-4 py-3 lg:table-cell">
                      <div className="flex flex-wrap gap-1">
                        {badges.length === 0 ? (
                          <span className="text-muted-foreground text-xs">
                            —
                          </span>
                        ) : (
                          badges.map((badge) => (
                            <Pill key={badge}>{badge}</Pill>
                          ))
                        )}
                      </div>
                    </td>
                    <td className="text-foreground px-4 py-3 text-right font-semibold tabular-nums">
                      {user.rescueRep}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="text-foreground text-base font-semibold">Recent kudos</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {rewards.length === 0 ? (
            <div className="text-muted-foreground border-border col-span-full rounded-lg border border-dashed p-10 text-center text-sm">
              No kudos yet. Resolve an SOS and credit a helper.
            </div>
          ) : (
            rewards.map(({ reward, sos }) => {
              const from = state.users.find((u) => u.id === reward.fromUserId);
              const to = state.users.find((u) => u.id === reward.toUserId);
              return (
                <div
                  key={reward.id}
                  className="border-border bg-background rounded-lg border p-4"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground text-xs">
                      {sos.category}
                    </span>
                    <span className="text-foreground text-xs font-medium tabular-nums">
                      +{reward.points} {labelReward(reward.type)}
                    </span>
                  </div>
                  <h3 className="text-foreground mt-2 text-sm font-medium leading-snug">
                    {to?.name} → {sos.title}
                  </h3>
                  <p className="text-muted-foreground mt-2 text-xs leading-relaxed">
                    “{reward.kudosMessage}”
                  </p>
                  <p className="text-muted-foreground mt-2 text-[11px]">
                    — {from?.name}
                  </p>
                </div>
              );
            })
          )}
        </div>
      </section>
    </div>
  );
}
