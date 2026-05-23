import { NextResponse } from "next/server";

export const revalidate = 60;

const ISSUE_URL_RE = /github\.com\/([\w.-]+)\/([\w.-]+)\/(issues|pull)\/(\d+)/i;

interface IssuePayload {
  title: string;
  body: string;
  html_url: string;
  number: number;
  state: string;
  user: { login: string; avatar_url: string } | null;
  labels: Array<{ name: string }>;
  repository_url: string;
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const target = url.searchParams.get("url");
  if (!target) {
    return NextResponse.json({ error: "url required" }, { status: 400 });
  }
  const match = ISSUE_URL_RE.exec(target);
  if (!match) {
    return NextResponse.json(
      { error: "not a GitHub issue or pull URL" },
      { status: 400 },
    );
  }
  const [, owner, repo, , numStr] = match;
  const api = `https://api.github.com/repos/${owner}/${repo}/issues/${numStr}`;
  const headers: HeadersInit = {
    accept: "application/vnd.github.v3+json",
  };
  const token = process.env.GITHUB_TOKEN;
  if (token) headers.authorization = `Bearer ${token}`;

  const res = await fetch(api, { headers, next: { revalidate: 60 } });
  if (res.status === 404) {
    return NextResponse.json(
      { error: "issue not found or repo is private" },
      { status: 404 },
    );
  }
  if (!res.ok) {
    return NextResponse.json(
      { error: `github ${res.status}` },
      { status: 502 },
    );
  }
  const data = (await res.json()) as IssuePayload;

  return NextResponse.json({
    title: data.title,
    body: data.body ?? "",
    url: data.html_url,
    number: data.number,
    state: data.state,
    author: data.user?.login ?? null,
    repoUrl: `https://github.com/${owner}/${repo}`,
    labels: data.labels.map((l) => l.name),
  });
}
