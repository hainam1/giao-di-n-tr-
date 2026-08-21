import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: '.',
  server: {
    port: 3000,
    open: true,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    outDir: 'dist',
    minify: 'terser',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        products: resolve(__dirname, 'products.html'),
        productDetail: resolve(__dirname, 'product-detail.html'),
        teaware: resolve(__dirname, 'teaware.html'),
        story: resolve(__dirname, 'story.html'),
        contact: resolve(__dirname, 'contact.html'),
        auth: resolve(__dirname, 'auth.html'),
        admin: resolve(__dirname, 'admin.html'),
      },
    },
  },
});
