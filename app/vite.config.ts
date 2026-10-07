import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      output: {
        // Vendor code changes far less often than app code, so it gets its own
        // long-cached files and a returning student re-downloads only the app chunk.
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined
          if (/node_modules\/(react|react-dom|scheduler)\//.test(id)) return 'react'
          if (/node_modules\/(@supabase|iceberg-js)\//.test(id)) return 'supabase'
          return undefined
        },
      },
    },
  },
})
