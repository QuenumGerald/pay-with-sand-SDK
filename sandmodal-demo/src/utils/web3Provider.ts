import { BrowserProvider, JsonRpcSigner } from 'ethers';

declare global {
  interface Window {
    ethereum?: any;
  }
}

export async function getWeb3Provider() {
  if (!window.ethereum) {
    throw new Error('No crypto wallet found. Please install MetaMask.');
  }

  try {
    // Request account access if needed
    await window.ethereum.request({ method: 'eth_requestAccounts' });
    
    // Create a new provider with the injected provider
    const provider = new BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    
    return { provider, signer };
  } catch (error) {
    console.error('Error connecting to MetaMask:', error);
    throw error;
  }
}

// Add error handler for MetaMask
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
