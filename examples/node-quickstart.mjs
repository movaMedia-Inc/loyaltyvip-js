// Run: node examples/node-quickstart.mjs
// (After `npm install && npm run build`, or once @loyaltyvip/sdk is published.)
import { LoyaltyVIP } from "@loyaltyvip/sdk";

const lv = new LoyaltyVIP({ apiKey: process.env.LOYALTYVIP_API_KEY });

// Public: search the casino directory (no key needed)
const { data, count } = await lv.searchCasinos({ state: "NV", has_rewards: true, limit: 5 });
console.log(`Found ${count ?? data.length} casinos; first 5:`);
for (const c of data) console.log(` - ${c.name} (${c.city ?? "?"}, ${c.state ?? "?"})`);

// Authenticated: your tier status (needs LOYALTYVIP_API_KEY)
if (process.env.LOYALTYVIP_API_KEY) {
  console.log("\nYour tier status:");
  console.log(await lv.player("tier_status"));
}
