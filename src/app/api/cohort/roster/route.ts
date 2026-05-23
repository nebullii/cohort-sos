import { NextResponse } from "next/server";
import { fetchCohortRoster } from "@/lib/cohort-source";
import { DEFAULT_COHORT_SLUG, findCohort } from "@/lib/cohorts";

export const revalidate = 300;

export async function GET(req: Request) {
  const url = new URL(req.url);
  const slug = url.searchParams.get("cohort") ?? DEFAULT_COHORT_SLUG;
  const cohort = findCohort(slug);
  if (!cohort) {
    return NextResponse.json({ error: `unknown cohort: ${slug}` }, { status: 404 });
  }
  try {
    const roster = await fetchCohortRoster(cohort);
    return NextResponse.json({ cohort: cohort.slug, roster });
  } catch (err) {
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 502 },
    );
  }
}
