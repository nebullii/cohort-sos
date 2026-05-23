import { NextResponse } from "next/server";
import { fetchCohortRoster } from "@/lib/cohort-source";

export const revalidate = 300;

export async function GET() {
  try {
    const roster = await fetchCohortRoster();
    return NextResponse.json({ roster });
  } catch (err) {
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 502 },
    );
  }
}
