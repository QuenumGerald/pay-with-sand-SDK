import { defineConfig } from 'vite'

export default defineConfig({
  server: {
    port: 5173,
    open: false,
    fs: {
      allow: ['..']
    }
  },
  resolve: {
    dedupe: ['react', 'react-dom'],
    alias: [
      {
        find: '@walletconnect/web3-provider',
        replacement: '/shims/wc-provider.ts'
      }
    ]
  },
  define: {
    // On s'appuie sur l'injection dans index.html
  },
})
