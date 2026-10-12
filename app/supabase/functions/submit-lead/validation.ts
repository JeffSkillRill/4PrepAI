export function validLeadBody(value: unknown): value is {
  p_lead_id: string; p_name: string; p_contact: string; p_source: string; p_note?: string | null; p_context_ref?: string | null
} {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false
  const body = value as Record<string, unknown>
  return typeof body.p_lead_id === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(body.p_lead_id)
    && typeof body.p_name === 'string' && body.p_name.trim().length >= 1 && body.p_name.trim().length <= 120
    && typeof body.p_contact === 'string' && body.p_contact.trim().length >= 3 && body.p_contact.trim().length <= 200
    && typeof body.p_source === 'string' && ['results','gap','counselor_refusal'].includes(body.p_source)
    && (body.p_note == null || typeof body.p_note === 'string' && body.p_note.trim().length <= 1000)
    && (body.p_context_ref == null || typeof body.p_context_ref === 'string' && body.p_context_ref.trim().length <= 200)
}
