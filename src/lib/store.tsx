"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { createSeed } from "./seed";
import { pushToast } from "./toast";
import { notifyDiscord } from "./discord";
import { REWARD_POINTS } from "./types";
import type {
  Cohort,
  CohortState,
  RewardType,
  SosRequest,
  Status,
  Urgency,
  User,
} from "./types";

const STORAGE_KEY = "cohortSosState";

interface LaunchInput {
  title: string;
  category: SosRequest["category"];
  urgency: Urgency;
  timeNeededMinutes: number;
  deadlineAt?: string;
  githubIssueUrl?: string;
  repoUrl: string;
  liveUrl: string;
  context: string;
}

interface ResolveInput {
  sosId: string;
  fixNote: string;
  fixCommitUrl?: string;
  kudosMessage: string;
  helpers: { userId: string; rewardType: RewardType }[];
}

interface StoreApi {
  state: CohortState;
  hydrated: boolean;
  launchSos: (input: LaunchInput) => SosRequest;
  claimSos: (sosId: string) => void;
  addComment: (sosId: string, body: string) => void;
  resolveSos: (input: ResolveInput) => void;
  updateProfile: (input: Partial<Pick<User, "name" | "githubHandle" | "skills">>) => void;
  updateCohort: (input: Partial<Cohort>) => void;
  setCurrentUserByHandle: (handle: string, profile?: Partial<User>) => void;
  reset: () => void;
}

const StoreContext = createContext<StoreApi | null>(null);

