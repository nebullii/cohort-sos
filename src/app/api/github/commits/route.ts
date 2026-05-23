import { NextResponse } from "next/server";

export const revalidate = 120;

const REPO_RE = /github\.com\/([\w.-]+)\/([\w.-]+?)(?:\.git)?(?:$|[/?#])/i;

interface CommitItem {
  sha: string;
  message: string;
  date: string;
  url: string;
  author: { name: string; login?: string; avatar?: string };
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const repoUrl = url.searchParams.get("repo");
  if (!repoUrl) {
    return NextResponse.json({ error: "repo required" }, { status: 400 });
  }

  const match = REPO_RE.exec(repoUrl);
  if (!match) {
    return NextResponse.json(
      { error: "not a valid GitHub repo URL" },
      { status: 400 },
    );
  }
  const [, owner, repo] = match;
  const since = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString();
  const api = `https://api.github.com/repos/${owner}/${repo}/commits?per_page=10&since=${since}`;

  const headers: HeadersInit = {
    accept: "application/vnd.github.v3+json",
  };
  const token = process.env.GITHUB_TOKEN;
  if (token) headers.authorization = `Bearer ${token}`;

  const res = await fetch(api, { headers, next: { revalidate: 120 } });
  if (res.status === 404) {
    return NextResponse.json(
      { repo: `${owner}/${repo}`, commits: [], notFound: true },
      { status: 200 },
    );
  }
  if (res.status === 403) {
    return NextResponse.json(
      { repo: `${owner}/${repo}`, commits: [], rateLimited: true },
      { status: 200 },
    );
  }
  if (!res.ok) {
    return NextResponse.json(
      { error: `github ${res.status}` },
      { status: 502 },
    );
  }

  const data = (await res.json()) as Array<{
    sha: string;
    commit: {
      message: string;
      author: { name: string; date: string };
    };
    html_url: string;
    author: { login: string; avatar_url: string } | null;
  }>;

  const commits: CommitItem[] = data.map((c) => ({
    sha: c.sha.slice(0, 7),
    message: c.commit.message.split("\n")[0].slice(0, 140),
    date: c.commit.author.date,
    url: c.html_url,
    author: {
      name: c.commit.author.name,
      login: c.author?.login,
      avatar: c.author?.avatar_url,
    },
  }));

  return NextResponse.json({ repo: `${owner}/${repo}`, commits });
}
