/**
 * Source of truth for Cursor Boston Summer Cohort 1.
 * The cohort organizer maintains a folder of {handle}.json submissions in:
 *   github.com/rogerSuperBuilderAlpha/cursor-boston
 * We hit GitHub's public REST API to verify membership and pull profile data.
 */

const REPO = "rogerSuperBuilderAlpha/cursor-boston";
const REF = "c1w2comms-submission";
const DIR = "content/summer-cohort/c1/w2-comms/submissions";

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

export async function fetchCohortRoster(): Promise<CohortSubmission[]> {
  const url = `https://api.github.com/repos/${REPO}/contents/${DIR}?ref=${REF}`;
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
): Promise<CohortSubmission | null> {
  if (!handle) return null;
  const safe = handle.replace(/^@/, "");
  const url = `https://api.github.com/repos/${REPO}/contents/${DIR}/${encodeURIComponent(safe)}.json?ref=${REF}`;
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
