export type Category =
  | "Auth"
  | "Deploy"
  | "Frontend"
  | "Backend"
  | "Database"
  | "Design"
  | "Pitch"
  | "Other";

export type Urgency = "Low" | "Medium" | "High" | "Deadline Panic";
export type Status = "open" | "claimed" | "resolved";

export type RewardType =
  | "unblocked"
  | "diagnosed"
  | "tested"
  | "fix_note"
  | "fast_response";

export const REWARD_POINTS: Record<RewardType, number> = {
  unblocked: 10,
  diagnosed: 5,
  tested: 3,
  fix_note: 2,
  fast_response: 1,
};

export const CATEGORIES: Category[] = [
  "Auth",
  "Deploy",
  "Frontend",
  "Backend",
  "Database",
  "Design",
  "Pitch",
  "Other",
];

export const URGENCIES: Urgency[] = ["Low", "Medium", "High", "Deadline Panic"];

export interface User {
  id: string;
  name: string;
  githubHandle: string;
  avatarUrl: string;
  skills: string[];
  rescueRep: number;
}

export interface SosComment {
  id: string;
  userId: string;
  body: string;
  createdAt: string;
}

export interface Reward {
  id: string;
  sosId: string;
  fromUserId: string;
  toUserId: string;
  type: RewardType;
  points: number;
  kudosMessage: string;
  createdAt: string;
}

export interface SosRequest {
  id: string;
  title: string;
  category: Category;
  urgency: Urgency;
  status: Status;
  requesterId: string;
  helperIds: string[];
  context: string;
  repoUrl: string;
  liveUrl: string;
  timeNeededMinutes: number;
  deadlineAt?: string;
  createdAt: string;
  resolvedAt?: string;
  fixNote?: string;
  fixCommitUrl?: string;
  comments: SosComment[];
  rewards: Reward[];
}

export interface Cohort {
  name: string;
  motto: string;
  startedAt: string;
}

export interface CohortState {
  currentUserId: string;
  cohort: Cohort;
  users: User[];
  sosRequests: SosRequest[];
}
