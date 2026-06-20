# LoyaltyVIP — JavaScript / TypeScript developer tools

Official SDK, CLI, and MCP server for [LoyaltyVIP](https://loyaltyvip.com) — the privacy-first casino player intelligence platform. Search the public U.S. casino directory (rewards programs + tier ladders) with no key, and access a player's own loyalty data with a personal API key.

- **API docs:** https://loyaltyvip.com/developers
- **OpenAPI 3.1:** https://loyaltyvip.com/openapi.json
- **Auth guide:** https://loyaltyvip.com/auth.md
- **Full agent reference:** https://loyaltyvip.com/llms-full.txt

## Packages

| Package | What it is | Install |
|---|---|---|
| [`@loyaltyvip/sdk`](packages/sdk) | Typed, zero-dependency REST client | `npm i @loyaltyvip/sdk` |
| [`@loyaltyvip/cli`](packages/cli) | Command-line interface | `npm i -g @loyaltyvip/cli` |
| [`@loyaltyvip/mcp`](packages/mcp) | Model Context Protocol server (stdio) | `npx -y @loyaltyvip/mcp` |

## Quickstart (SDK)

```ts
import { LoyaltyVIP } from "@loyaltyvip/sdk";

const lv = new LoyaltyVIP(); // no key needed for the public directory
const { data } = await lv.searchCasinos({ state: "NV", has_rewards: true, limit: 5 });
console.log(data.map((c) => c.name));

// Your own data needs a key (https://loyaltyvip.com/dashboard/developer):
const me = new LoyaltyVIP({ apiKey: process.env.LOYALTYVIP_API_KEY });
console.log(await me.player("tier_status"));
```

## CLI

```bash
npx @loyaltyvip/cli casinos --state NV --rewards
npx @loyaltyvip/cli casino bellagio-nv-880e8400
LOYALTYVIP_API_KEY=lvip_live_... npx @loyaltyvip/cli tiers
```

## MCP server

Add to your MCP client (e.g. Claude Desktop):

```json
{
  "mcpServers": {
    "loyaltyvip": {
      "command": "npx",
      "args": ["-y", "@loyaltyvip/mcp"],
      "env": { "LOYALTYVIP_API_KEY": "lvip_live_..." }
    }
  }
}
```

The key is optional — directory tools (`search_casinos`, `get_casino`, `list_rewards_programs`) work without it. `player_action` needs a key. An HTTP (Streamable) MCP transport is also live at `https://loyaltyvip.com/mcp`.

## Develop

```bash
npm install
npm run build      # builds sdk -> cli -> mcp
```

## License

MIT © movaMedia. LoyaltyVIP is independent and not affiliated with any casino brand. It is a record-keeping and analytics tool — not a gambling product.
