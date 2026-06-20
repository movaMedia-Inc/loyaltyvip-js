# @loyaltyvip/mcp

[Model Context Protocol](https://modelcontextprotocol.io) server for [LoyaltyVIP](https://loyaltyvip.com). Gives Claude and other MCP clients tools to search the U.S. casino directory and (with a key) a player's loyalty data.

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

`LOYALTYVIP_API_KEY` is optional — the directory tools work without it.

**Tools:** `search_casinos`, `get_casino`, `list_rewards_programs` (public), `player_action` (authenticated; e.g. `tier_status`, `tax_year_summary`, `list_trips`).

A hosted HTTP (Streamable) transport is also available at `https://loyaltyvip.com/mcp` — no install required.

Get a key at https://loyaltyvip.com/dashboard/developer. MIT © movaMedia.
