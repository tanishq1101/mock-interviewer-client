/* eslint-disable no-undef */
/* eslint-env node */
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Allow specifying a base path (useful for GitHub Pages deployment)
// Set VITE_BASE when running the build or in the GitHub Actions workflow.
const basePath = (typeof process !== 'undefined' && process.env.VITE_BASE) || '/';

// https://vite.dev/config/
export default defineConfig({
  base: basePath,
  plugins: [react()],
})
