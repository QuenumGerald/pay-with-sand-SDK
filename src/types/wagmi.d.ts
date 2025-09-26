declare module 'wagmi' {
  export interface WalletClient {
    account: { address: string };
    chain?: { id: number };
    request(args: { method: string; params?: unknown[] }): Promise<unknown>;
  }

  export function useAccount(): { address?: string; isConnected: boolean };
  export function useDisconnect(): { disconnect: () => void };
  export function useWalletClient(): { data?: WalletClient | undefined };
}
