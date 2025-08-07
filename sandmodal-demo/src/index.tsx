// Import error silencing utility first
import './utils/silenceMetamaskErrors';

import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { WagmiConfig } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { wagmiConfig } from './web3/config';
import reportWebVitals from './reportWebVitals';

// Handle MetaMask provider injection
if (typeof window.ethereum !== 'undefined') {
  // Handle the case where the page is reloaded
  window.ethereum.autoRefreshOnNetworkChange = false;
  
  // Handle chain changed
  window.ethereum.on('chainChanged', () => {
    window.location.reload();
  });
  
  // Handle accounts changed
  window.ethereum.on('accountsChanged', (accounts: string[]) => {
    if (accounts.length === 0) {
      console.log('Please connect to MetaMask.');
    } else {
      window.location.reload();
    }
  });
}

const queryClient = new QueryClient();
const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <WagmiConfig config={wagmiConfig}>
        <App />
      </WagmiConfig>
    </QueryClientProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
