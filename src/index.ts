import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { secureHeaders } from 'hono/secure-headers';
import { z } from 'zod';

type Bindings = { APP_ORIGIN: string; DB?: D1Database };
const app = new Hono<{ Bindings: Bindings }>();

app.use('*', secureHeaders());
app.use('/api/*', async (c, next) => {
  const origin = c.env.APP_ORIGIN || 'https://life-vault-c3b.pages.dev';
  return cors({ origin, allowMethods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'], allowHeaders: ['Content-Type'], credentials: true })(c, next);
});

app.get('/health', (c) => c.json({ status: 'ok', service: 'lifevault-api', version: 1 }));
app.get('/api/v1', (c) => c.json({ service: 'LifeVault API', version: 'v1', status: 'foundation' }));

// The user-owned routes must never use an untrusted user_id provided by the client.
// Until secure account authentication is installed, collection endpoints deliberately refuse access.
app.all('/api/v1/collections', (c) => c.json({ error: 'Authentication has not been configured.' }, 501));
app.all('/api/v1/collections/*', (c) => c.json({ error: 'Authentication has not been configured.' }, 501));
app.all('/api/v1/me', (c) => c.json({ error: 'Authentication has not been configured.' }, 501));

app.notFound((c) => c.json({ error: 'Not found' }, 404));
app.onError((_, c) => c.json({ error: 'Internal server error' }, 500));
export default app;
