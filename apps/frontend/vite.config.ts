import yaml from '@modyfi/vite-plugin-yaml'
import { reactRouter } from '@react-router/dev/vite'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [tailwindcss(), reactRouter(), yaml()],
  resolve: {
    tsconfigPaths: true,
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:4200',
        changeOrigin: true
      },
      '/rest': {
        target: 'http://localhost:4200',
        changeOrigin: true
      }
    }
  }
})
