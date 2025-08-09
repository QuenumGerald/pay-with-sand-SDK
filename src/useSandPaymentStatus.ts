import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import WalletConnectProvider from '@walletconnect/web3-provider';

const EVENT_ABI = ['event PaymentDone(bytes32 indexed orderId, address indexed payer, uint256 amount)'];

/**
 * Hook to get payment status via event listening
 */
export function useSandPaymentStatus(orderId: string) {
  const [status, setStatus] = useState<'pending' | 'confirmed'>('pending');

  useEffect(() => {
    let contract: ethers.Contract | null = null;
    let filter: ethers.EventFilter | null = null;
    let wc: WalletConnectProvider | null = null;

    const handler = (_oid: string, _payer: string, _amount: ethers.BigNumber) => {
      setStatus('confirmed');
    };

    const setup = async () => {
      let provider;
      if ((window as any).ethereum) {
        provider = new ethers.providers.Web3Provider((window as any).ethereum);
      } else {
        const infuraId = process.env.INFURA_ID;
        if (!infuraId) {
          throw new Error('INFURA_ID environment variable is required');
        }
        wc = new WalletConnectProvider({ infuraId });
        await wc.enable();
        provider = new ethers.providers.Web3Provider(wc as any);
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
      wc?.disconnect?.();
    };
  }, [orderId]);

  return status;
}
