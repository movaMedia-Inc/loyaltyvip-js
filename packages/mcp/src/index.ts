#!/usr/bin/env node
/**
 * LoyaltyVIP MCP server (stdio transport). Exposes the public casino directory
 * as MCP tools, plus an authenticated `player_action` tool when an API key is
 * present. Point any MCP client (Claude Desktop, etc.) at it:
 *
 *   {
 *     "mcpServers": {
 *       "loyaltyvip": {
 *         "command": "npx",
 *         "args": ["-y", "@loyaltyvip/mcp"],
 *         "env": { "LOYALTYVIP_API_KEY": "lvip_live_..." }
 *       }
 *     }
 *   }
 *
 * The API key is optional — directory tools work without one.
 * An HTTP (Streamable) transport is also available at https://loyaltyvip.com/mcp.
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { LoyaltyVIP, LoyaltyVIPError } from "@loyaltyvip/sdk";

const client = new LoyaltyVIP({
  apiKey: process.env.LOYALTYVIP_API_KEY,
  baseUrl: process.env.LOYALTYVIP_BASE_URL,
});

const server = new McpServer({ name: "loyaltyvip", version: "1.0.0" });

type TextResult = { content: { type: "text"; text: string }[]; isError?: boolean };

const ok = (data: unknown): TextResult => ({ content: [{ type: "text", text: JSON.stringify(data, null, 2) }] });
const err = (message: string): TextResult => ({ content: [{ type: "text", text: message }], isError: true });

async function guard(fn: () => Promise<TextResult>): Promise<TextResult> {
  try {
    return await fn();
  } catch (e) {
    if (e instanceof LoyaltyVIPError) return err(`Error ${e.status} (${e.code}): ${e.message}`);
    return err(`Error: ${e instanceof Error ? e.message : String(e)}`);
  }
}

server.registerTool(
  "search_casinos",
  {
    title: "Search casinos",
    description:
      "Search the public U.S. casino directory by name, state (two-letter code), type (commercial|tribal|racino), or rewards availability. No API key required.",
    inputSchema: {
      q: z.string().optional().describe("Name search"),
      state: z.string().optional().describe("Two-letter state code, e.g. NV"),
      type: z.string().optional().describe("casino_type: commercial | tribal | racino"),
      has_rewards: z.boolean().optional(),
      limit: z.number().int().max(100).optional(),
      offset: z.number().int().optional(),
    },
  },
  (args) => guard(async () => ok(await client.searchCasinos(args))),
);

server.registerTool(
  "get_casino",
  {
    title: "Get casino detail",
    description: "Get a casino's detail including its rewards/players-club program and full tier ladder, by slug. No API key required.",
    inputSchema: { slug: z.string().describe("Casino slug, e.g. bellagio-nv-880e8400") },
  },
  (args) => guard(async () => ok(await client.getCasino(args.slug))),
);

server.registerTool(
  "list_rewards_programs",
  {
    title: "List rewards programs",
    description: "List casino rewards/players-club programs, optionally filtered by search term or brand. No API key required.",
    inputSchema: {
      search: z.string().optional(),
      brand: z.string().optional(),
      limit: z.number().int().max(200).optional(),
    },
  },
  (args) => guard(async () => ok(await client.listRewardsPrograms(args))),
);

server.registerTool(
  "player_action",
  {
    title: "Player / host action",
    description:
      "Authenticated. Invoke any LoyaltyVIP player/host action (POST /v1/player). Requires LOYALTYVIP_API_KEY. Examples: tier_status, bankroll_status, list_trips, list_w2g, tax_year_summary, host_dashboard.",
    inputSchema: {
      action: z.string().describe("Action name, e.g. tier_status"),
      params: z.record(z.unknown()).optional().describe("Optional action parameters"),
    },
  },
  (args) =>
    guard(async () => {
      if (!process.env.LOYALTYVIP_API_KEY) {
        return err("player_action requires LOYALTYVIP_API_KEY. Mint a key at https://loyaltyvip.com/dashboard/developer.");
      }
      return ok(await client.player(args.action, args.params ?? {}));
    }),
);

async function main(): Promise<void> {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((e) => {
  process.stderr.write(`Fatal: ${e instanceof Error ? e.message : String(e)}\n`);
  process.exit(1);
});
