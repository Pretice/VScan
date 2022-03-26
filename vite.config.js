import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    https: true,
    proxy: {
      '/api': {
        target: 'https://iscan.vercel.app',
        changeOrigin: true,
        secure: true
      }
    }
  },
  optimizeDeps: {
    exclude: [ 'fs' ]
  },
  css: {
    preprocessorOptions: {
      less: {
        javascriptEnabled: true
      }
    }
  },
  plugins: [
    vue(),
    vueJsx({
      // options are passed on to @vue/babel-plugin-jsx
    }),
  ],
  build: {
    sourcemap: 'inline'
  }
});
