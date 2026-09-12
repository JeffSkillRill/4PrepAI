import type { DegreeLevel, Extraction, Programme, ProfilePayload, SubjectArea } from './types.js'
import { mapDegreeLevel, mapSubjectArea } from './mapping.js'
export { mapDegreeLevel, mapSubjectArea } from './mapping.js'
function clean(value: string | null | undefined): string | undefined { const v=value?.replace(/\s+/g,' ').trim(); return v || undefined }
function textAfterLabel(lines: string[], pattern: RegExp): string | undefined { const index=lines.findIndex((line)=>pattern.test(line)); return index >= 0 ? clean(lines[index+1]) : undefined }
function walk(value: unknown, lines: string[]): void { if (typeof value==='string') lines.push(value); else if (Array.isArray(value)) value.forEach((item)=>walk(item,lines)); else if (value && typeof value==='object') Object.values(value).forEach((item)=>walk(item,lines)) }
/** Reads structured page data first; fallback text parsing keeps every displayed value verbatim. */
export function extractFromDocument(document: Document, pageUrl: string): Extraction {
  const structured: string[]=[]; for (const script of Array.from(document.querySelectorAll('script[type="application/ld+json"],script#__NEXT_DATA__'))) { try { walk(JSON.parse(script.textContent ?? ''), structured) } catch { /* malformed page data falls back to DOM */ } }
  const lines=[...structured, ...Array.from(document.querySelectorAll('h1,h2,h3,h4,p,li,dt,dd')).map((node)=>node.textContent ?? '')].map((line)=>clean(line)).filter((line): line is string=>Boolean(line));
  const found: ProfilePayload={ source:{url:pageUrl} }; const absent:string[]=[]; const needsReview:string[]=[]
  const international=textAfterLabel(lines,/^international students?$/i); if (international) found.internationalStudentPct=international; else absent.push('internationalStudentPct')
  const faculty=textAfterLabel(lines,/^(total )?faculty( staff)?$/i); if (faculty) found.facultyCount=faculty; else absent.push('facultyCount')
  const employability=textAfterLabel(lines,/^employability rate$/i); if (employability) found.employabilityRate=employability; else absent.push('employabilityRate')
  const summary=textAfterLabel(lines,/^employability$/i); if (summary) found.employabilitySummary=summary; else absent.push('employabilitySummary')
  const rankings: NonNullable<ProfilePayload['rankings']>=[]; for (const line of lines) { const match=line.match(/^(#?\s*[=≤>]?\s*\d+[+\-]?)\s+(.+?)(?:\s+(20\d{2}))?$/); if (match && /ranking/i.test(match[2])) rankings.push({rankDisplay:match[1],label:match[2],...(match[3]?{year:Number(match[3])}:{})}) } if(rankings.length) found.rankings=rankings; else absent.push('rankings')
  const campuses: NonNullable<ProfilePayload['campuses']>=[]; for(let i=0;i<lines.length-3;i++){if(/^campus$/i.test(lines[i])){const name=clean(lines[i+1]),city=clean(lines[i+2]),country=clean(lines[i+3]);if(name&&city&&country)campuses.push({name,city,country});else needsReview.push('campus location')}} if(campuses.length)found.campuses=campuses;else absent.push('campuses')
  const costs: NonNullable<ProfilePayload['costOfLiving']>={}; for(const key of ['accommodation','food','transport','utilities'] as const){const value=textAfterLabel(lines,new RegExp(`^${key}$`,'i'));if(value)costs[key]=value;else absent.push(`costOfLiving.${key}`)} if(Object.keys(costs).length)found.costOfLiving=costs
  const programmes: Programme[]=[]; for(let i=0;i<lines.length-3;i++){if(/^programme|^program$/i.test(lines[i])){const name=clean(lines[i+1]);const degree=clean(lines[i+2]);const subject=clean(lines[i+3]);if(!name||!degree||!subject)continue;const degreeLevel=mapDegreeLevel(degree),subjectArea=mapSubjectArea(subject);if(!degreeLevel||!subjectArea){needsReview.push(`programme: ${name}`);continue}programmes.push({name,degree,degreeLevel,subjectArea})}} if(programmes.length)found.programmes=programmes; else absent.push('programmes')
  return {found,absent,needsReview}
}
