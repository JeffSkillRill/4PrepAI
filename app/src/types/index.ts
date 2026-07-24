export type View = 'search' | 'profile' | 'compare' | 'intake' | 'results' | 'tools' | 'saved'

export type DevState = 'ready' | 'loading' | 'empty' | 'partial' | 'no_results' | 'refusal' | 'error' | 'offline'

export type DataSource = {
  label: string
  url?: string
  checkedAt: string
}

export type DataPoint<T> = {
  value: T | null
  source: DataSource
  missingReason?: string
  nextAction?: string
}

export type FitTone = 'strong' | 'medium' | 'weak'

export type FitComponent = {
  label: string
  grade: string
  tone: FitTone
  reason: string
}

export type Program = {
  name: string
  degree: string
  duration: DataPoint<string>
  tuition: DataPoint<string>
}

export type University = {
  id: string
  name: string
  city: string
  country: string
  flag: string
  tagline: string
  description: string
  photoSeed: string
  fit: {
    grade: string
    label: string
    summary: string
    components: FitComponent[]
  }
  tuition: DataPoint<string>
  livingCost: DataPoint<string>
  applicationFee: DataPoint<string>
  deadline: DataPoint<string>
  scholarship: DataPoint<string>
  language: DataPoint<string>
  ielts: DataPoint<string>
  intake: DataPoint<string>
  programs: Program[]
  highlights: string[]
}

export type ToolItem = {
  id: string
  name: string
  description: string
  tag: string
  view?: View
}
