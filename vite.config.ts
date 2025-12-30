import path from 'path'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      react: path.resolve(__dirname, './node_modules/react'),
      'react-dom': path.resolve(__dirname, './node_modules/react-dom'),
    },
    dedupe: ['react', 'react-dom'],
  },
  optimizeDeps: {
    include: ['react', 'react-dom'],
  },
  appType: 'spa',
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id: string): string | undefined => {
          if (id.includes('node_modules')) {
            if (id.includes('recharts')) {
              return 'vendor-recharts'
            }
            if (id.includes('@supabase')) {
              return 'vendor-supabase'
            }
            if (id.includes('@radix-ui')) {
              return 'vendor-radix'
            }
            if (id.includes('react-router-dom')) {
              return 'vendor-router'
            }
            if (id.includes('react-hook-form') || id.includes('@hookform')) {
              return 'vendor-forms'
            }
            if (id.includes('lucide-react')) {
              return 'vendor-icons'
            }
            if (
              id.match(/\/node_modules\/react\//) ||
              id.match(/\/node_modules\/react-dom\//) ||
              id.match(/\/node_modules\/scheduler\//)
            ) {
              return 'vendor-react'
            }
            return 'vendor-misc'
          }
        },
      },
    },
    chunkSizeWarningLimit: 500,
    sourcemap: true,
  },
})
