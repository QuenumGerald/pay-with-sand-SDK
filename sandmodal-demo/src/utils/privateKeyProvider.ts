import { ethers } from 'ethers';
import { Contract } from 'ethers';
// Types
type NetworkConfig = {
  name: string;
  chainId: number;
  rpcUrl: string;
  explorerUrl: string;
};

// Configuration des réseaux supportés
const NETWORKS: Record<string, NetworkConfig> = {
  sepolia: {
    name: 'sepolia',
    chainId: 11155111,
    rpcUrl: 'https://sepolia.infura.io/v3/' + (process.env.REACT_APP_INFURA_ID || ''),
    explorerUrl: 'https://sepolia.etherscan.io'
  },
  // Ajoutez d'autres réseaux si nécessaire
};

// ABI pour le contrat de paiement
const PAYMENT_ABI = [
  'function pay(bytes32 orderId, uint256 amount, address recipient) external',
  'function payWithPermit(bytes32 orderId, uint256 amount, uint256 deadline, uint8 v, bytes32 r, bytes32 s, address recipient) external'
];

/**
 * Crée un provider et un signer à partir d'une clé privée
 */
function getPrivateKeySigner(networkName: string = 'sepolia') {
  const privateKey = process.env.REACT_APP_PRIVATE_KEY;
  if (!privateKey) {
    throw new Error('REACT_APP_PRIVATE_KEY is not defined in environment variables');
  }

  const network = NETWORKS[networkName];
  if (!network) {
    throw new Error(`Network ${networkName} is not supported`);
  }

  const provider = new ethers.JsonRpcProvider(network.rpcUrl);
  return new ethers.Wallet(privateKey, provider);
}

/**
 * Effectue un paiement en utilisant une clé privée
 */
export async function payWithPrivateKey(
  orderId: string,
  amount: string,
  recipient: string,
  networkName: string = 'sepolia'
): Promise<string> {
  try {
    const signer = getPrivateKeySigner(networkName);
    const contractAddress = process.env.REACT_APP_PAYMENT_CONTRACT_ADDRESS;

    if (!contractAddress) {
      throw new Error('REACT_APP_PAYMENT_CONTRACT_ADDRESS is not defined in environment variables');
    }

    const contract = new Contract(contractAddress, PAYMENT_ABI, signer);

    console.log(`Sending payment with orderId: ${orderId}`);
    console.log(`Amount: ${amount} wei`);
    console.log(`Recipient: ${recipient}`);
    console.log(`From: ${await signer.getAddress()}`);

    // Pour le flux avec signature (permit), utilisez :
    // const tx = await contract.payWithPermit(orderId, amount, deadline, v, r, s, recipient);

    // Flux standard
    const tx = await contract.pay(
      formatBytes32String(orderId),
      amount,
      recipient
    );

    console.log('Transaction sent, waiting for confirmation...');
    const receipt = await tx.wait();
    console.log('Transaction confirmed in block:', receipt.blockNumber);

    return tx.hash;
  } catch (error) {
    console.error('Error in payWithPrivateKey:', error);
    throw error;
  }
}

/**
 * Récupère le solde d'une adresse
 */
export async function getBalance(address: string, networkName: string = 'sepolia'): Promise<string> {
  const network = NETWORKS[networkName];
  if (!network) {
    throw new Error(`Network ${networkName} is not supported`);
  }

  const provider = new ethers.JsonRpcProvider(network.rpcUrl);
  const balance = await provider.getBalance(address);
  return ethers.formatEther(balance);
}

/**
 * Récupère l'adresse associée à la clé privée
 */
export function getAddressFromPrivateKey(): string {
  const privateKey = process.env.REACT_APP_PRIVATE_KEY;
  if (!privateKey) {
    throw new Error('REACT_APP_PRIVATE_KEY is not defined in environment variables');
  }
  return new ethers.Wallet(privateKey).address;
}
function formatBytes32String(orderId: string): any | ethers.Overrides {
  throw new Error('Function not implemented.');
}

