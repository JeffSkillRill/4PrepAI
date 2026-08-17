import type { PathwayMilestone, ToolItem } from '../types'

export const tools: ToolItem[] = [
  { id: 'counselor', name: 'AI counselor', description: 'Ask questions with university figures restricted to verified 4Prep records.', tag: 'Grounded answers', view: 'counselor' },
  { id: 'compare', name: 'University compare', description: 'Review fit, cost, language, and deadlines side by side.', tag: 'Decide', view: 'compare' },
  { id: 'pathway', name: 'Pathway builder', description: 'Answer a few questions and get a practical application route.', tag: 'Start here', view: 'intake' },
  { id: 'skill-gap', name: 'Skill gap analyzer', description: 'See your scores against published admission minimums, and exactly what is left to close.', tag: 'Improve', view: 'skill_gap' },
  { id: 'scholarships', name: 'Scholarship finder', description: 'Real awards with sourced amounts, checked against every condition each one publishes.', tag: 'Funding', view: 'scholarships' },
]

export const pathwayMilestones: PathwayMilestone[] = [
  { month: '1', title: 'Build shortlist', detail: 'Compare courses, total cost, and entry evidence.' },
  { month: '2', title: 'Prepare documents', detail: 'Request transcripts and draft your statement.' },
  { month: '3', title: 'Language focus', detail: 'Book a test date and close the score gap.' },
  { month: '4', title: 'Submit priority choices', detail: 'Check every source before submitting.' },
  { month: '5', title: 'Funding review', detail: 'Confirm eligibility for published awards.' },
  { month: '6', title: 'Final checks', detail: 'Complete remaining priority applications.' },
]
