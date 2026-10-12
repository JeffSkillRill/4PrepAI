/** Keys are server-salted; raw network addresses never enter the database. */
export async function callerKey(request: Request, salt: string, userId?: string | null): Promise<string> {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
  if (!userId && !ip) throw new Error('CALLER_UNAVAILABLE')
  const bytes = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(`${salt}:${userId ? `user:${userId}` : `ip:${ip}`}`))
  return Array.from(new Uint8Array(bytes), (byte) => byte.toString(16).padStart(2, '0')).join('')
}

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, apikey, content-type, x-client-info',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}
export function json(value: unknown, status = 200) {
  return new Response(JSON.stringify(value), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
}
