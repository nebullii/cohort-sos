"use client";

import type { LucideIcon } from "lucide-react";
import {
  Shield,
  Rocket,
  Sparkles,
  Megaphone,
  Siren,
  Crown,
  LifeBuoy,
  Trophy,
  Unlock,
  Stethoscope,
  FlaskConical,
  NotebookPen,
  Zap,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useStore } from "@/lib/store";
import { UserAvatar } from "@/components/sos/user-avatar";
import { Pill } from "@/components/sos/pills";
import { labelReward } from "@/lib/format";
import type { RewardType, SosRequest, User } from "@/lib/types";
import { cn } from "@/lib/utils";

type BadgeName =
  | "Auth Medic"
  | "Deploy Rescuer"
  | "UI Surgeon"
  | "Pitch Doctor"
  | "First Responder"
  | "Cohort Hero"
  | "Ready to Rescue";

const BADGE_META: Record<
  BadgeName,
  { icon: LucideIcon; tone: "neutral" | "amber" | "blue" | "green" }
> = {
  "Cohort Hero": { icon: Crown, tone: "amber" },
  "First Responder": { icon: Siren, tone: "amber" },
  "Auth Medic": { icon: Shield, tone: "blue" },
  "Deploy Rescuer": { icon: Rocket, tone: "blue" },
  "UI Surgeon": { icon: Sparkles, tone: "blue" },
  "Pitch Doctor": { icon: Megaphone, tone: "blue" },
  "Ready to Rescue": { icon: LifeBuoy, tone: "neutral" },
};

const REWARD_META: Record<RewardType, { icon: LucideIcon }> = {
  unblocked: { icon: Unlock },
  diagnosed: { icon: Stethoscope },
  tested: { icon: FlaskConical },
  fix_note: { icon: NotebookPen },
  fast_response: { icon: Zap },
};

function badgesFor(user: User, sosList: SosRequest[]): BadgeName[] {
  const helped = sosList.filter(
    (sos) => sos.helperIds.includes(user.id) && sos.status === "resolved",
  );
  const counts = helped.reduce<Record<string, number>>((acc, sos) => {
    acc[sos.category] = (acc[sos.category] ?? 0) + 1;
    return acc;
  }, {});
  const badges: BadgeName[] = [];
  if (user.rescueRep >= 35) badges.push("Cohort Hero");
  if (helped.length >= 2) badges.push("First Responder");
  if ((counts.Auth ?? 0) >= 1) badges.push("Auth Medic");
  if ((counts.Deploy ?? 0) >= 1) badges.push("Deploy Rescuer");
  if (((counts.Frontend ?? 0) + (counts.Design ?? 0)) >= 1)
    badges.push("UI Surgeon");
  if ((counts.Pitch ?? 0) >= 1) badges.push("Pitch Doctor");
  return badges.length ? badges : ["Ready to Rescue"];
}

function rankAccent(rank: number) {
  if (rank === 0) return { icon: Crown, label: "#1", className: "text-amber-600" };
  if (rank === 1) return { icon: Trophy, label: "#2", className: "text-zinc-500" };
  if (rank === 2) return { icon: Trophy, label: "#3", className: "text-orange-700" };
  return null;
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

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {ranked.map((user, i) => {
          const badges = badgesFor(user, state.sosRequests);
          const accent = rankAccent(i);
          return (
            <Card key={user.id} className="overflow-hidden">
              <CardContent className="space-y-4 p-5">
                <div className="flex items-center justify-between">
                  <UserAvatar user={user} className="size-11" />
                  {accent ? (
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 text-xs font-semibold tabular-nums",
                        accent.className,
                      )}
                    >
                      <accent.icon className="size-3.5" />
                      {accent.label}
                    </span>
                  ) : (
                    <span className="text-muted-foreground text-xs font-medium tabular-nums">
                      #{i + 1}
                    </span>
                  )}
                </div>
                <div>
                  <h2 className="text-foreground text-base font-semibold leading-tight">
                    {user.name}
                  </h2>
                  <p className="text-muted-foreground mt-0.5 text-xs">
                    @{user.githubHandle}
                  </p>
                  <p className="text-muted-foreground mt-1 text-xs">
                    {user.skills.join(" · ")}
                  </p>
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-foreground text-3xl font-semibold tabular-nums">
                    {user.rescueRep}
                  </span>
                  <span className="text-muted-foreground text-xs">rep</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {badges.map((badge) => {
                    const meta = BADGE_META[badge];
                    const Icon = meta.icon;
                    return (
                      <Pill key={badge} tone={meta.tone}>
                        <Icon className="size-3" />
                        {badge}
                      </Pill>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          );
        })}
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
              const RewardIcon = REWARD_META[reward.type].icon;
              return (
                <Card key={reward.id}>
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground text-xs">
                        {sos.category}
                      </span>
                      <span className="bg-muted text-foreground inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium tabular-nums">
                        <RewardIcon className="size-3" />
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
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </section>
    </div>
  );
}
