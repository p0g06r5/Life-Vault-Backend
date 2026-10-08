import { describe, expect, it } from 'vitest';
import app from '../src/index';
const env = { APP_ORIGIN: 'https://life-vault-c3b.pages.dev' };

describe('LifeVault backend foundation', () => {
  it('responds to health checks', async () => {
    const response = await app.request('/health', {}, env);
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({status:'ok', service:'lifevault-api'});
  });
  it('publishes a version endpoint', async () => {
    const response = await app.request('/api/v1', {}, env);
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({version:'v1'});
  });
  it('refuses access to collections without authentication', async () => {
    for (const method of ['GET','POST','PATCH','DELETE']) {
      const response = await app.request('/api/v1/collections', { method }, env);
      expect(response.status).toBe(501);
    }
  });
  it('refuses unauthenticated current user requests', async () => {
    const response = await app.request('/api/v1/me', {}, env);
    expect(response.status).toBe(501);
  });
  it('restricts CORS to the frontend origin', async () => {
    const response = await app.request('/api/v1',{ headers:{ Origin:'https://evil.example' } },env);
    expect(response.headers.get('access-control-allow-origin')).not.toBe('https://evil.example');
  });
});
