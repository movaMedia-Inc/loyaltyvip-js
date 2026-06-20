#!/usr/bin/env node
/**
 * LoyaltyVIP CLI. Scriptable access to the casino directory (no key) and your
 * own loyalty data (with an API key). Output is JSON for easy piping to jq.
 *
 *   npx @loyaltyvip/cli casinos --state NV --rewards
 *   npx @loyaltyvip/cli casino bellagio-nv-880e8400
 *   LOYALTYVIP_API_KEY=lvip_live_... npx @loyaltyvip/cli tiers
 */

import { parseArgs } from "node:util";
import { LoyaltyVIP, LoyaltyVIPError } from "@loyaltyvip/sdk";

const VERSION = "1.0.0";

const HELP = `LoyaltyVIP CLI v${VERSION}

Usage: loyaltyvip <command> [options]

Public (no key):
  casinos [query]        Search the casino directory
                           --state <XX> --type <commercial|tribal|racino>
                           --rewards --limit <n> --offset <n>
  casino <slug>          Casino detail + rewards program + tier ladder
  programs [search]      List rewards programs (--brand, --limit)

Authenticated (needs an API key):
  me                     The key owner's account
  tiers | trips | offers Your data
  player <action>        Invoke any /v1/player action (--params '<json>')

Options:
  --key <lvip_live_...>  API key (or set LOYALTYVIP_API_KEY)
  --base <url>           Override API base URL
  -h, --help             Show help
  -v, --version          Show version

Docs: https://loyaltyvip.com/developers`;

function out(value: unknown): void {
  process.stdout.write(JSON.stringify(value, null, 2) + "\n");
}

function fail(message: string, code = 1): never {
  process.stderr.write(message + "\n");
  process.exit(code);
}

async function main(): Promise<void> {
  const { values, positionals } = parseArgs({
    allowPositionals: true,
    options: {
      key: { type: "string" },
      base: { type: "string" },
      state: { type: "string" },
      type: { type: "string" },
      brand: { type: "string" },
      rewards: { type: "boolean" },
      limit: { type: "string" },
      offset: { type: "string" },
      params: { type: "string" },
      help: { type: "boolean", short: "h" },
      version: { type: "boolean", short: "v" },
    },
  });

  if (values.version) return out({ version: VERSION });
  const [command, arg] = positionals;
  if (values.help || !command) {
    process.stdout.write(HELP + "\n");
    return;
  }

  const client = new LoyaltyVIP({
    apiKey: values.key ?? process.env.LOYALTYVIP_API_KEY,
    baseUrl: values.base,
  });

  const num = (s?: string) => (s === undefined ? undefined : Number(s));

  switch (command) {
    case "casinos":
      return out(
        await client.searchCasinos({
          q: arg,
          state: values.state,
          type: values.type,
          has_rewards: values.rewards,
          limit: num(values.limit),
          offset: num(values.offset),
        }),
      );
    case "casino":
      if (!arg) fail("Usage: loyaltyvip casino <slug>");
      return out(await client.getCasino(arg));
    case "programs":
      return out(await client.listRewardsPrograms({ search: arg, brand: values.brand, limit: num(values.limit) }));
    case "me":
      return out(await client.me());
    case "tiers":
      return out(await client.tiers());
    case "trips":
      return out(await client.trips());
    case "offers":
      return out(await client.offers());
    case "player": {
      if (!arg) fail("Usage: loyaltyvip player <action> [--params '<json>']");
      let params: Record<string, unknown> = {};
      if (values.params) {
        try {
          params = JSON.parse(values.params);
        } catch {
          fail("--params must be valid JSON");
        }
      }
      return out(await client.player(arg, params));
    }
    default:
      fail(`Unknown command: ${command}\n\n${HELP}`);
  }
}

main().catch((err: unknown) => {
  if (err instanceof LoyaltyVIPError) {
    fail(`Error ${err.status} (${err.code}): ${err.message}${err.docs ? `\nDocs: ${err.docs}` : ""}`);
  }
  fail(`Error: ${err instanceof Error ? err.message : String(err)}`);
});
