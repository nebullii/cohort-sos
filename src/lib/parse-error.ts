import type { Category, Urgency } from "./types";

export interface ParsedError {
  title?: string;
  context?: string;
  category?: Category;
  urgency?: Urgency;
}

const FILE_LINE_RE = /(?:^|\s)([\w./-]+\.(?:tsx?|jsx?|py|go|rs|java|rb|css|scss|html|json|sh))(?::(\d+))?(?::(\d+))?/m;
const ERROR_LINE_RE = /(?:^|\s)((?:TypeError|ReferenceError|SyntaxError|RangeError|Error|FAIL|ERR|ERROR|Failed|fatal):? .{4,180})/i;
const HTTP_STATUS_RE = /\b(40[0-9]|50[0-9])\b/;
const STACK_TRACE_RE = /\n\s+at\s+/;

const CATEGORY_HINTS: Array<{ re: RegExp; category: Category }> = [
  { re: /\b(supabase|clerk|auth|oauth|jwt|sso|session|cookie|login)\b/i, category: "Auth" },
  { re: /\b(vercel|deploy|build|production|env|env var|next\.config|fly\.io|render|railway)\b/i, category: "Deploy" },
  { re: /\b(react|next|tsx|jsx|component|tailwind|css|hydration|render)\b/i, category: "Frontend" },
  { re: /\b(api|route|handler|express|fastapi|webhook|server|node|stripe)\b/i, category: "Backend" },
  { re: /\b(prisma|drizzle|sql|migration|postgres|neon|mongo|database|schema|query)\b/i, category: "Database" },
  { re: /\b(figma|design|ui|color|spacing|layout|typography)\b/i, category: "Design" },
  { re: /\b(pitch|demo|deck|loom|slide|narrative)\b/i, category: "Pitch" },
];

/**
 * Parse common Cursor / dev tool error pastes and extract structured fields.
 * Heuristic; safe to call on any text.
 */
export function parseError(input: string): ParsedError {
  const text = input.trim();
  if (!text) return {};

  const result: ParsedError = {};

  // Title: first error-shaped line, otherwise first 80 chars.
  const errorMatch = ERROR_LINE_RE.exec(text);
  if (errorMatch) {
    result.title = errorMatch[1].trim().slice(0, 90);
  } else {
    const firstLine = text.split("\n").find((l) => l.trim().length > 0);
    if (firstLine) result.title = firstLine.trim().slice(0, 90);
  }

  // Category: first matching hint.
  for (const { re, category } of CATEGORY_HINTS) {
    if (re.test(text)) {
      result.category = category;
      break;
    }
  }

  // Urgency: bump if it looks like a deploy/auth blocker or stack trace.
  if (HTTP_STATUS_RE.test(text) || STACK_TRACE_RE.test(text)) {
    result.urgency = "High";
  }

  // Context: restructured template.
  const fileMatch = FILE_LINE_RE.exec(text);
  const fileLine = fileMatch
    ? `${fileMatch[1]}${fileMatch[2] ? `:${fileMatch[2]}` : ""}${
        fileMatch[3] ? `:${fileMatch[3]}` : ""
      }`
    : "";

  result.context = [
    "Error message:",
    text.length > 600 ? text.slice(0, 600) + "\n…" : text,
    "",
    "Where it breaks:",
    fileLine || "",
    "",
    "What I've tried:",
    "",
  ].join("\n");

  return result;
}
