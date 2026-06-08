import { handleCors } from '../_shared/cors.ts';
import { ok, err } from '../_shared/response.ts';

export async function handler(req: Request): Promise<Response> {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  if (req.method !== 'POST') {
    return err('Method not allowed', 405);
  }

  try {
    const body = await req.json();
    // TODO: implement mood-based recommendation logic
    console.log('recommend called with', JSON.stringify(body));
    return ok({ message: 'recommend stub' });
  } catch {
    return err('Bad request', 400);
  }
}

if (import.meta.main) {
  Deno.serve(handler);
}
