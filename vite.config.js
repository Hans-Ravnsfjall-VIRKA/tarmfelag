import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base './' keeps it portable across Netlify root and any subpath host.
// `vite build --mode native` builds the Capacitor bundle into dist-native
// (no admin or access-log code). The default build is the web build in dist.
export default defineConfig(({ mode }) => ({
  plugins: [react()],
  base: './',
  define: { __NATIVE__: JSON.stringify(mode === 'native') },
  build: { outDir: mode === 'native' ? 'dist-native' : 'dist' },
}));
