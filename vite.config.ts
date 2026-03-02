import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    // FIX 1: Stop the "Watcher Lag"
    watch: {
      ignored: [
        '**/untitled-0/**', 
        '**/node_modules/**', 
        '**/.vite/**',
        '**/.git/**'
      ]
    },
    // FIX 2: Faster initial load for heavy modules
    warmup: {
      clientFiles: [
        './src/main.tsx',
        './src/App.tsx',
        './src/components/PlayerSanctum.tsx',
        './src/components/DatabaseVault.tsx'
      ]
    }
  },
  // FIX 3: Explicit Pathing (No Aliases to prevent loop)
  resolve: {
    alias: [] 
  }
});