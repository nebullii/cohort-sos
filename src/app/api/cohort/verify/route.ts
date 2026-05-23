import { NextResponse } from "next/server";
import { verifyCohortMember } from "@/lib/cohort-source";
import { DEFAULT_COHORT_SLUG, findCohort } from "@/lib/cohorts";

export const revalidate = 300;

export async function GET(req: Request) {
  const url = new URL(req.url);
  const handle = url.searchParams.get("handle");
  const slug = url.searchParams.get("cohort") ?? DEFAULT_COHORT_SLUG;
  if (!handle) {
    return NextResponse.json({ error: "handle required" }, { status: 400 });
  }
  const cohort = findCohort(slug);
  if (!cohort) {
    return NextResponse.json({ error: `unknown cohort: ${slug}` }, { status: 404 });
  }
  try {
    const member = await verifyCohortMember(handle, cohort);
    if (!member) {
      return NextResponse.json({ verified: false, cohort: cohort.slug }, { status: 404 });
    }
    return NextResponse.json({ verified: true, cohort: cohort.slug, member });
  } catch (err) {
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 502 },
    );
  }
}
