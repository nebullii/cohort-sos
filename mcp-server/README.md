# Cohort SOS MCP Server

Adds `launch_sos` and `list_open_sos` slash commands to Cursor chat. When you're stuck inside Cursor, fire an SOS to your cohort without leaving the editor.

## Install

1. Add this to your Cursor MCP config (`~/.cursor/mcp.json`, or via Cursor Settings → MCP):

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

2. Restart Cursor.

3. In Cursor chat, ask something like *"Use cohort-sos to launch an SOS: title 'Stripe webhook 401 from ngrok', context (paste your error)"*. The model will call `launch_sos` and post it to the cohort board.

## Tools

- `launch_sos({ title, context, category?, urgency?, timeNeededMinutes?, repoUrl?, liveUrl?, githubIssueUrl? })`
- `list_open_sos({ category? })`

## Local dev

```bash
cd mcp-server
npm install
COHORT_SOS_URL=http://localhost:3000 COHORT_SOS_HANDLE=nebullii node server.mjs
```

Then point a local Cursor at the same env. Or run with `@modelcontextprotocol/inspector` to test outside Cursor.
