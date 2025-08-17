import './polyfills';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';

// Debug: show mapped env values at runtime
// These come from vite.config.ts define mappings
console.info('[Pay-With-Sand Example] Env check', {
  REACT_APP_PAYMENT_CONTRACT_ADDRESS: (process as any).env?.REACT_APP_PAYMENT_CONTRACT_ADDRESS,
  WALLETCONNECT_PROJECT_ID: (process as any).env?.WALLETCONNECT_PROJECT_ID,
  PAY_WITH_SAND_CHAIN_ID: (process as any).env?.PAY_WITH_SAND_CHAIN_ID,
  PAY_WITH_SAND_RPC_137: (process as any).env?.PAY_WITH_SAND_RPC_137,
  PAYMENT_CONTRACT_ADDRESS_137: (process as any).env?.PAYMENT_CONTRACT_ADDRESS_137,
  SAND_TOKEN_ADDRESS_137: (process as any).env?.SAND_TOKEN_ADDRESS_137,
  PRICE_API_URL: (process as any).env?.PRICE_API_URL,
  PRICE_API_JSON_PATH: (process as any).env?.PRICE_API_JSON_PATH,
});

const el = document.getElementById('root')!;
createRoot(el).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
