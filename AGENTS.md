# AGENTS.md — loyaltyvip-js

Guidance for AI coding agents working in this repository (the LoyaltyVIP JavaScript/TypeScript developer tools).

## What this is

A small npm workspaces monorepo with three published packages:

- `packages/sdk` — `@loyaltyvip/sdk`, a typed, zero-dependency REST client.
- `packages/cli` — `@loyaltyvip/cli`, a terminal client (depends on the SDK).
- `packages/mcp` — `@loyaltyvip/mcp`, a Model Context Protocol stdio server (depends on the SDK + `@modelcontextprotocol/sdk`).

These wrap the LoyaltyVIP REST API. The API contract is the source of truth: https://loyaltyvip.com/openapi.json.

## Commands

```bash
npm install        # links workspaces
npm run build      # builds sdk -> cli -> mcp (order matters; cli/mcp import the sdk)
```

## Conventions

- TypeScript, ESM (`"type": "module"`, `NodeNext`). Node >= 18 (uses global `fetch`).
- Keep `@loyaltyvip/sdk` dependency-free.
- When the API changes, update `packages/sdk/src/index.ts` first, then the CLI/MCP that consume it. Keep tool/command names aligned with the hosted MCP server at https://loyaltyvip.com/mcp and `https://loyaltyvip.com/.well-known/mcp/server-card.json`.
- Errors surface as `LoyaltyVIPError` (status, code, message, docs).

## Scope & safety

LoyaltyVIP is a record-keeping/analytics tool — never add gambling, wagering, or money-movement features. Personal data requires a user-provided API key; never hardcode keys or commit secrets.
