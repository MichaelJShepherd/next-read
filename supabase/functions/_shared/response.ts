import { corsHeaders } from './cors.ts';

export function ok<T>(data: T, status = 200): Response {
  return new Response(JSON.stringify({ data, error: null }), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

export function err(message: string, status = 400): Response {
  return new Response(JSON.stringify({ data: null, error: message }), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
