# LifeVault Backend

Secure API foundation for [LifeVault](https://github.com/p0g06r5/Life-Vault), designed for **Cloudflare Workers + Hono + D1**, with optional R2 and Workers AI integrations later.

## Status

**Foundation only — not a production-ready API.** The health route works; personal data APIs intentionally return `501` until account authentication, cookie/CSRF protections, ownership enforcement, and tests are implemented. No public personal-data endpoints are exposed.

## Local development

1. Install Node.js 20+.
2. Run `npm install`.
3. Run `npm run dev`.
4. Test `http://localhost:8787/health` and `http://localhost:8787/api/v1`.

## Provision the database (optional next step)

1. Authenticate to Cloudflare with `npx wrangler login`.
2. Run `npx wrangler d1 create lifevault-db`.
3. Copy the returned database ID into `wrangler.toml`, uncomment the `[[d1_databases]]` section.
4. Run `npm run db:local` for local migrations. For production migrations, verify the database and backup first, then `npm run db:remote`.

## Deployment

After reviewing Cloudflare's free-tier limits and confirming ownership of the account, run `npm run deploy` or connect GitHub to Cloudflare Workers Builds. Deploying is **not automatic** merely because this repo exists.

The frontend stays at `https://life-vault-c3b.pages.dev`. The backend can be hosted on a Cloudflare `workers.dev` subdomain. Once authentication and APIs are ready, we will connect the frontend via a configurable API origin, rather than breaking existing browser-local data.

## Design principles

- User data is private by default; no anonymous access to other users' records.
- Authentication before CRUD; never trust user IDs supplied in requests.
- Sharing must expose **only** its targeted collection, be revocable, and not expose the rest of the vault.
- Keep browser-local data until import verification and a backup are complete.
- Do not store identity documents or other sensitive vault records without a separate security design.
- No paid Cloudflare resources are created by this code.
