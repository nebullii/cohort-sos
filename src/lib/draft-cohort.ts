"use client";

import type { CohortConfig } from "./cohorts";

const DRAFTS_KEY = "cohortSosDraftCohorts";

export function loadDraftCohorts(): CohortConfig[] {
  if (typeof localStorage === "undefined") return [];
  try {
    const raw = localStorage.getItem(DRAFTS_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as CohortConfig[];
  } catch {
    return [];
  }
}

export function saveDraftCohort(cohort: CohortConfig) {
  const all = loadDraftCohorts();
  const next = [
    cohort,
    ...all.filter((c) => c.slug !== cohort.slug),
  ];
  localStorage.setItem(DRAFTS_KEY, JSON.stringify(next));
}

export function removeDraftCohort(slug: string) {
  const next = loadDraftCohorts().filter((c) => c.slug !== slug);
  localStorage.setItem(DRAFTS_KEY, JSON.stringify(next));
}
