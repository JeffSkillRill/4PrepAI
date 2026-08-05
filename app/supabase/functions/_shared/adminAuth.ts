import { createClient } from 'jsr:@supabase/supabase-js@2'

const ADMIN_MINUTE_LIMIT = 30
const ADMIN_HOUR_LIMIT = 1000

export type AdminServiceClient = ReturnType<typeof createClient>

export type AdminContext = {
  requestId: string
  userId: string
  email: string | null
  adminGrantId: string
  database: AdminServiceClient
}

export type AdminAuthorizationResult =
  | { ok: true; context: AdminContext }
  | { ok: false; status: 403 | 503 }

type AuditOutcome = 'allowed' | 'denied' | 'failed'

type AuditEvent = {
  requestId: string
  actorUserId: string | null
  actorAdminGrantId: string | null
  endpoint: string
  action: string
  resourceType: string
  resourceId?: string | null
  targetUserId?: string | null
  outcome: AuditOutcome
  reasonCode?: string | null
  metadata?: Record<string, unknown>
}

function environment(name: string): string | null {
  const value = Deno.env.get(name)?.trim()
  return value || null
}

async function sha256(value: string): Promise<string> {
  const bytes = new TextEncoder().encode(value)
  const digest = await crypto.subtle.digest('SHA-256', bytes)
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('')
}

function requestIp(request: Request): string {
  return request.headers.get('cf-connecting-ip')?.trim()
    || request.headers.get('x-real-ip')?.trim()
    || request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || 'unavailable'
}

async function audit(
  database: AdminServiceClient,
  event: AuditEvent,
): Promise<void> {
  const { error } = await database.from('admin_audit_log').insert({
    request_id: event.requestId,
    actor_user_id: event.actorUserId,
    actor_admin_grant_id: event.actorAdminGrantId,
    endpoint: event.endpoint,
    action: event.action,
    resource_type: event.resourceType,
    resource_id: event.resourceId ?? null,
    target_user_id: event.targetUserId ?? null,
    outcome: event.outcome,
    reason_code: event.reasonCode ?? null,
    metadata: event.metadata ?? {},
  })
  if (error) throw new Error(`Admin audit write failed: ${error.message}`)
}

export async function auditAdminEvent(
  context: AdminContext,
  event: Omit<AuditEvent, 'requestId' | 'actorUserId' | 'actorAdminGrantId' | 'endpoint'>,
): Promise<void> {
  await audit(context.database, {
    ...event,
    requestId: context.requestId,
    actorUserId: context.userId,
    actorAdminGrantId: context.adminGrantId,
    endpoint: 'admin-api',
  })
}

async function auditDenial(
  database: AdminServiceClient,
  requestId: string,
  actorUserId: string | null,
  outcome: 'denied' | 'failed',
  reasonCode: string,
): Promise<boolean> {
  try {
    await audit(database, {
      requestId,
      actorUserId,
      actorAdminGrantId: null,
      endpoint: 'admin-api',
      action: 'authorize',
      resourceType: 'admin_api',
      outcome,
      reasonCode,
    })
    return true
  } catch (reason) {
    console.error('ADMIN_AUDIT_WRITE_FAILED', {
      requestId,
      reasonCode,
      message: reason instanceof Error ? reason.message : String(reason),
    })
    return false
  }
}

async function authorizeAdminUnchecked(
  request: Request,
  requestId: string,
): Promise<AdminAuthorizationResult> {
  const url = environment('SUPABASE_URL')
  const anonKey = environment('SUPABASE_ANON_KEY')
  const serviceRoleKey = environment('SUPABASE_SERVICE_ROLE_KEY')
  const ipSalt = environment('ADMIN_IP_SALT')
  if (!url || !anonKey || !serviceRoleKey || !ipSalt) {
    console.error('ADMIN_CONFIGURATION_MISSING', { requestId })
    return { ok: false, status: 503 }
  }

  const authorization = request.headers.get('Authorization') ?? ''
  const tokenMatch = authorization.match(/^Bearer\s+(.+)$/i)
  const accessToken = tokenMatch?.[1]?.trim() ?? ''
  const authClient = createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
  const userResult = accessToken
    ? await authClient.auth.getUser(accessToken)
    : { data: { user: null }, error: null }
  const actorUserId = userResult.data.user?.id ?? null

  // The service role is used before authorization only for the control-plane
  // rate ledger, denial audit, and active-grant lookup. No student table, Auth
  // roster, or Storage access occurs before an active grant is proven.
  const database = createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
  const callerKey = actorUserId
    ? `user:${actorUserId}`
    : `ip:${await sha256(`${ipSalt}:${requestIp(request)}`)}`
  const { data: rateRows, error: rateError } = await database.rpc('begin_admin_api_request', {
    p_request_id: requestId,
    p_actor_user_id: actorUserId,
    p_caller_key: callerKey,
    p_endpoint: 'admin-api',
    p_minute_limit: ADMIN_MINUTE_LIMIT,
    p_hour_limit: ADMIN_HOUR_LIMIT,
  })
  if (rateError) {
    console.error('ADMIN_RATE_LIMIT_FAILED', { requestId, message: rateError.message })
    await auditDenial(database, requestId, actorUserId, 'failed', 'rate_limit_failed')
    return { ok: false, status: 503 }
  }
  const rate = Array.isArray(rateRows) ? rateRows[0] : null
  if (!rate?.allowed) {
    const audited = await auditDenial(database, requestId, actorUserId, 'denied', 'rate_limited')
    return { ok: false, status: audited ? 403 : 503 }
  }

  if (!actorUserId || userResult.error) {
    const audited = await auditDenial(database, requestId, null, 'denied', 'authorization_failed')
    return { ok: false, status: audited ? 403 : 503 }
  }

  const { data: grant, error: grantError } = await database
    .from('admin_users')
    .select('id,user_id,granted_at')
    .eq('user_id', actorUserId)
    .is('revoked_at', null)
    .maybeSingle()
  if (grantError) {
    console.error('ADMIN_GRANT_LOOKUP_FAILED', { requestId, message: grantError.message })
    await auditDenial(database, requestId, actorUserId, 'failed', 'admin_lookup_failed')
    return { ok: false, status: 503 }
  }
  if (!grant) {
    const audited = await auditDenial(database, requestId, actorUserId, 'denied', 'authorization_failed')
    return { ok: false, status: audited ? 403 : 503 }
  }

  const context: AdminContext = {
    requestId,
    userId: actorUserId,
    email: userResult.data.user?.email ?? null,
    adminGrantId: grant.id,
    database,
  }
  return {
    ok: true,
    context,
  }
}

export async function authorizeAdmin(
  request: Request,
  requestId: string,
): Promise<AdminAuthorizationResult> {
  try {
    return await authorizeAdminUnchecked(request, requestId)
  } catch (reason) {
    console.error('ADMIN_AUTHORIZATION_EXCEPTION', {
      requestId,
      message: reason instanceof Error ? reason.message : String(reason),
    })
    const url = environment('SUPABASE_URL')
    const serviceRoleKey = environment('SUPABASE_SERVICE_ROLE_KEY')
    if (url && serviceRoleKey) {
      try {
        const database = createClient(url, serviceRoleKey, {
          auth: { persistSession: false, autoRefreshToken: false },
        })
        await auditDenial(database, requestId, null, 'failed', 'authorization_exception')
      } catch (auditReason) {
        console.error('ADMIN_AUTHORIZATION_EXCEPTION_AUDIT_FAILED', {
          requestId,
          message: auditReason instanceof Error ? auditReason.message : String(auditReason),
        })
      }
    }
    return { ok: false, status: 503 }
  }
}
