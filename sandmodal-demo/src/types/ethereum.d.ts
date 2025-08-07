declare global {
  interface Window {
    ethereum?: {
      isMetaMask?: boolean;
      autoRefreshOnNetworkChange: boolean;
      on: (event: string, callback: (...args: any[]) => void) => void;
      removeListener: (event: string, callback: (...args: any[]) => void) => void;
      request: (request: { method: string; params?: any[] }) => Promise<any>;
    };
  }
}

// This file doesn't need to export anything since it's just type declarations
