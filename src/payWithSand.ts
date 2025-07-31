import { Contract, ethers } from 'ethers';
import type { PayArgs } from './types';
import WalletConnectProvider from '@walletconnect/web3-provider';

const ABI = [
  'function pay(bytes32 orderId, uint256 amount, address recipient) external',
  'function payWithPermit(bytes32 orderId, uint256 amount, uint256 deadline, uint8 v, bytes32 r, bytes32 s, address recipient) external'
];

/**
 * payWithSand handles both permit and approval flows.
 */
export async function payWithSand(args: PayArgs): Promise<string> {
  const { amount, orderId, recipient, deadline, v, r, s } = args;
  if (!ethers.utils.isAddress(recipient)) {
    throw new Error('Invalid recipient address');
  }
  // Initialize provider with WalletConnect or MetaMask
  let provider;
  if ((window as any).ethereum) {
    provider = new ethers.providers.Web3Provider((window as any).ethereum);
    await provider.send('eth_requestAccounts', []);
  } else {
    const wc = new WalletConnectProvider({ infuraId: process.env.INFURA_ID });
    await wc.enable();
    provider = new ethers.providers.Web3Provider(wc as any);
  }

  const signer = provider.getSigner();
  const contractAddress = process.env.REACT_APP_PAYMENT_CONTRACT_ADDRESS!;
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
