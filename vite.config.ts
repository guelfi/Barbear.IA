
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

export default defineConfig({
  base: '/barbear-ia/',
  plugins: [react()],
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    target: 'esnext',
    outDir: 'build',
    rollupOptions: {
      output: {
        // Generate unique filenames with hash for cache busting
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
        // Ensure consistent chunk naming
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-select']
        }
      }
    },
    // Force clean build
    emptyOutDir: true,
    // Disable minification terser cache
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: false, // Manter console.log para depuração em produção
        drop_debugger: true
      },
      keep_fnames: true, // Preservar nomes de funções
      keep_classnames: true // Preservar nomes de classes
    }
  },
  server: {
    port: 7001,
    host: '0.0.0.0',
    open: true,
    hmr: {
      port: 7002,
      host: 'localhost'
    },
    watch: {
      usePolling: true,
      interval: 100
    },
    cors: true,
    strictPort: true
  },
});