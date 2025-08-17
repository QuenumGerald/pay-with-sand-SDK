import { defineConfig, loadEnv } from 'vite';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'url';
import { URL } from 'url';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  // Build dynamic mappings for multi-chain keys
  const defines: Record<string, string> = {
    global: 'globalThis',
    // Legacy fallbacks kept for backward compat
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
    // New WC v2 + chain config
    'process.env.WALLETCONNECT_PROJECT_ID': JSON.stringify(
      env.VITE_WALLETCONNECT_PROJECT_ID || env.WALLETCONNECT_PROJECT_ID || ''
    ),
    'process.env.PAY_WITH_SAND_CHAIN_ID': JSON.stringify(
      env.VITE_PAY_WITH_SAND_CHAIN_ID || env.PAY_WITH_SAND_CHAIN_ID || ''
    ),
  };

  // Mirror any VITE_PAY_WITH_SAND_RPC_* into process.env.PAY_WITH_SAND_RPC_*
  Object.keys(env)
    .filter((k) => k.startsWith('VITE_PAY_WITH_SAND_RPC_'))
    .forEach((k) => {
      const chainSuffix = k.replace('VITE_PAY_WITH_SAND_RPC_', '');
      defines[`process.env.PAY_WITH_SAND_RPC_${chainSuffix}`] = JSON.stringify(env[k]);
    });

  // Mirror any VITE_PAYMENT_CONTRACT_ADDRESS_* into process.env.PAYMENT_CONTRACT_ADDRESS_*
  Object.keys(env)
    .filter((k) => k.startsWith('VITE_PAYMENT_CONTRACT_ADDRESS_'))
    .forEach((k) => {
      const chainSuffix = k.replace('VITE_PAYMENT_CONTRACT_ADDRESS_', '');
      defines[`process.env.PAYMENT_CONTRACT_ADDRESS_${chainSuffix}`] = JSON.stringify(env[k]);
    });

  // Mirror any VITE_SAND_TOKEN_ADDRESS_* into process.env.SAND_TOKEN_ADDRESS_*
  Object.keys(env)
    .filter((k) => k.startsWith('VITE_SAND_TOKEN_ADDRESS_'))
    .forEach((k) => {
      const chainSuffix = k.replace('VITE_SAND_TOKEN_ADDRESS_', '');
      defines[`process.env.SAND_TOKEN_ADDRESS_${chainSuffix}`] = JSON.stringify(env[k]);
    });

  return {
    plugins: [react()],
    define: defines,
    resolve: {
      alias: {
        // Shim WalletConnect v1 provider to avoid bundling it in the example app.
        '@walletconnect/web3-provider': fileURLToPath(new URL('./src/shims/walletconnect-web3-provider.ts', import.meta.url)),
        util: require.resolve('util/'),
        events: require.resolve('events/'),
        stream: require.resolve('stream-browserify'),
        assert: require.resolve('assert/'),
        crypto: require.resolve('crypto-browserify'),
        path: require.resolve('path-browserify'),
        process: require.resolve('process/browser'),
      },
    },
    optimizeDeps: {
      include: ['buffer', 'process', 'util', 'events', 'stream-browserify', 'assert', 'crypto-browserify', 'path-browserify'],
      // Ensure Vite doesn't try to prebundle the WC v1 package
      exclude: ['@walletconnect/web3-provider'],
    },
  };
});
