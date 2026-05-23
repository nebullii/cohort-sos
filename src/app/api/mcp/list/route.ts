import { NextResponse } from "next/server";

/**
 * Returns open SOSes for the MCP `list_open_sos` tool.
 *
 * Until Convex is wired, this returns an empty list (state lives in each
 * user's browser). The shape is stable so the MCP server can render once
 * persistence lands.
 */
export async function GET() {
  return NextResponse.json({ items: [] });
}
