import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';

export default defineConfig({
  base: process.env.VITE_BASE || '/',
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  build: {
    // Mock 始终输出到 dist/demo，避免覆盖流程总览首页 index.html
    outDir: 'dist/demo',
    emptyOutDir: true,
  },
  server: {
    port: 2889,
    open: '/#/poms/phase1/index',
  },
  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern-compiler',
        silenceDeprecations: ['legacy-js-api', 'import'],
      },
    },
  },
});
