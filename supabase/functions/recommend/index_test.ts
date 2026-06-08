import { assertEquals } from 'std/assert/mod.ts';

Deno.test('recommend — OPTIONS returns 200', async () => {
  const { default: handler } = await import('./index.ts');
  const req = new Request('http://localhost/recommend', { method: 'OPTIONS' });
  const res = await handler(req);
  assertEquals(res.status, 200);
});
