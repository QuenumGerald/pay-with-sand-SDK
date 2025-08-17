import { Contract, ethers } from 'ethers';
import type { PayArgs } from './types';
import EthereumProvider from '@walletconnect/ethereum-provider';

const ABI = [
  'function pay(bytes32 orderId, uint256 amount, address recipient) external',
  'function payWithPermit(bytes32 orderId, uint256 amount, uint256 deadline, uint8 v, bytes32 r, bytes32 s, address recipient) external'
];

/**
 * payWithSand handles both permit and approval flows.
 */
export async function payWithSand(args: PayArgs): Promise<string> {
  const { amount, orderId, recipient, deadline, v, r, s, wallet } = args;
  if (!ethers.utils.isAddress(recipient)) {
    throw new Error('Invalid recipient address');
  }
  // Initialize provider according to selected wallet (default: auto)
  let provider;
  const hasMM = Boolean((window as any).ethereum);
  const selected = wallet ?? (hasMM ? 'metamask' : 'walletconnect');
  // Chain configuration (default to Polygon 137)
  const preferredChainId: number = ((): number => {
    if (args.chainId) return args.chainId;
    const fromEnv = (process.env.PAY_WITH_SAND_CHAIN_ID || process.env.CHAIN_ID || '') as string;
    const n = Number(fromEnv);
    return Number.isFinite(n) && n > 0 ? n : 137;
  })();
  const rpcFromEnv = (process.env[`PAY_WITH_SAND_RPC_${preferredChainId}` as any] as string) || '';
  const rpcMap: Record<number, string> = {
    [preferredChainId]: rpcFromEnv || (preferredChainId === 137 ? 'https://polygon-rpc.com/' : '')
  };
  if (selected === 'metamask') {
    if (!hasMM) throw new Error('MetaMask not detected in browser');
    provider = new ethers.providers.Web3Provider((window as any).ethereum, 'any');
    await provider.send('eth_requestAccounts', []);
  } else if (selected === 'walletconnect') {
    const projectId = process.env.WALLETCONNECT_PROJECT_ID || process.env.WC_PROJECT_ID;
    if (!projectId) {
      throw new Error('WALLETCONNECT_PROJECT_ID environment variable is required for WalletConnect v2');
    }
    const wc = await EthereumProvider.init({
      projectId,
      chains: [preferredChainId],
      rpcMap,
      showQrModal: true,
      methods: ['eth_sendTransaction', 'personal_sign', 'eth_signTypedData', 'eth_signTypedData_v4'],
      events: ['chainChanged', 'accountsChanged']
    });
    await wc.enable();
    provider = new ethers.providers.Web3Provider(wc as any, 'any');
  } else {
    throw new Error(`Unsupported wallet: ${selected}`);
  }

  const network = await (provider as ethers.providers.Web3Provider).getNetwork();
  if (network.chainId !== preferredChainId) {
    throw new Error(`Wrong network: expected chainId ${preferredChainId}, got ${network.chainId}`);
  }
  // Resolve contract address per chain (fallback to legacy env var)
  const perChainKey = `PAYMENT_CONTRACT_ADDRESS_${network.chainId}`;
  const contractAddress = (process.env[perChainKey as any] as string) || (process.env.REACT_APP_PAYMENT_CONTRACT_ADDRESS as string);
  if (!contractAddress) {
    throw new Error(`Missing payment contract address for chainId ${network.chainId}. Set ${perChainKey} or REACT_APP_PAYMENT_CONTRACT_ADDRESS.`);
  }
  const signer = provider.getSigner();
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
