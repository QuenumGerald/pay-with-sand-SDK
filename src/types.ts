export interface PayArgs {
  amount: string;
  orderId: string;
  recipient: string;
  // optional permit fields
  deadline?: number;
  v?: number;
  r?: string;
  s?: string;
  chainId?: number;
  // optional wallet selector: defaults to auto (MetaMask if available else WalletConnect)
  wallet?: 'metamask' | 'walletconnect';
}
