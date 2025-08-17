import { Contract, ethers } from 'ethers';
import type { PayArgs } from './types';

const ABI = [
  'function pay(bytes32 orderId, uint256 amount, address recipient) external',
  'function payWithPermit(bytes32 orderId, uint256 amount, uint256 deadline, uint8 v, bytes32 r, bytes32 s, address recipient) external'
];

/**
 * payWithSand handles both permit and approval flows.
 */
export async function payWithSand(args: PayArgs): Promise<string> {
  const { amount, orderId, recipient, deadline, v, r, s, signer } = args;
  if (!ethers.utils.isAddress(recipient)) {
    throw new Error('Invalid recipient address');
  }
  // Require an external signer (e.g., provided by RainbowKit/wagmi)
  if (!signer) {
    throw new Error('No signer provided. Please connect a wallet via RainbowKit/Wagmi and pass the signer to payWithSand.');
  }
  const provider = signer.provider;
  if (!provider) {
    throw new Error('Signer has no provider. Ensure the signer is connected to a network.');
  }
  // Chain configuration (default to Polygon 137)
  const preferredChainId: number = ((): number => {
    if (args.chainId) return args.chainId;
    const fromEnv = (process.env.PAY_WITH_SAND_CHAIN_ID || process.env.CHAIN_ID || '') as string;
    const n = Number(fromEnv);
    return Number.isFinite(n) && n > 0 ? n : 137;
  })();
  const network = await (provider as ethers.providers.Provider).getNetwork();
  if (network.chainId !== preferredChainId) {
    throw new Error(`Wrong network: expected chainId ${preferredChainId}, got ${network.chainId}`);
  }
  // Resolve contract address per chain (fallback to legacy env var)
  const perChainKey = `PAYMENT_CONTRACT_ADDRESS_${network.chainId}`;
  const contractAddress = (process.env[perChainKey as any] as string) || (process.env.REACT_APP_PAYMENT_CONTRACT_ADDRESS as string);
  if (!contractAddress) {
    throw new Error(`Missing payment contract address for chainId ${network.chainId}. Set ${perChainKey} or REACT_APP_PAYMENT_CONTRACT_ADDRESS.`);
  }
  const contract = new Contract(contractAddress, ABI, signer);

  // Use permit flow if signature params are present
  if (deadline && v !== undefined && r && s) {
    const tx = await contract.payWithPermit(orderId, amount, deadline, v, r, s, recipient);
    return tx.hash;
  }

  // Fallback to traditional pay
  const tx = await contract.pay(orderId, amount, recipient);
  return tx.hash;
}
