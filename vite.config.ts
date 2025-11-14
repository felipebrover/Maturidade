import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    // Expose Vercel's VITE_API_KEY as process.env.API_KEY to the app
    'process.env.API_KEY': JSON.stringify(process.env.VITE_API_KEY)
  }
})
