import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const vendorChunks: Record<string, string[]> = {
  'vendor-react': ['react', 'react-dom'],
  'vendor-motion': ['framer-motion'],
  'vendor-state': ['zustand'],
}

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          for (const [chunkName, deps] of Object.entries(vendorChunks)) {
            if (deps.some((dep) => id.includes(`/node_modules/${dep}/`))) {
              return chunkName
            }
          }
        },
      },
    },
  },
})
