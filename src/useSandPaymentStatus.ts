import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import WalletConnectProvider from '@walletconnect/ethereum-provider';

const EVENT_ABI = ['event PaymentDone(bytes32 indexed orderId, address indexed payer, uint256 amount)'];

/**
 * Hook to get payment status via event listening
 */
export function useSandPaymentStatus(orderId: string) {
  const [status, setStatus] = useState<'pending' | 'confirmed'>('pending');

  useEffect(() => {
    let contract: ethers.Contract | null = null;
    let filter: ethers.EventFilter | null = null;
    let wc: any = null;

    const handler = (_oid: string, _payer: string, _amount: ethers.BigNumber) => {
      setStatus('confirmed');
    };

    const setup = async () => {
      let provider;
      if ((window as any).ethereum) {
        provider = new ethers.providers.Web3Provider((window as any).ethereum);
      } else {
        // For WalletConnect, we'll need to handle this differently in a real app
        // This is a simplified version that will need to be adapted to your needs
        throw new Error('Please use a Web3 provider connected via RainbowKit or WalletConnect');
      }

      const contractAddress = process.env.REACT_APP_PAYMENT_CONTRACT_ADDRESS;
      if (!contractAddress) {
        throw new Error('REACT_APP_PAYMENT_CONTRACT_ADDRESS environment variable is required');
      }
      contract = new ethers.Contract(contractAddress, EVENT_ABI, provider);
      filter = contract.filters.PaymentDone(orderId);
      contract.on(filter, handler);
    };

    setup();

    return () => {
      if (contract && filter) {
        contract.off(filter, handler);
      }
      if (wc?.disconnect) {
        wc.disconnect();
      }
    };
  }, [orderId]);

  return status;
}
