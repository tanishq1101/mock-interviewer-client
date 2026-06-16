import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// Allow specifying a base path (useful for GitHub Pages deployment)
// Set VITE_BASE when running the build or in the GitHub Actions workflow.
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '')

  return {
    base: env.VITE_BASE || '/',
    plugins: [react()],
  }
})
