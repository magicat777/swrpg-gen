import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 3001,
    strictPort: true,
    hmr: {
      port: 3001,
    },
    watch: {
      usePolling: true,
      interval: 1000,
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false, // Disable source maps in production for smaller bundles
    minify: 'esbuild', // Use esbuild for faster builds
    target: 'es2020',
    rollupOptions: {
      output: {
        manualChunks: {
          // Core React libraries
          vendor: ['react', 'react-dom'],
          // Router and state management
          router: ['react-router-dom'],
          // UI libraries
          ui: ['styled-components', 'lucide-react'],
          // Form libraries
          forms: ['react-hook-form', '@hookform/resolvers', 'zod'],
          // API and auth
          api: ['axios'],
        },
        // Optimize chunk names
        chunkFileNames: 'js/[name]-[hash].js',
        entryFileNames: 'js/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name!.split('.');
          const extType = info[info.length - 1];
          if (/\.(css)$/.test(assetInfo.name!)) {
            return 'css/[name]-[hash].[ext]';
          }
          if (/\.(png|jpe?g|svg|gif|tiff|bmp|ico)$/i.test(assetInfo.name!)) {
            return 'images/[name]-[hash].[ext]';
          }
          if (/\.(woff2?|eot|ttf|otf)$/i.test(assetInfo.name!)) {
            return 'fonts/[name]-[hash].[ext]';
          }
          return `${extType}/[name]-[hash].[ext]`;
        },
      },
    },
    // Increase chunk size warning limit
    chunkSizeWarningLimit: 1000,
  },
  optimizeDeps: {
    include: [
      'react', 
      'react-dom', 
      'react-router-dom', 
      'styled-components',
      'react-hook-form',
      '@hookform/resolvers/zod',
      'zod',
      'axios',
      'lucide-react'
    ],
  },
  resolve: {
    alias: {
      '@': '/src',
    },
  },
})
