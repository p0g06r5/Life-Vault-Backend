# LifeVault Backend

Cloudflare Workers + Hono + D1 backend for [LifeVault](https://github.com/p0g06r5/Life-Vault).

## Current status

The backend is deployed at https://life-vault-backend.ghimirep175.workers.dev .

- [x] Cloudflare D1 binding connected.
- [x] Initial D1 tables automatically initialized using idempotent first-run SQL.
- [x] Live backend health verified by GitHub Actions.
- [x] Account registration, password login, session lookup and logout.
- [x] Password hashes using PBKDF2-SHA256 with randomly generated salts, and hashed server-side session tokens.
- [x] Secure, HttpOnly, SameSite account cookies. Sessions expire after seven days; logout revokes them.
- [x] Basic D1-backed IP throttling and Origin validation for state-changing requests.
- [x] CI checks: typecheck, API tests, actual local Worker + D1 registration/login/logout lifecycle.
- [ ] Frontend Pages Service binding **BACKEND_API → life-vault-backend** (requires Cloudflare Pages project configuration).
- [ ] Account-owned cloud sync for memories, collections, media, and portfolios.
- [ ] Email verification, password reset, account deletion and further public-launch hardening.

## Quick start

```bash
npm install
npm run dev
```

See [ACCOUNT_SETUP.md](./ACCOUNT_SETUP.md) for the remaining Cloudflare Pages binding and live verification steps.

## Endpoints

- `GET /health` — checks Worker and initializes missing D1 tables.
- `GET /api/v1` — API metadata.
- `POST /api/v1/auth/register` — JSON: `{name,email,password}`.
- `POST /api/v1/auth/login` — JSON: `{email,password}`.
- `GET /api/v1/auth/me` — current account (or HTTP 401).
- `POST /api/v1/auth/logout` — revoke session.
- `GET /api/v1/collections` — intentionally blocked pending authenticated cloud-sync implementation.

Do not store sensitive documents or assume browser localStorage data has been uploaded. Until sync is built, logging in only establishes an account; your existing stories and photos remain local.

## Privacy and safety

All account management write requests require a valid browser `Origin` and JSON content type. Sessions are server-side and cookie-based, never stored in browser localStorage.

This is **not yet ready for uncontrolled public registrations**: add email verification and recovery, stronger anti-abuse checks, account-deletion flows, and operational monitoring before broad launch. Do not enable paid Cloudflare products unless desired.

Schema auto-bootstrap is limited to the first, additive `CREATE TABLE IF NOT EXISTS` schema. Future changes should use migrations and verified database backups.
