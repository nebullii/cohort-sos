/**
 * Registry of cohorts running on Cohort SOS.
 *
 * The Cursor Boston Summer cohorts are themed weekly: PM, Comms, Marketing,
 * Education, Startup, OSS. Each cohort member submits a new project for
 * each week. The branch where submissions live is per-week.
 *
 * Cohort identity (the full roster) is derived from the broadest week,
 * typically Week 1 (PM). The currently-active week tells us which project
 * each member is shipping right now and who is competing for the win.
 */

export interface CohortWeekSource {
  /** GitHub owner / org. */
  owner: string;
  /** GitHub repo name. */
  repo: string;
  /** Branch / ref where this week's submissions live. */
  ref: string;
  /** Path inside the repo to the submissions folder. */
  path: string;
  /** Display number of the week, e.g. 2. */
  number?: number;
  /** Theme of this week, e.g. "Comms". */
  theme?: string;
}

export interface CohortConfig {
  /** URL-safe slug. Used in routes and storage keys. */
  slug: string;
  /** Human-readable cohort name shown in the UI. */
  name: string;
  /** Tagline displayed under the cohort name. */
  motto: string;
  /** ISO date when the cohort started. */
  startedAt: string;
  /** ISO date when the cohort ends. */
  endsAt: string;
  /** The widest source of cohort members. Used for the full roster. */
  rosterSource: CohortWeekSource;
  /** The active week. If set, used for current project links and `competeForWin`. */
  currentSource?: CohortWeekSource;
  /** Optional Discord webhook env var name (resolved server-side). */
  discordWebhookEnv?: string;
  /** Optional accent color hex. */
  accentColor?: string;
}

export const BUILT_IN_COHORTS: CohortConfig[] = [
  {
    slug: "cursor-boston-summer-1",
    name: "Cursor Boston · Summer 1",
    motto: "Ship together, get unblocked together.",
    startedAt: "2026-05-08",
    endsAt: "2026-06-19",
    rosterSource: {
      owner: "rogerSuperBuilderAlpha",
      repo: "cursor-boston",
      ref: "c1w1pm-submission",
      path: "content/summer-cohort/c1/w1-pm/submissions",
      number: 1,
      theme: "PM",
    },
    currentSource: {
      owner: "rogerSuperBuilderAlpha",
      repo: "cursor-boston",
      ref: "c1w2comms-submission",
      path: "content/summer-cohort/c1/w2-comms/submissions",
      number: 2,
      theme: "Comms",
    },
    discordWebhookEnv: "DISCORD_WEBHOOK_URL",
    accentColor: "#f59e0b",
  },
];

export const DEFAULT_COHORT_SLUG = BUILT_IN_COHORTS[0]?.slug ?? "";

export function findCohort(slug: string | null | undefined): CohortConfig | null {
  if (!slug) return null;
  return BUILT_IN_COHORTS.find((c) => c.slug === slug) ?? null;
}

export function cohortHref(
  slug: string,
  page: "board" | "cohort" | "leaderboard" | "knowledge" = "board",
): string {
  return `/c/${slug}/${page}`;
}
