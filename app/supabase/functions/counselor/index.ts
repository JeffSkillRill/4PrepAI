import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'jsr:@supabase/supabase-js@2'
import { createCounselorHandler } from './handler.ts'

// The request flow lives in handler.ts so it can be tested with fakes; this
// file only binds it to the Deno runtime and the real Supabase client.
const handle = createCounselorHandler({
  env: (name) => Deno.env.get(name),
  createClient: (url, key, options) => createClient(url, key, options),
  fetch: (input, init) => fetch(input, init),
})

export default {
  fetch(request: Request) {
    return handle(request)
  },
}
