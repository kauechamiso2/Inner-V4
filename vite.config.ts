import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  // GitHub Pages serve em /Inner-V4/
  base: process.env.GITHUB_ACTIONS ? '/Inner-V4/' : '/',
  plugins: [react()],
  server: {
    port: 5173,
  },
})
