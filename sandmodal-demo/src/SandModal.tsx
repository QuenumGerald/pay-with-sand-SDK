import React, { useState } from 'react';
import { Dialog } from '@headlessui/react';
import type { PayArgs as OrigPayArgs } from './types';
import { payWithSand } from './payWithSand';
// Removed wagmi hooks that cause errors
// import { useAccount, useDisconnect } from 'wagmi';
// import { Web3Button } from '@web3modal/react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Chain configurations
const CHAINS = {
  ethereum: { id: 1, name: 'Ethereum', explorer: 'etherscan.io', gas: '0.05 ETH' },
  polygon: { id: 137, name: 'Polygon', explorer: 'polygonscan.com', gas: '0.03 USD' },
  bsc: { id: 56, name: 'BSC', explorer: 'bscscan.com', gas: '0.02 USD' }
} as const;

type ChainKey = keyof typeof CHAINS;

// Extend for demo: allow chainId
interface PayArgs extends OrigPayArgs {
  chainId?: number;
}

interface SandModalProps {
  isOpen: boolean;
  onClose: () => void;
  args: PayArgs;
  onSuccess?: (txHash: string) => void;
}

const TransactionLoader = ({ txHash, chainId }: { txHash: string, chainId: number }) => {
  const chain = Object.values(CHAINS).find(c => c.id === chainId) || CHAINS.ethereum;
  return (
    <div style={{ textAlign: 'center', margin: '20px 0' }}>
      <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
      <p>Processing on-chain</p>
      <a
        href={`https://${chain.explorer}/tx/${txHash}`}
        target="_blank"
        rel="noopener noreferrer"
        style={{ color: '#00B3B0', textDecoration: 'none' }}
      >
        View on {chain.name}
      </a>
    </div>
  );
};

const SuccessState = ({ txHash, chainId }: { txHash: string, chainId: number }) => {
  const chain = Object.values(CHAINS).find(c => c.id === chainId) || CHAINS.ethereum;
  return (
    <div style={{ textAlign: 'center', margin: '20px 0' }}>
      <div style={{ fontSize: '48px', marginBottom: '16px', color: '#10B981' }}>✓</div>
      <p>Payment Confirmed!</p>
      <a
        href={`https://${chain.explorer}/tx/${txHash}`}
        target="_blank"
        rel="noopener noreferrer"
        style={{ color: '#00B3B0', textDecoration: 'none' }}
      >
        View on {chain.name}
      </a>
    </div>
  );
};

