// One-off diagnostic for the counselor's Perplexity 400s. Sends variants of the
// general-guidance request and prints only status + error message per variant.
// Usage: node scripts/pplx-diagnose.mjs   (prompts for the key; never printed)
import { createInterface } from 'node:readline'

async function readKey() {
  if (process.env.PPLX_API_KEY) return process.env.PPLX_API_KEY
  if (!process.stdin.isTTY) {
    console.error('No terminal to type the key into. Run this in your own terminal window, or set PPLX_API_KEY in that shell first.')
    process.exit(1)
  }
  const rl = createInterface({ input: process.stdin, output: process.stdout, terminal: true })
  rl._writeToOutput = () => {}
  process.stdout.write('Perplexity API key (hidden): ')
  const key = await new Promise((resolve) => rl.question('', resolve))
  rl.close()
  process.stdout.write('\n')
  return key.trim()
}

const model = process.env.PPLX_MODEL || 'openai/gpt-6-luna'
const schema = {
  type: 'object',
  required: ['answerType', 'answer', 'recordCitations'],
  properties: {
    answerType: { type: 'string', enum: ['verified_fact', 'general_guidance', 'refusal'] },
    answer: { type: 'string' },
    recordCitations: { type: 'array', items: { type: 'string' } },
  },
}
const strictSchema = { ...schema, additionalProperties: false }
const base = {
  model,
  instructions: 'You are a university counselor. Return JSON only with keys answerType, answer, recordCitations.',
  input: [{ type: 'message', role: 'user', content: 'How can I write a personal statement?' }],
  max_output_tokens: 2048,
}
const format = (s) => ({ type: 'json_schema', json_schema: { name: 'counselor_answer', schema: s } })
const variants = {
  'A current (tools + schema + temp 0.3)': { ...base, temperature: 0.3, tools: [{ type: 'web_search' }], response_format: format(schema) },
  'B no temperature': { ...base, tools: [{ type: 'web_search' }], response_format: format(schema) },
  'C no tools': { ...base, temperature: 0.3, response_format: format(schema) },
  'D no response_format': { ...base, temperature: 0.3, tools: [{ type: 'web_search' }] },
  'E additionalProperties:false': { ...base, temperature: 0.3, tools: [{ type: 'web_search' }], response_format: format(strictSchema) },
  'F string input': { ...base, input: 'How can I write a personal statement?', temperature: 0.3, tools: [{ type: 'web_search' }], response_format: format(schema) },
}

const key = await readKey()
if (!key) { console.error('No key given.'); process.exit(1) }
console.log(`model: ${model}`)
for (const [name, body] of Object.entries(variants)) {
  const response = await fetch('https://api.perplexity.ai/v1/agent', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const text = await response.text()
  let detail = ''
  try { const json = JSON.parse(text); detail = json.error ? JSON.stringify(json.error) : `status=${json.status}` } catch { detail = text.slice(0, 200) }
  console.log(`${name.padEnd(40)} ${response.status} ${detail}`)
}
