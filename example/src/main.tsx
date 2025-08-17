import './polyfills';
import './index.css';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import '@rainbow-me/rainbowkit/styles.css';
import { RainbowKitProvider, lightTheme, getDefaultConfig } from '@rainbow-me/rainbowkit';
import { WagmiProvider, http } from 'wagmi';
import { polygon } from 'wagmi/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

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
// RainbowKit default config with WalletConnect support (requires WALLETCONNECT_PROJECT_ID)
const chains = [polygon] as const;
const projectId = (process as any).env?.WALLETCONNECT_PROJECT_ID || '';
if (!projectId) {
  console.warn('[RainbowKit] WALLETCONNECT_PROJECT_ID is missing. WalletConnect may not function.');
}
let wagmiConfig = getDefaultConfig({
  appName: 'Pay With Sand - Example',
  projectId,
  chains,
  transports: {
    [polygon.id]: http(),
  },
  ssr: false,
});
// Force manual connection (show RainbowKit first) instead of auto-connecting to injected wallets
wagmiConfig = { ...wagmiConfig, autoConnect: false } as typeof wagmiConfig;
const queryClient = new QueryClient();

createRoot(el).render(
  <React.StrictMode>
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={lightTheme()}>
          <App />
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  </React.StrictMode>
);
