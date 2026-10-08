# LifeVault account deployment

Two GitHub repositories are involved:
- [Life-Vault-Backend](https://github.com/p0g06r5/Life-Vault-Backend) -> Cloudflare Worker `life-vault-backend`.
- [Life-Vault](https://github.com/p0g06r5/Life-Vault) -> Cloudflare Pages `life-vault-c3b.pages.dev`.

## Backend
The Worker `wrangler.toml` binds D1 `lifevault-db` as `DB`. On the first `/health` request it initializes *missing* initial tables using idempotent `CREATE TABLE IF NOT EXISTS`, then reports `database: "ready"`. The GitHub **Verify live Cloudflare backend** workflow checks the live route after a push. For future schema changes, use reviewed migrations and backups.

## One Pages dashboard binding required
Go to Cloudflare dashboard > Workers & Pages > LifeVault **Pages project** > Settings > Functions > Service bindings (labels may vary). Add:
- Variable / binding: `BACKEND_API`
- Service: `life-vault-backend`
- Environment: Production (and Preview only if needed)

Save and redeploy the Pages project. The file `functions/api/v1/[[path]].js` forwards same-origin login API requests using this binding. Never configure an API token or paste credentials into source code.

## Checks
1. Backend: `https://life-vault-backend.ghimirep175.workers.dev/health` should return `{"status":"ok","service":"lifevault-api","version":2,"database":"ready"}`.
2. Frontend: `https://life-vault-c3b.pages.dev/login`.
3. Frontend unauthenticated endpoint `https://life-vault-c3b.pages.dev/api/v1/auth/me` should return HTTP 401 with `{"user":null}` after the service binding exists.
4. Create a test account using a **new**, non-sensitive email and a unique password of at least 12 characters. Test signing out and signing in again.

## Scope and limitations
Registration, password login and logout, secure HttpOnly SameSite cookies, D1-backed password hashes, server-side session revocation and basic IP rate limiting are implemented. Email verification, password resets, CAPTCHA, account deletion and production abuse monitoring still require work before a general public launch.

**Accounts currently do not upload or synchronize memories, collections, photos, or professional data.** Browser content stays local and is not moved, deleted or mixed automatically. This feature is an account foundation, not a finished private cloud vault.
