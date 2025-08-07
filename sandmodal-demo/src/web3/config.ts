import { createWeb3Modal, defaultWagmiConfig } from '@web3modal/wagmi/react';
import { mainnet, polygon, bsc, sepolia } from 'viem/chains';
import { createPublicClient, http } from 'viem';

// 1. Get projectId at https://cloud.walletconnect.com
const projectId = 'YOUR_WALLETCONNECT_PROJECT_ID';

// 2. Create wagmiConfig
const metadata = {
  name: 'Sand Payment',
  description: 'Pay with SAND',
  url: 'https://sandbox.game',
  icons: ['https://sandbox.game/favicon.ico']
};

// Configuration pour Sepolia
export const sepoliaChain = {
  ...sepolia,
  rpcUrls: {
    default: {
      http: ['https://rpc.sepolia.org'],
      webSocket: ['wss://rpc.sepolia.org']
    },
    public: {
      http: ['https://rpc.sepolia.org'],
      webSocket: ['wss://rpc.sepolia.org']
    }
  }
};

export const chains = [sepoliaChain, mainnet, polygon, bsc] as const;

export const wagmiConfig = defaultWagmiConfig({
  chains,
  projectId,
  metadata,
});

// Configuration pour les transactions de test
export const publicClient = createPublicClient({
  chain: sepoliaChain,
  transport: http()
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
