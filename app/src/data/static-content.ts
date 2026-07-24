import type { PathwayMilestone, ToolItem } from '../types'

export const tools: ToolItem[] = [
  { id: 'budget', name: 'Cost calculator', description: 'Build a source-backed estimate for tuition and living costs.', tag: 'Plan your budget' },
  { id: 'ielts', name: 'IELTS planner', description: 'Turn your target score into a focused weekly study plan.', tag: 'Prepare' },
  { id: 'deadline', name: 'Deadline tracker', description: 'See application, scholarship, and document dates together.', tag: 'Stay on track' },
  { id: 'compare', name: 'University compare', description: 'Review fit, cost, language, and deadlines side by side.', tag: 'Decide', view: 'compare' },
  { id: 'pathway', name: 'Pathway builder', description: 'Answer a few questions and get a practical application route.', tag: 'Start here', view: 'intake' },
  { id: 'documents', name: 'Document checklist', description: 'Understand what to prepare and which details to verify.', tag: 'Get ready' },
]

export const pathwayMilestones: PathwayMilestone[] = [
  { month: '1', title: 'Build shortlist', detail: 'Compare courses, total cost, and entry evidence.' },
  { month: '2', title: 'Prepare documents', detail: 'Request transcripts and draft your statement.' },
  { month: '3', title: 'Language focus', detail: 'Book a test date and close the score gap.' },
  { month: '4', title: 'Submit priority choices', detail: 'Check every source before submitting.' },
  { month: '5', title: 'Funding review', detail: 'Confirm eligibility for published awards.' },
  { month: '6', title: 'Final checks', detail: 'Complete remaining priority applications.' },
]
