import type { CohortConfig } from "./cohorts";
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

export async function fetchCohortRoster(
  cohort: CohortConfig = defaultCohort(),
): Promise<CohortSubmission[]> {
  const { owner, repo, ref, path } = cohort.source;
  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${ref}`;
  const res = await fetch(url, {
    headers: { accept: "application/vnd.github.v3+json" },
    next: { revalidate: 300 },
  });
  if (!res.ok) throw new Error(`roster ${res.status}`);
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

export async function verifyCohortMember(
  handle: string,
  cohort: CohortConfig = defaultCohort(),
): Promise<CohortSubmission | null> {
  if (!handle) return null;
  const safe = handle.replace(/^@/, "");
  const { owner, repo, ref, path } = cohort.source;
  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}/${encodeURIComponent(safe)}.json?ref=${ref}`;
  const res = await fetch(url, {
    headers: { accept: "application/vnd.github.v3+json" },
    next: { revalidate: 300 },
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`verify ${res.status}`);
  const data = (await res.json()) as { download_url: string };
  const file = await fetch(data.download_url, { next: { revalidate: 300 } });
  if (!file.ok) throw new Error(`verify-content ${file.status}`);
  return (await file.json()) as CohortSubmission;
}

export { BUILT_IN_COHORTS };
