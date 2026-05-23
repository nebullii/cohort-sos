import type { CohortConfig, CohortWeekSource } from "./cohorts";
import { BUILT_IN_COHORTS, DEFAULT_COHORT_SLUG, findCohort } from "./cohorts";

export interface CohortSubmission {
  githubHandle: string;
  name: string;
  photoUrl?: string;
  repoUrl?: string;
  liveUrl?: string;
  loomUrl?: string;
  pitch?: string;
  competeForWin?: boolean;
}

function defaultCohort(): CohortConfig {
  const c = findCohort(DEFAULT_COHORT_SLUG);
  if (!c) throw new Error("No default cohort configured");
  return c;
}

async function fetchSubmissions(
  source: CohortWeekSource,
): Promise<CohortSubmission[]> {
  const { owner, repo, ref, path } = source;
  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${ref}`;
  const res = await fetch(url, {
    headers: { accept: "application/vnd.github.v3+json" },
    next: { revalidate: 300 },
  });
  if (!res.ok) throw new Error(`source ${res.status} ${ref}/${path}`);
  const items = (await res.json()) as Array<{
    name: string;
    type: string;
    download_url: string;
  }>;
  const jsons = items.filter(
    (i) => i.type === "file" && i.name.endsWith(".json"),
  );
  const settled = await Promise.all(
    jsons.map(async (item) => {
      const r = await fetch(item.download_url, { next: { revalidate: 300 } });
      if (!r.ok) return null;
      try {
        return (await r.json()) as CohortSubmission;
      } catch {
        return null;
      }
    }),
  );
  return settled.filter((s): s is CohortSubmission => Boolean(s));
}

/**
 * Returns the merged roster for a cohort:
 *  - Baseline identity (every member who has ever submitted) from rosterSource
 *  - Current-week overrides (active project URLs and competeForWin flag) from currentSource
 *  - Members only present in the current week are appended
 */
export async function fetchCohortRoster(
  cohort: CohortConfig = defaultCohort(),
): Promise<CohortSubmission[]> {
  const baseline = await fetchSubmissions(cohort.rosterSource);
  const byHandle = new Map<string, CohortSubmission>();
  for (const m of baseline) {
    byHandle.set(m.githubHandle.toLowerCase(), {
      ...m,
      // The baseline's competeForWin reflects an earlier week. Don't carry it
      // forward; the current week determines who is competing right now.
      competeForWin: false,
    });
  }
  if (cohort.currentSource) {
    try {
      const current = await fetchSubmissions(cohort.currentSource);
      for (const m of current) {
        const key = m.githubHandle.toLowerCase();
        const existing = byHandle.get(key);
        byHandle.set(key, {
          githubHandle: m.githubHandle,
          name: m.name || existing?.name || m.githubHandle,
          photoUrl: m.photoUrl ?? existing?.photoUrl,
          repoUrl: m.repoUrl ?? existing?.repoUrl,
          liveUrl: m.liveUrl ?? existing?.liveUrl,
          loomUrl: m.loomUrl ?? existing?.loomUrl,
          pitch: m.pitch ?? existing?.pitch,
          competeForWin: m.competeForWin ?? false,
        });
      }
    } catch {
      // If the current source fails, fall back to baseline only.
    }
  }
  return Array.from(byHandle.values());
}

export async function verifyCohortMember(
  handle: string,
  cohort: CohortConfig = defaultCohort(),
): Promise<CohortSubmission | null> {
  if (!handle) return null;
  const safe = handle.replace(/^@/, "");
  // Try the current source first (richest current-week data), then fall back
  // to the roster source so a member who skipped the current week still
  // verifies if they were ever in the cohort.
  const sources: CohortWeekSource[] = cohort.currentSource
    ? [cohort.currentSource, cohort.rosterSource]
    : [cohort.rosterSource];
  for (const source of sources) {
    const { owner, repo, ref, path } = source;
    const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}/${encodeURIComponent(safe)}.json?ref=${ref}`;
    const res = await fetch(url, {
      headers: { accept: "application/vnd.github.v3+json" },
      next: { revalidate: 300 },
    });
    if (res.status === 404) continue;
    if (!res.ok) continue;
    const data = (await res.json()) as { download_url: string };
    const file = await fetch(data.download_url, { next: { revalidate: 300 } });
    if (!file.ok) continue;
    return (await file.json()) as CohortSubmission;
  }
  return null;
}

export { BUILT_IN_COHORTS };
