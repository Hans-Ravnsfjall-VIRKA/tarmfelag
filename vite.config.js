import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base './' keeps it portable across Netlify root and any subpath host.
export default defineConfig({
  plugins: [react()],
  base: './',
});
