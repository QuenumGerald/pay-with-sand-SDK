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
    const setup = async () => {
      let provider;
      if ((window as any).ethereum) {
        provider = new ethers.providers.Web3Provider((window as any).ethereum);
      } else {
        const wc = new WalletConnectProvider({ infuraId: process.env.INFURA_ID });
        await wc.enable();
        provider = new ethers.providers.Web3Provider(wc as any);
      }

      const contractAddress = process.env.REACT_APP_PAYMENT_CONTRACT_ADDRESS!;
      const contract = new ethers.Contract(contractAddress, EVENT_ABI, provider);
      const filter = contract.filters.PaymentDone(orderId);

      contract.on(filter, (_oid, _payer, _amount) => {
        setStatus('confirmed');
      });
    };
    setup();

    return () => {
      // provider and listeners will clean up on component unmount
    };
  }, [orderId]);

  return status;
}
