import { corsHeaders } from './cors.ts';

// Return raw JSON — supabase-js functions.invoke() wraps the body in its own
// { data, error } envelope at the transport layer, so we don't double-wrap here.
export function ok<T>(data: T, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

export function err(message: string, status = 400): Response {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