function loadInitial(): CohortState {
  return createSeed();
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<CohortState>(loadInitial);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as Partial<CohortState>;
        const seed = createSeed();
        setState({
          currentUserId: parsed.currentUserId ?? seed.currentUserId,
          cohort: parsed.cohort ?? seed.cohort,
          users: parsed.users ?? seed.users,
          sosRequests: parsed.sosRequests ?? seed.sosRequests,
        });
      }
    } catch {
      /* ignore */
    }
    setHydrated(true);

    // Auto-merge the live cohort roster from the cursor-boston repo.
    // Adds/refreshes name + photo + project URLs for any handle that
    // exists in our seed; new submissions in the cohort repo append.
    fetch("/api/cohort/roster")
      .then((r) => (r.ok ? r.json() : null))
      .then(
        (data: {
          roster?: Array<{
            githubHandle: string;
            name: string;
            photoUrl?: string;
            repoUrl?: string;
            liveUrl?: string;
            loomUrl?: string;
            pitch?: string;
            competeForWin?: boolean;
          }>;
        } | null) => {
          const roster = data?.roster;
          if (!roster) return;
          setState((prev) => {
            const byHandle = new Map(
              prev.users.map((u) => [u.githubHandle.toLowerCase(), u]),
            );
            const merged = [...prev.users];
            let nextId = prev.users.length + 1;
            for (const sub of roster) {
              const key = sub.githubHandle.toLowerCase();
              const existing = byHandle.get(key);
              if (existing) {
                const idx = merged.findIndex((u) => u.id === existing.id);
                merged[idx] = {
                  ...existing,
                  name: sub.name || existing.name,
                  avatarUrl: sub.photoUrl ?? existing.avatarUrl,
                  projectRepoUrl: sub.repoUrl ?? existing.projectRepoUrl,
                  projectLiveUrl: sub.liveUrl ?? existing.projectLiveUrl,
                  loomUrl: sub.loomUrl ?? existing.loomUrl,
                  pitch: sub.pitch ?? existing.pitch,
                  competeForWin: sub.competeForWin ?? existing.competeForWin,
                };
              } else {
                merged.push({
                  id: `u${nextId++}`,
                  name: sub.name,
                  githubHandle: sub.githubHandle,
                  avatarUrl: sub.photoUrl ?? "",
                  skills: [],
                  rescueRep: 0,
                  projectRepoUrl: sub.repoUrl,
                  projectLiveUrl: sub.liveUrl,
                  loomUrl: sub.loomUrl,
                  pitch: sub.pitch,
                  competeForWin: sub.competeForWin,
                });
              }
            }
            return { ...prev, users: merged };
          });
        },
      )
      .catch(() => {
        /* offline / 502 — keep seed roster */
      });
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* ignore quota */
    }
  }, [state, hydrated]);

  const launchSos = useCallback<StoreApi["launchSos"]>((input) => {
    const sos: SosRequest = {
      id:
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? `s${crypto.randomUUID()}`
          : `s${Date.now()}`,
      title: input.title.trim(),
      category: input.category,
      urgency: input.urgency,
      status: "open" as Status,
      requesterId: "u1",
      helperIds: [],
      context: input.context.trim(),
      repoUrl: input.repoUrl.trim(),
      liveUrl: input.liveUrl.trim(),
      timeNeededMinutes: input.timeNeededMinutes,
      deadlineAt: input.deadlineAt || undefined,
      githubIssueUrl: input.githubIssueUrl?.trim() || undefined,
      createdAt: new Date().toISOString(),
      comments: [],
      rewards: [],
    };
    setState((prev) => {
      const requester = prev.users.find((u) => u.id === prev.currentUserId);
      notifyDiscord({
        event: "launched",
        sos: {
          id: sos.id,
          title: sos.title,
          category: sos.category,
          urgency: sos.urgency,
          requesterName: requester?.name ?? "A cohort member",
          deadlineAt: sos.deadlineAt,
        },
        cohortName: prev.cohort?.name ?? "Cohort",
      });
      return {
        ...prev,
        sosRequests: [sos, ...prev.sosRequests],
      };
    });
    return sos;
  }, []);

  const claimSos = useCallback<StoreApi["claimSos"]>((sosId) => {
    setState((prev) => ({
      ...prev,
      sosRequests: prev.sosRequests.map((sos) => {
        if (sos.id !== sosId || sos.status === "resolved") return sos;
        if (sos.requesterId === prev.currentUserId) return sos;
        const helperIds = sos.helperIds.includes(prev.currentUserId)
          ? sos.helperIds
          : [...sos.helperIds, prev.currentUserId];
        return {
          ...sos,
          helperIds,
          status: helperIds.length ? "claimed" : "open",
        };
      }),
    }));
  }, []);

  const addComment = useCallback<StoreApi["addComment"]>((sosId, body) => {
    const trimmed = body.trim();
    if (!trimmed) return;
    setState((prev) => ({
      ...prev,
      sosRequests: prev.sosRequests.map((sos) =>
        sos.id === sosId
          ? {
              ...sos,
              comments: [
                ...sos.comments,
                {
                  id: `c${Date.now()}`,
                  userId: prev.currentUserId,
                  body: trimmed,
                  createdAt: new Date().toISOString(),
                },
              ],
            }
          : sos,
      ),
    }));
  }, []);

  const resolveSos = useCallback<StoreApi["resolveSos"]>((input) => {
    let resolvedTitle: string | null = null;
    let totalPoints = 0;
    let discordPayload: Parameters<typeof notifyDiscord>[0] | null = null;
    setState((prev) => {
      const sos = prev.sosRequests.find((item) => item.id === input.sosId);
      if (!sos) return prev;
      resolvedTitle = sos.title;
      const now = new Date().toISOString();
      const helperIds = Array.from(
        new Set([...sos.helperIds, ...input.helpers.map((h) => h.userId)]),
      );
      const newRewards = input.helpers.map((helper) => ({
        id: `r${Date.now()}-${helper.userId}`,
        sosId: sos.id,
        fromUserId: sos.requesterId,
        toUserId: helper.userId,
        type: helper.rewardType,
        points: REWARD_POINTS[helper.rewardType],
        kudosMessage: input.kudosMessage.trim(),
        createdAt: now,
      }));
      const pointsByUser = new Map<string, number>();
      newRewards.forEach((r) => {
        pointsByUser.set(
          r.toUserId,
          (pointsByUser.get(r.toUserId) ?? 0) + r.points,
        );
      });
      totalPoints = Array.from(pointsByUser.values()).reduce(
        (a, b) => a + b,
        0,
      );
      const helperNames = input.helpers
        .map((h) => prev.users.find((u) => u.id === h.userId)?.name)
        .filter((n): n is string => Boolean(n));
      discordPayload = {
        event: "resolved",
        sos: {
          id: sos.id,
          title: sos.title,
          category: sos.category,
          urgency: sos.urgency,
          requesterName:
            prev.users.find((u) => u.id === sos.requesterId)?.name ?? "Someone",
          fixNote: input.fixNote.trim(),
          helperNames,
        },
        cohortName: prev.cohort?.name ?? "Cohort",
      };
      return {
        ...prev,
        users: prev.users.map((user) => {
          const bonus = pointsByUser.get(user.id) ?? 0;
          return bonus ? { ...user, rescueRep: user.rescueRep + bonus } : user;
        }),
        sosRequests: prev.sosRequests.map((item) =>
          item.id === sos.id
            ? {
                ...item,
                status: "resolved" as Status,
                resolvedAt: now,
                fixNote: input.fixNote.trim(),
                fixCommitUrl: input.fixCommitUrl?.trim() || undefined,
                helperIds,
                rewards: [...item.rewards, ...newRewards],
              }
            : item,
        ),
      };
    });
    if (resolvedTitle) {
      pushToast({
        title: "SOS resolved",
        description: `“${resolvedTitle}” saved to the Knowledge Base${
          totalPoints ? ` · +${totalPoints} rep awarded` : ""
        }`,
        tone: "success",
      });
    }
    if (discordPayload) notifyDiscord(discordPayload);
  }, []);

  const updateProfile = useCallback<StoreApi["updateProfile"]>((input) => {
    setState((prev) => ({
      ...prev,
      users: prev.users.map((u) =>
        u.id === prev.currentUserId ? { ...u, ...input } : u,
      ),
    }));
  }, []);

  const updateCohort = useCallback<StoreApi["updateCohort"]>((input) => {
    setState((prev) => ({ ...prev, cohort: { ...prev.cohort, ...input } }));
  }, []);

  const setCurrentUserByHandle = useCallback<
    StoreApi["setCurrentUserByHandle"]
  >((handle, profile) => {
    const cleaned = handle.replace(/^@/, "").toLowerCase();
    setState((prev) => {
      const existing = prev.users.find(
        (u) => u.githubHandle.toLowerCase() === cleaned,
      );
      if (existing) {
        return {
          ...prev,
          currentUserId: existing.id,
          users: profile
            ? prev.users.map((u) =>
                u.id === existing.id ? { ...u, ...profile } : u,
              )
            : prev.users,
        };
      }
      const id = `u${prev.users.length + 1}`;
      const newUser: User = {
        id,
        name: profile?.name ?? handle,
        githubHandle: handle.replace(/^@/, ""),
        avatarUrl: profile?.avatarUrl ?? "",
        skills: profile?.skills ?? [],
        rescueRep: 0,
        projectRepoUrl: profile?.projectRepoUrl,
        projectLiveUrl: profile?.projectLiveUrl,
        loomUrl: profile?.loomUrl,
        pitch: profile?.pitch,
        competeForWin: profile?.competeForWin,
      };
      return {
        ...prev,
        users: [...prev.users, newUser],
        currentUserId: id,
      };
    });
  }, []);

  const reset = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
    setState(createSeed());
  }, []);

  const value = useMemo<StoreApi>(
    () => ({
      state,
      hydrated,
      launchSos,
      claimSos,
      addComment,
      resolveSos,
      updateProfile,
      updateCohort,
      setCurrentUserByHandle,
      reset,
    }),
    [
      state,
      hydrated,
      launchSos,
      claimSos,
      addComment,
      resolveSos,
      updateProfile,
      updateCohort,
      setCurrentUserByHandle,
      reset,
    ],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreApi {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside StoreProvider");
  return ctx;
}
