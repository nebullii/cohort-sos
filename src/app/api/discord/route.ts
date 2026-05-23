import { NextResponse } from "next/server";

const COLOR_BY_URGENCY: Record<string, number> = {
  "Deadline Panic": 0xef4444,
  High: 0xf59e0b,
  Medium: 0x3b82f6,
  Low: 0x10b981,
};

interface DiscordRequest {
  event: "launched" | "resolved";
  sos: {
    id: string;
    title: string;
    category: string;
    urgency: string;
    requesterName: string;
    fixNote?: string;
    helperNames?: string[];
    deadlineAt?: string;
  };
  cohortName: string;
}

export async function POST(req: Request) {
  const webhook = process.env.DISCORD_WEBHOOK_URL;
  if (!webhook) {
    return NextResponse.json({ skipped: "no webhook configured" });
  }

  let body: DiscordRequest;
  try {
    body = (await req.json()) as DiscordRequest;
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  const origin = req.headers.get("origin") ?? "";
  const link = `${origin}/board/${body.sos.id}`;
  const color = COLOR_BY_URGENCY[body.sos.urgency] ?? 0x71717a;

  const embed =
    body.event === "launched"
      ? {
          title: `🛟 SOS: ${body.sos.title}`,
          description: `**${body.sos.requesterName}** needs help · _${body.sos.category}_ · ${body.sos.urgency}`,
          color,
          fields: [
            ...(body.sos.deadlineAt
              ? [
                  {
                    name: "Deadline",
                    value: new Date(body.sos.deadlineAt).toLocaleString(),
                    inline: true,
                  },
                ]
              : []),
            { name: "Open in board", value: link },
          ],
          footer: { text: body.cohortName },
          timestamp: new Date().toISOString(),
        }
      : {
          title: `✅ Resolved: ${body.sos.title}`,
          description: body.sos.fixNote ?? "",
          color: 0x10b981,
          fields: [
            ...(body.sos.helperNames && body.sos.helperNames.length
              ? [
                  {
                    name: "Credited",
                    value: body.sos.helperNames.map((n) => `**${n}**`).join(", "),
                  },
                ]
              : []),
            { name: "Saved to Knowledge Base", value: link },
          ],
          footer: { text: body.cohortName },
          timestamp: new Date().toISOString(),
        };

  const res = await fetch(webhook, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ embeds: [embed] }),
  });

  if (!res.ok) {
    return NextResponse.json(
      { error: `discord ${res.status}` },
      { status: 502 },
    );
  }
  return NextResponse.json({ ok: true });
}