export function SandModal({ isOpen, onClose, args, onSuccess }: SandModalProps) {
  // Simulate wallet connection state
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState<string | null>(null);
  const [selectedWallet, setSelectedWallet] = useState<string | null>(null);

  // Simulate wallet connection/disconnection
  const connect = (walletName: string) => {
    setAddress('0x1234567890abcdef1234567890abcdef12345678');
    setIsConnected(true);
    setSelectedWallet(walletName);
  };

  const disconnect = () => {
    setAddress(null);
    setIsConnected(false);
    setSelectedWallet(null);
  };

  const orderId = args.orderId || 'ABC-1234';
  const destination = args.recipient || '0xAbcd...7890';
  const amount = (typeof args.amount === 'string' ? (Number(args.amount) / 1e18).toFixed(2) : '25.00');

  // Définir un type explicite pour éviter les erreurs TypeScript
  type TxState = 'idle' | 'sending' | 'success' | 'error';
  const [txState, setTxState] = useState<TxState>('idle');
  const [txHash, setTxHash] = useState<string | null>(null);
  const [selectedChain, setSelectedChain] = useState<keyof typeof CHAINS>('ethereum');

  const chainOptions = [
    { label: 'Ethereum', value: 'ethereum', chainId: CHAINS.ethereum.id },
    { label: 'Polygon', value: 'polygon', chainId: CHAINS.polygon.id },
    { label: 'BSC', value: 'bsc', chainId: CHAINS.bsc.id },
  ];

  // Format address to 0xAbcd...1234 format
  const formatAddress = (address: string) => {
    if (!address || address === 'N/A') return address;
    if (address.length < 10) return address;
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  const formattedDestination = formatAddress(destination);
  const formattedAddress = address ? formatAddress(address) : '';

  const handleConfirm = async () => {
    if (!isConnected) {
      toast.error('Please connect your wallet first');
      return;
    }

    setTxState('sending');
    setTxHash(null);

    try {
      const selectedChainId = CHAINS[selectedChain].id;
      const hash = await payWithSand({
        ...args,
        chainId: selectedChainId,
      });
      setTxHash(hash);
      setTxState('success');
      onSuccess?.(hash);
    } catch (error: any) {
      console.error('Payment error:', error);
      setTxState('error');
      toast.error(error?.message || 'Payment failed. Please try again.');
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel style={{
          background: '#1E293B',
          padding: '1.5rem',
          borderRadius: '0.5rem',
          width: '100%',
          maxWidth: '28rem',
          color: 'white'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <Dialog.Title style={{ fontSize: '1.25rem', fontWeight: '600' }}>
              {txState === 'success' ? 'Payment Successful' : 'Pay with SAND'}
            </Dialog.Title>
            <button
              onClick={onClose}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#8fa2c7',
                fontSize: '1.25rem',
                opacity: txState === 'sending' ? 0.5 : 1,
                cursor: txState === 'sending' ? 'not-allowed' : 'pointer'
              }}
              disabled={txState === 'sending'}
            >
              {txState === 'sending' ? '' : '✕'}
            </button>
          </div>

          {txState === 'success' && txHash ? (
            <SuccessState txHash={txHash} chainId={CHAINS[selectedChain].id} />
          ) : txState === 'sending' ? (
            txHash ? (
              <TransactionLoader txHash={txHash} chainId={CHAINS[selectedChain].id} />
            ) : (
              <div style={{ textAlign: 'center', margin: '1.25rem 0' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>↻</div>
                <p>Waiting for confirmation...</p>
              </div>
            )
          ) : (
            <>
              <div style={{ background: '#0F172A', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1rem' }}>
                <div style={{ fontSize: '1.75rem', color: 'white', textAlign: 'center', marginBottom: '0.5rem' }}>
                  {amount} SAND
                </div>
                <div style={{ height: '1px', background: '#1E293B', margin: '1rem 0' }} />

                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <span style={{ color: '#8fa2c7', fontSize: '0.875rem' }}>Order ID</span>
                  <span style={{ color: '#8fa2c7', fontSize: '0.9375rem' }}>{orderId}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: isConnected ? '0.75rem' : 0 }}>
                  <span style={{ color: '#8fa2c7', fontSize: '0.875rem' }}>Destination</span>
                  <span style={{ color: '#8fa2c7', fontSize: '0.9375rem' }}>{formattedDestination}</span>
                </div>

                {isConnected && (
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginTop: '0.75rem',
                    paddingTop: '0.75rem',
                    borderTop: '1px solid #1E293B'
                  }}>
                    <span style={{ color: '#8fa2c7', fontSize: '0.875rem' }}>Connected Wallet</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ color: 'white', fontSize: '0.875rem' }}>{formattedAddress}</span>
                      <button
                        onClick={() => disconnect()}
                        style={{
                          background: 'transparent',
                          border: '1px solid #8fa2c7',
                          borderRadius: '0.25rem',
                          color: '#8fa2c7',
                          padding: '0.125rem 0.375rem',
                          fontSize: '0.75rem',
                          cursor: 'pointer'
                        }}
                      >
                        Disconnect
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {!isConnected ? (
                <div style={{ textAlign: 'center', margin: '1.25rem 0' }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center', marginBottom: '1rem' }}>
                    <div
                      onClick={() => connect('MetaMask')}
                      style={{
                        width: '80px',
                        height: '80px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        border: '1px solid #334155',
                        borderRadius: '8px',
                        padding: '8px',
                        background: '#0F172A'
                      }}
                    >
                      <div style={{ fontSize: '24px', marginBottom: '4px' }}>🦊</div>
                      <div style={{ fontSize: '12px', color: 'white' }}>MetaMask</div>
                    </div>

                    <div
                      onClick={() => connect('Rainbow')}
                      style={{
                        width: '80px',
                        height: '80px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        border: '1px solid #334155',
                        borderRadius: '8px',
                        padding: '8px',
                        background: '#0F172A'
                      }}
                    >
                      <div style={{ fontSize: '24px', marginBottom: '4px' }}>🌈</div>
                      <div style={{ fontSize: '12px', color: 'white' }}>Rainbow</div>
                    </div>

                    <div
                      onClick={() => connect('Ledger')}
                      style={{
                        width: '80px',
                        height: '80px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        border: '1px solid #334155',
                        borderRadius: '8px',
                        padding: '8px',
                        background: '#0F172A'
                      }}
                    >
                      <div style={{ fontSize: '24px', marginBottom: '4px' }}>💼</div>
                      <div style={{ fontSize: '12px', color: 'white' }}>Ledger</div>
                    </div>

                    <div
                      onClick={() => connect('WalletConnect')}
                      style={{
                        width: '80px',
                        height: '80px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        border: '1px solid #334155',
                        borderRadius: '8px',
                        padding: '8px',
                        background: '#0F172A'
                      }}
                    >
                      <div style={{ fontSize: '24px', marginBottom: '4px' }}>📱</div>
                      <div style={{ fontSize: '12px', color: 'white' }}>WalletConnect</div>
                    </div>
                  </div>
                  <p style={{ color: '#8fa2c7', fontSize: '0.875rem' }}>Select a wallet to continue</p>
                </div>
              ) : (
                <>
                  <div style={{ marginBottom: '1rem' }}>
                    <div style={{ marginBottom: '0.5rem', fontSize: '0.875rem', color: 'white' }}>Network</div>
                    <select
                      value={selectedChain}
                      onChange={(e) => setSelectedChain(e.target.value as ChainKey)}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        background: '#0F172A',
                        border: '1px solid #334155',
                        borderRadius: '0.5rem',
                        color: 'white',
                        fontSize: '0.875rem'
                      }}
                      disabled={false}
                    >
                      {chainOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                      onClick={onClose}
                      style={{
                        width: '50%',
                        padding: '0.75rem',
                        background: 'transparent',
                        color: 'white',
                        border: '1px solid #334155',
                        borderRadius: '0.5rem',
                        fontSize: '1rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        opacity: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem'
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleConfirm}
                      disabled={false}
                      style={{
                        width: '50%',
                        padding: '0.75rem',
                        background: '#8B5CF6',
                        color: 'white',
                        border: 'none',
                        borderRadius: '0.5rem',
                        fontSize: '1rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        opacity: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem'
                      }}
                    >
                      Confirm & Pay
                    </button>
                  </div>
                </>
              )}
            </>
          )}
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}