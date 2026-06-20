---
name: loyaltyvip
description: Search the U.S. casino directory (rewards programs, tier ladders) and, with a user-provided API key, read a player's casino loyalty data — tiers, trips, theo/ADT, offers, W-2G tax docs — and find VIP hosts. Use when a user asks about a casino's loyalty program, comparing tiers, their own play/comps, gambling tax summaries, or casino hosts.
license: MIT
---

# LoyaltyVIP

LoyaltyVIP is a privacy-first casino player intelligence platform. Use it to answer questions about U.S. casinos' loyalty programs and (with the user's API key) their own play data. It is a record-keeping/analytics tool — never use it to gamble or move money.

## Capabilities

- **Public (no key):** search the casino directory; get a casino's rewards program + tier ladder; list rewards programs.
- **Authenticated (user's API key, `lvip_live_...`):** the player's tiers, trips, sessions, theo/ADT, offers, bankroll; comp/offer prediction; cross-property tier matching; IRS gambling tax summaries (W-2G); VIP host discovery.

## How to use

Preferred: the MCP server.
- Hosted (Streamable HTTP): `https://loyaltyvip.com/mcp`
- Local (stdio): `npx -y @loyaltyvip/mcp` (set `LOYALTYVIP_API_KEY` for authenticated tools)

Tools: `search_casinos`, `get_casino`, `list_rewards_programs` (public), `player_action` (authenticated; e.g. action `tier_status`, `tax_year_summary`, `list_trips`).

Or call the REST API directly — base `https://nbhagdwegk.execute-api.us-east-1.amazonaws.com`, OpenAPI at https://loyaltyvip.com/openapi.json, auth guide at https://loyaltyvip.com/auth.md. Or the CLI: `npx @loyaltyvip/cli casinos --state NV --rewards`.

## Getting a key

Personal API keys are minted by a human account owner at https://loyaltyvip.com/dashboard/developer and provided to the agent. Agents cannot self-issue keys. Scopes: `read`, `write`, `tax`, `host`.

## Examples

- "What tiers does the Bellagio's rewards program have?" → `get_casino` with the Bellagio slug (public).
- "Find tribal casinos in Oklahoma with a players club." → `search_casinos { state: "OK", type: "tribal", has_rewards: true }`.
- "Summarize my 2025 W-2G jackpots." → `player_action { action: "tax_year_summary", params: { tax_year: 2025 } }` (needs `tax` scope).
