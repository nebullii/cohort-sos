import { NextResponse } from "next/server";
import { verifyCohortMember } from "@/lib/cohort-source";

/**
 * Endpoint hit by the Cohort SOS MCP server when a cohort member runs the
 * `launch_sos` tool from inside Cursor.
 *
 * Multi-user persistence (Convex/Supabase) isn't wired yet, so for now we
 * verify the handle against the cohort repo and forward the SOS to Discord
 * if a webhook is configured. The web app's localStorage state is unaffected.
 */
export async function POST(req: Request) {
  let body: {
    handle?: string;
    title?: string;
    context?: string;
    category?: string;
    urgency?: string;
    timeNeededMinutes?: number;
    repoUrl?: string;
    liveUrl?: string;
    githubIssueUrl?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  if (!body.handle || !body.title || !body.context) {
    return NextResponse.json(
      { error: "handle, title, and context are required" },
      { status: 400 },
    );
  }

  const member = await verifyCohortMember(body.handle);
  if (!member) {
    return NextResponse.json(
      { error: `@${body.handle} is not in Cohort 1` },
      { status: 403 },
    );
  }

  const id = `mcp-${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 6)}`;

  let posted = false;
  const webhook = process.env.DISCORD_WEBHOOK_URL;
  if (webhook) {
    const embed = {
      title: `🛟 SOS: ${body.title}`,
      description: `**${member.name}** needs help · _${body.category ?? "Other"}_ · ${body.urgency ?? "Medium"}\n\nLaunched from Cursor via MCP.`,
      color: 0xf59e0b,
      fields: [
        ...(body.repoUrl
          ? [{ name: "Repo", value: body.repoUrl, inline: true }]
          : []),
        ...(body.githubIssueUrl
          ? [{ name: "Issue", value: body.githubIssueUrl, inline: true }]
          : []),
      ],
      footer: { text: "Cohort SOS" },
      timestamp: new Date().toISOString(),
    };
    try {
      const r = await fetch(webhook, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ embeds: [embed] }),
      });
      posted = r.ok;
    } catch {
      posted = false;
    }
  }

  return NextResponse.json({
    id,
    title: body.title,
    posted,
  });
}
