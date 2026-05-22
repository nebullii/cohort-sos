"use client";

import { useEffect, useState } from "react";

const PRESENCE_CHANNEL = "cohort-sos-presence";
const TYPING_CHANNEL = "cohort-sos-typing";
const HEARTBEAT_MS = 4000;
const STALE_AFTER = 10000;

interface PresenceMessage {
  id: string;
  ts: number;
}

interface TypingMessage {
  sosId: string;
  userId: string;
  ts: number;
}

function getTabId(): string {
  if (typeof window === "undefined") return "server";
  const cached = sessionStorage.getItem("cohort-sos-tab-id");
  if (cached) return cached;
  const id = `tab-${Math.random().toString(36).slice(2, 10)}`;
  sessionStorage.setItem("cohort-sos-tab-id", id);
  return id;
}

export function usePresenceCount(): number {
  const [count, setCount] = useState(1);

  useEffect(() => {
    if (typeof window === "undefined" || !("BroadcastChannel" in window))
      return;
    const tabId = getTabId();
    const channel = new BroadcastChannel(PRESENCE_CHANNEL);
    const peers = new Map<string, number>();
    peers.set(tabId, Date.now());

    function recount() {
      const now = Date.now();
      for (const [id, ts] of peers) {
        if (now - ts > STALE_AFTER) peers.delete(id);
      }
      setCount(peers.size);
    }

    function broadcast() {
      const msg: PresenceMessage = { id: tabId, ts: Date.now() };
      channel.postMessage(msg);
      peers.set(tabId, msg.ts);
      recount();
    }

    channel.onmessage = (e: MessageEvent<PresenceMessage>) => {
      peers.set(e.data.id, e.data.ts);
      recount();
    };

    broadcast();
    const interval = setInterval(broadcast, HEARTBEAT_MS);
    const sweep = setInterval(recount, HEARTBEAT_MS);

    return () => {
      clearInterval(interval);
      clearInterval(sweep);
      channel.close();
    };
  }, []);

  return count;
}

export function useTypingIndicator(sosId: string | null, currentUserId: string) {
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());

  useEffect(() => {
    setTypingUsers(new Set());
    if (typeof window === "undefined" || !("BroadcastChannel" in window))
      return;
    if (!sosId) return;
    const channel = new BroadcastChannel(TYPING_CHANNEL);
    const seen = new Map<string, number>();

    function recount() {
      const now = Date.now();
      const next = new Set<string>();
      for (const [id, ts] of seen) {
        if (now - ts < 3500) next.add(id);
        else seen.delete(id);
      }
      setTypingUsers(next);
    }

    channel.onmessage = (e: MessageEvent<TypingMessage>) => {
      if (e.data.sosId !== sosId) return;
      if (e.data.userId === currentUserId) return;
      seen.set(e.data.userId, e.data.ts);
      recount();
    };

    const sweep = setInterval(recount, 1000);
    return () => {
      clearInterval(sweep);
      channel.close();
    };
  }, [sosId, currentUserId]);

  return typingUsers;
}

export function broadcastTyping(sosId: string, userId: string) {
  if (typeof window === "undefined" || !("BroadcastChannel" in window)) return;
  const channel = new BroadcastChannel(TYPING_CHANNEL);
  const msg: TypingMessage = { sosId, userId, ts: Date.now() };
  channel.postMessage(msg);
  channel.close();
}
