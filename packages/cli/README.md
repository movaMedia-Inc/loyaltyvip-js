# @loyaltyvip/cli

Command-line interface for [LoyaltyVIP](https://loyaltyvip.com). Output is JSON, ready to pipe to `jq`.

```bash
npm i -g @loyaltyvip/cli        # or: npx @loyaltyvip/cli <command>
```

```bash
loyaltyvip casinos --state NV --rewards --limit 5
loyaltyvip casino bellagio-nv-880e8400
loyaltyvip programs "caesars"
LOYALTYVIP_API_KEY=lvip_live_... loyaltyvip tiers
LOYALTYVIP_API_KEY=lvip_live_... loyaltyvip player tax_year_summary --params '{"tax_year":2025}'
```

Commands: `casinos`, `casino <slug>`, `programs` (public); `me`, `tiers`, `trips`, `offers`, `player <action>` (need an API key via `--key` or `LOYALTYVIP_API_KEY`).

Get a key at https://loyaltyvip.com/dashboard/developer. MIT © movaMedia.
