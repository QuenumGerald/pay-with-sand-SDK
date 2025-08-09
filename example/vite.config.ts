import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react()],
    define: {
      'process.env.REACT_APP_PAYMENT_CONTRACT_ADDRESS': JSON.stringify(env.VITE_PAYMENT_CONTRACT_ADDRESS || ''),
      'process.env.INFURA_ID': JSON.stringify(env.VITE_INFURA_ID || ''),
      'process.env.PRICE_API_URL': JSON.stringify(env.VITE_PRICE_API_URL || ''),
      'process.env.PRICE_API_JSON_PATH': JSON.stringify(env.VITE_PRICE_API_JSON_PATH || ''),
    },
  };
});
