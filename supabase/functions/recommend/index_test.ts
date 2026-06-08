import { assertEquals } from 'std/assert/mod.ts';
import { handler } from './index.ts';

Deno.test('recommend — OPTIONS returns 200', async () => {
  const req = new Request('http://localhost/recommend', { method: 'OPTIONS' });
  const res = await handler(req);
  assertEquals(res.status, 200);
});

Deno.test('recommend — POST returns stub response', async () => {
  const req = new Request('http://localhost/recommend', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mood: 'cozy' }),
  });
  const res = await handler(req);
  assertEquals(res.status, 200);
  const json = await res.json();
  assertEquals(json.error, null);
});

Deno.test('recommend — non-POST returns 405', async () => {
  const req = new Request('http://localhost/recommend', { method: 'GET' });
  const res = await handler(req);
  assertEquals(res.status, 405);
});
