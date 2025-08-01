import { createWeb3Modal, defaultWagmiConfig } from '@web3modal/wagmi/react';
import { mainnet, polygon, bsc } from 'viem/chains';

// 1. Get projectId at https://cloud.walletconnect.com
const projectId = 'YOUR_WALLETCONNECT_PROJECT_ID';

// 2. Create wagmiConfig
const metadata = {
  name: 'Sand Payment',
  description: 'Pay with SAND',
  url: 'https://sandbox.game',
  icons: ['https://sandbox.game/favicon.ico']
};

export const chains = [mainnet, polygon, bsc] as const;

export const wagmiConfig = defaultWagmiConfig({
  chains,
  projectId,
  metadata,

});

// 3. Create modal
export const web3Modal = createWeb3Modal({
  wagmiConfig,
  projectId,
  themeMode: 'light',
  themeVariables: {
    '--w3m-color-mix': '#00B3B0',
    '--w3m-color-mix-strength': 40,
  },
});
