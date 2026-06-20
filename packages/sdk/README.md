# @loyaltyvip/sdk

Typed, zero-dependency TypeScript/JavaScript client for the [LoyaltyVIP](https://loyaltyvip.com) API. Node 18+ and modern browsers.

```bash
npm i @loyaltyvip/sdk
```

```ts
import { LoyaltyVIP } from "@loyaltyvip/sdk";

const lv = new LoyaltyVIP(); // public directory needs no key
const { data } = await lv.searchCasinos({ state: "NV", has_rewards: true });

const me = new LoyaltyVIP({ apiKey: process.env.LOYALTYVIP_API_KEY });
await me.player("tier_status");        // full action API
await me.taxReport("generate_summary", { tax_year: 2025 }); // scope: tax
```

Methods: `searchCasinos`, `getCasino`, `listRewardsPrograms`, `getRewardsProgram` (public); `me`, `tiers`, `trips`, `offers`, `player`, `comp`, `predict`, `tierMatch`, `taxReport` (API key). Errors throw `LoyaltyVIPError` (`status`, `code`, `message`, `docs`).

Get a key at https://loyaltyvip.com/dashboard/developer. Docs: https://loyaltyvip.com/developers · OpenAPI: https://loyaltyvip.com/openapi.json.

MIT © movaMedia.
