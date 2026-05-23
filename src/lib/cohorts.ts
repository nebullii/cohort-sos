/**
 * Registry of cohorts running on Cohort SOS.
 *
 * Each cohort defines where its roster lives (a GitHub repo path with one
 * JSON submission file per member). When a new cohort wants to onboard,
 * they either:
 *
 *   1. Open a PR adding an entry to BUILT_IN_COHORTS below, or
 *   2. Use the /onboarding wizard to spin up a draft locally and then ship
 *      the PR with one click.
 *
 * The schema is intentionally GitHub-native: cohort identity is keyed on a
 * public repo path so the data is portable, inspectable, and free to host.
 */

export interface CohortConfig {
  /** URL-safe slug. Used in routes and storage keys. */
  slug: string;
  /** Human-readable cohort name shown in the UI. */
  name: string;
  /** Tagline displayed under the cohort name. */
  motto: string;
  /** ISO date when the cohort started. */
  startedAt: string;
  /** ISO date when the cohort ends. Used to mark active vs archived. */
  endsAt: string;
  /** Where the roster lives: GitHub org/repo, branch, and submissions dir. */
  source: {
    owner: string;
    repo: string;
    ref: string;
    path: string;
  };
  /** Optional Discord webhook env var name (resolved server-side). */
  discordWebhookEnv?: string;
  /** Optional accent color hex (hero/landing tint). */
  accentColor?: string;
}

export const BUILT_IN_COHORTS: CohortConfig[] = [
  {
    slug: "cursor-boston-summer-1",
    name: "Cursor Boston · Summer 1",
    motto: "Ship together, get unblocked together.",
    startedAt: "2026-05-08",
    endsAt: "2026-06-19",
    source: {
      owner: "rogerSuperBuilderAlpha",
      repo: "cursor-boston",
      ref: "c1w2comms-submission",
      path: "content/summer-cohort/c1/w2-comms/submissions",
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

/**
 * Returns the cohort URL on this app, e.g. `/c/cursor-boston-summer-1/board`.
 * The plain `/board` is an alias for the default cohort, kept for back-compat.
 */
export function cohortHref(slug: string, page: "board" | "cohort" | "leaderboard" | "knowledge" = "board"): string {
  return `/c/${slug}/${page}`;
}
