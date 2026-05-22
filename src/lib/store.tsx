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
        setState(JSON.parse(saved));
      }
    } catch {
      /* ignore */
    }
    setHydrated(true);
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
      createdAt: new Date().toISOString(),
      comments: [],
      rewards: [],
    };
    setState((prev) => ({
      ...prev,
      sosRequests: [sos, ...prev.sosRequests],
    }));
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
    setState((prev) => {
      const sos = prev.sosRequests.find((item) => item.id === input.sosId);
      if (!sos) return prev;
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
