import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss()
  ],
  build: {
    // Raise warning threshold since we now split properly
    chunkSizeWarningLimit: 500,
    rolldownOptions: {
      output: {
        // Manual chunk splitting — isolates large vendor libs so browsers
        // can cache them independently from app code that changes often.
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('recharts')) return 'vendor-charts';
            if (id.includes('socket.io-client')) return 'vendor-socket';
            if (id.includes('react/') || id.includes('react-dom/') || id.includes('react-router-dom')) return 'vendor-react';
            if (id.includes('lucide-react') || id.includes('react-hot-toast')) return 'vendor-ui';
            if (id.includes('@tanstack/react-query')) return 'vendor-query';
            if (id.includes('axios')) return 'vendor-axios';
            if (id.includes('zustand')) return 'vendor-zustand';
            if (id.includes('react-hook-form') || id.includes('zod') || id.includes('@hookform/resolvers')) return 'vendor-forms';
            return 'vendor'; // catch-all for other deps
          }
        }
      }
    }
  },
  // Optimise pre-bundling of heavy deps in dev mode
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@tanstack/react-query',
      'axios',
      'zustand',
      'lucide-react',
      'react-hot-toast',
    ]
  }
})
