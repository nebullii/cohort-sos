import { NextResponse } from "next/server";
import { verifyCohortMember } from "@/lib/cohort-source";

export const revalidate = 300;

export async function GET(req: Request) {
  const url = new URL(req.url);
  const handle = url.searchParams.get("handle");
  if (!handle) {
    return NextResponse.json({ error: "handle required" }, { status: 400 });
  }
  try {
    const member = await verifyCohortMember(handle);
    if (!member) {
      return NextResponse.json({ verified: false }, { status: 404 });
    }
    return NextResponse.json({ verified: true, member });
  } catch (err) {
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 502 },
    );
  }
}
