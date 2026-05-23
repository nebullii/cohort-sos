"use client";

interface DiscordPayload {
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

/**
 * Fire-and-forget notification to the cohort's Discord channel via the
 * server-side webhook. No-op if DISCORD_WEBHOOK_URL is not configured.
 */
export function notifyDiscord(payload: DiscordPayload) {
  if (typeof window === "undefined") return;
  fetch("/api/discord", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
    keepalive: true,
  }).catch(() => {
    /* swallow — never block the user flow */
  });
}
