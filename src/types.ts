 import type { Signer } from 'ethers'

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
  // optional signer (recommended: pass from RainbowKit/wagmi)
  signer?: Signer;
}
