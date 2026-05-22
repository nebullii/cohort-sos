import type { Status, Urgency } from "./types";

export function timeAgo(iso: string): string {
  const delta = Math.max(0, Date.now() - new Date(iso).getTime());
  const minutes = Math.floor(delta / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export function labelStatus(value: string): string {
  return value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function labelReward(value: string): string {
  return value.replace(/_/g, " ");
}

export function urgencyTone(urgency: Urgency): "red" | "amber" | "blue" | "green" {
  if (urgency === "Deadline Panic") return "red";
  if (urgency === "High") return "amber";
  if (urgency === "Medium") return "blue";
  return "green";
}

export function statusTone(status: Status): "amber" | "blue" | "green" {
  if (status === "resolved") return "green";
  if (status === "claimed") return "blue";
  return "amber";
}

export function initials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .join("")
    .slice(0, 2)
    .toUpperCase();
}
