import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react()],
    define: {
      global: 'globalThis',
      // Support both VITE_* and legacy keys to prevent empty mappings
      'process.env.REACT_APP_PAYMENT_CONTRACT_ADDRESS': JSON.stringify(
        env.VITE_PAYMENT_CONTRACT_ADDRESS || env.REACT_APP_PAYMENT_CONTRACT_ADDRESS || ''
      ),
      'process.env.INFURA_ID': JSON.stringify(env.VITE_INFURA_ID || env.INFURA_ID || ''),
      'process.env.PRICE_API_URL': JSON.stringify(env.VITE_PRICE_API_URL || env.PRICE_API_URL || ''),
      'process.env.PRICE_API_JSON_PATH': JSON.stringify(
        env.VITE_PRICE_API_JSON_PATH || env.PRICE_API_JSON_PATH || ''
      ),
      'process.env.MERCHANT_ADDRESS': JSON.stringify(
        env.VITE_MERCHANT_ADDRESS || env.MERCHANT_ADDRESS || ''
      ),
      'process.env.SAND_TOKEN_ADDRESS': JSON.stringify(
        env.VITE_SAND_TOKEN_ADDRESS || env.SAND_TOKEN_ADDRESS || ''
      ),
      'process.env.SAND_TOKEN_NAME': JSON.stringify(
        env.VITE_SAND_TOKEN_NAME || env.SAND_TOKEN_NAME || ''
      ),
    },
    resolve: {
      alias: {
        util: 'util',
        events: 'events',
        stream: 'stream-browserify',
        assert: 'assert',
        crypto: 'crypto-browserify',
        path: 'path-browserify',
        process: 'process/browser',
      },
    },
    optimizeDeps: {
      include: ['buffer', 'process', 'util', 'events', 'stream-browserify', 'assert', 'crypto-browserify', 'path-browserify'],
    },
  };
});
