# Cohort SOS

A rescue network for stuck builders. Built for the Cursor Boston Summer 1 cohort by [@nebullii](https://github.com/nebullii). When you are blocked, launch an SOS in 30 seconds and a teammate unblocks you. Every fix becomes searchable cohort memory.

**Live:** [cohort-sos.vercel.app](https://cohort-sos.vercel.app)

## Why

Cohort builders waste hours each week stuck on problems peers already solved. Slack threads are noisy, async, and the answer dies in chat. Cohort SOS turns every rescue into a structured artifact that compounds: requester ships, helper earns rep, cohort gets a permanent fix.

## What is novel

- **Browser-side AI semantic search.** A quantized MiniLM model runs entirely in the user's browser via WebAssembly. Zero API keys, zero server cost, fully offline after first load. Powers fix suggestions on launch and intent-based search in the Knowledge Base.
- **GitHub as the source of truth for cohort identity.** The roster is pulled live from the cohort organizer's submissions repo. New member submits a JSON file, they show up in the app within minutes. No manual allowlist.
- **Cursor MCP server.** A `/sos` slash command inside Cursor itself. Cohort members install once, then launch SOSes without leaving the editor.
- **Multi-cohort by design.** A `/onboarding` wizard lets the next cohort organizer register their cohort, verify their source repo, and ship a one-line PR to make it the default for their URL.
- **Discord integration.** When an SOS launches or resolves, it auto-posts a rich embed to the cohort's `#help` channel.
- **AI helper matching.** When you launch an SOS, the model also ranks cohort members by semantic match plus skill plus past resolved-category history. "Bo is most likely to unblock this. Auth specialist, resolved 3 similar."

## Getting started (local dev)

```bash
npm install --legacy-peer-deps
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The board, leaderboard, and knowledge base work out of the box with seeded data. Sign in at `/signin` with a real cohort handle to claim that identity.

Optional environment variables in `.env.local`:

```bash
# Discord channel webhook for cohort notifications
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/...

# GitHub personal access token (only needed for private cohort repos)
GITHUB_TOKEN=ghp_...
```

## Routes

| Route | Purpose |
| --- | --- |
| `/` | Marketing landing page. |
| `/signin` | Cohort member sign-in via GitHub handle verification. |
| `/board` | The Help Board. SOS list, conversation, context panel. |
| `/board/[id]` | Permalink for a single SOS. |
| `/cohort` | Showcase of every cohort member with their project, Loom, and pitch. |
| `/competing` | Competition Watch. Live commit feed across competing projects. |
| `/leaderboard` | Rescue Rep standings with streaks and specialty badges. |
| `/knowledge` | Resolved fixes. AI semantic search across all of them. |
| `/standings` | One-page LinkedIn-worthy stats overview. |
| `/onboarding` | Wizard for the next cohort organizer to register their cohort. |
| `/embed/stats` | Embeddable iframe widget with cohort stats. |

## Onboarding your cohort

If you run a future cohort and want to use Cohort SOS:

1. Visit [/onboarding](https://cohort-sos.vercel.app/onboarding).
2. Fill in cohort name, slug, dates, and the GitHub repo path where you keep one JSON submission file per member.
3. Verify the source. We hit GitHub and confirm the structure.
4. **Try it locally** to preview your board immediately.
5. **Open PR to register** to make your cohort a global entry on this deployment.

Submission JSON schema (one file per member, named `{githubHandle}.json`):

```json
{
  "githubHandle": "nebullii",
  "name": "Nevi",
  "photoUrl": "https://...",
  "repoUrl": "https://github.com/nebullii/cohort-sos.git",
  "liveUrl": "https://cohort-sos.vercel.app",
  "loomUrl": "https://www.loom.com/share/...",
  "pitch": "One-line pitch about what you're building.",
  "competeForWin": true
}
```

`name` and `githubHandle` are required. Everything else is optional but every field unlocks more UI (Loom embeds, project links, competing badge, pitch quotes).

## Cursor MCP server

A separate package in `mcp-server/` adds `launch_sos` and `list_open_sos` slash commands to Cursor chat. Install in your `~/.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "cohort-sos": {
      "command": "npx",
      "args": ["-y", "cohort-sos-mcp"],
      "env": {
        "COHORT_SOS_URL": "https://cohort-sos.vercel.app",
        "COHORT_SOS_HANDLE": "your-github-handle"
      }
    }
  }
}
```

Restart Cursor. In chat, say *"launch an SOS via cohort-sos: title 'Stripe webhook 401 from ngrok', context (paste your error)"* and it posts to the board.

## Stack

- Next.js 16 (App Router) on Vercel
- TypeScript, Tailwind CSS 4, shadcn/ui
- Base UI for accessible primitives
- Browser-side AI via `@huggingface/transformers` (Xenova MiniLM)
- Lucide icons
- Confetti via `canvas-confetti`
- Analytics + Speed Insights via `@vercel/analytics` + `@vercel/speed-insights`

## Status

Built during week 2 of Cursor Boston Summer 1. Persistence is currently local-first (per-browser via localStorage). Multi-user sync is wired structurally; flipping it on requires adding Convex or Supabase plus Clerk for GitHub OAuth. All scoping (cohort slug, user identity, server endpoints) is already shaped for that switch.

## License

MIT.
