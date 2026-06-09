import { handleCors } from '../_shared/cors.ts';
import { ok, err } from '../_shared/response.ts';
import { log } from '../_shared/logger.ts';

const FN = 'recommend';

export async function handler(req: Request): Promise<Response> {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  if (req.method !== 'POST') {
    return err('Method not allowed', 405);
  }

  try {
    const body = await req.json();
    log('info', FN, 'request_received', { mood: body?.mood });
    return ok({ message: 'recommend stub' });
  } catch {
    log('error', FN, 'bad_request');
    return err('Bad request', 400);
  }
}

if (import.meta.main) {
  Deno.serve(handler);
}
