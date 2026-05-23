#!/usr/bin/env node
/**
 * Cohort SOS MCP server for Cursor.
 *
 * Adds `launch_sos` and `list_open_sos` tools to Cursor chat. When you call
 * `launch_sos` from inside the editor, it posts a new SOS to the configured
 * Cohort SOS deployment so the rest of your cohort sees it instantly.
 *
 * Config in ~/.cursor/mcp.json:
 *   {
 *     "mcpServers": {
 *       "cohort-sos": {
 *         "command": "npx",
 *         "args": ["-y", "cohort-sos-mcp"],
 *         "env": {
 *           "COHORT_SOS_URL": "https://cohort-sos.vercel.app",
 *           "COHORT_SOS_HANDLE": "your-github-handle"
 *         }
 *       }
 *     }
 *   }
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

const BASE = (process.env.COHORT_SOS_URL ?? "https://cohort-sos.vercel.app").replace(
  /\/$/,
  "",
);
const HANDLE = process.env.COHORT_SOS_HANDLE ?? "";

const server = new Server(
  {
    name: "cohort-sos",
    version: "0.1.0",
  },
  {
    capabilities: { tools: {} },
  },
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "launch_sos",
      description:
        "Launch a new SOS to your cohort. Use this when you're stuck and want a teammate to help unblock you.",
      inputSchema: {
        type: "object",
        required: ["title", "context"],
        properties: {
          title: {
            type: "string",
            description: "Short problem title (max 90 chars).",
          },
          context: {
            type: "string",
            description:
              "What changed, what you tried, what error you see. Include code blocks with triple backticks.",
          },
          category: {
            type: "string",
            enum: [
              "Auth",
              "Deploy",
              "Frontend",
              "Backend",
              "Database",
              "Design",
              "Pitch",
              "Other",
            ],
            description: "Best fit category. Defaults to Other.",
          },
          urgency: {
            type: "string",
            enum: ["Low", "Medium", "High", "Deadline Panic"],
            description: "How urgent. Defaults to Medium.",
          },
          timeNeededMinutes: {
            type: "integer",
            description: "Estimated minutes of help you need. Default 15.",
          },
          repoUrl: {
            type: "string",
            description: "Optional repo URL.",
          },
          liveUrl: {
            type: "string",
            description: "Optional live deployment URL.",
          },
          githubIssueUrl: {
            type: "string",
            description: "Optional GitHub issue this SOS is about.",
          },
        },
      },
    },
    {
      name: "list_open_sos",
      description:
        "List open SOSes from your cohort, sorted by urgency. Use this to find someone to help.",
      inputSchema: {
        type: "object",
        properties: {
          category: {
            type: "string",
            description: "Optional category filter.",
          },
        },
      },
    },
  ],
}));

server.setRequestHandler(CallToolRequestSchema, async (req) => {
  const { name, arguments: args } = req.params;
  if (name === "launch_sos") {
    if (!HANDLE) {
      return {
        content: [
          {
            type: "text",
            text:
              "COHORT_SOS_HANDLE is not configured. Set it in your Cursor MCP config (~/.cursor/mcp.json) to your GitHub handle.",
          },
        ],
        isError: true,
      };
    }
    const res = await fetch(`${BASE}/api/mcp/launch`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ ...args, handle: HANDLE }),
    });
    if (!res.ok) {
      const txt = await res.text();
      return {
        content: [{ type: "text", text: `Launch failed: ${res.status} ${txt}` }],
        isError: true,
      };
    }
    const data = await res.json();
    return {
      content: [
        {
          type: "text",
          text: [
            `SOS launched.`,
            `Title: ${data.title}`,
            `Open at: ${BASE}/board/${data.id}`,
            data.posted ? `Posted to Discord.` : "",
          ]
            .filter(Boolean)
            .join("\n"),
        },
      ],
    };
  }

  if (name === "list_open_sos") {
    const url = new URL(`${BASE}/api/mcp/list`);
    if (typeof args?.category === "string") {
      url.searchParams.set("category", args.category);
    }
    const res = await fetch(url);
    if (!res.ok) {
      return {
        content: [{ type: "text", text: `List failed: ${res.status}` }],
        isError: true,
      };
    }
    const data = await res.json();
    if (data.items.length === 0) {
      return {
        content: [{ type: "text", text: "No open SOSes right now." }],
      };
    }
    return {
      content: [
        {
          type: "text",
          text: data.items
            .map(
              (s) =>
                `${s.urgency} · ${s.category} · ${s.title}\n  ${BASE}/board/${s.id} (requester: ${s.requester})`,
            )
            .join("\n\n"),
        },
      ],
    };
  }

  return {
    content: [{ type: "text", text: `Unknown tool: ${name}` }],
    isError: true,
  };
});

const transport = new StdioServerTransport();
await server.connect(transport);
