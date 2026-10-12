const counters = ['crashes_24h', 'failed_actions_24h', 'new_leads', 'waiting_support', 'pending_deletions', 'failed_cron_24h', 'published_lessons'] as const
export function buildOperationsEmail(snapshot: Record<string, unknown>, health: string, period: string) {
  const counts = counters.map((key) => [key, typeof snapshot[key] === 'number' && Number.isFinite(snapshot[key]) ? Math.max(0, Math.floor(snapshot[key])) : 0] as const)
  const urgent = counts.some(([key, value]) => ['crashes_24h', 'failed_actions_24h', 'pending_deletions', 'failed_cron_24h'].includes(key) && value > 0) || (health !== 'reachable' && health !== 'not configured')
  return {
    subject: `${urgent ? '[Action needed] ' : ''}4PrepAI operations — ${period}:00 UTC`,
    text: `Production check\nWebsite: ${health}\n\n${counts.map(([key, value]) => `${key}: ${value}`).join('\n')}\n\nOpen the admin console to review student requests. This email contains aggregate counts only, no student details.`,
  }
}
