import React from 'react';
import { Dialog } from '@headlessui/react';
import type { PayArgs } from '../types';
import { payWithSand } from '../payWithSand';
import { ethers } from 'ethers';
import { injectSandModalStyles } from './sandModalStyles';
import MetaMaskIcon from '../assets/MetaMask-icon-fox.svg';
import WalletConnectIcon from '../assets/WalletConnect.svg';
// WalletConnect v1 provider is aliased in test-web/vite.config to a shim; optional at runtime
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import WalletConnectProvider from '@walletconnect/web3-provider';


interface SandModalProps {
  isOpen: boolean;
  onClose: () => void;
  args: PayArgs;
  usdValue: string;
  onSuccess?: (txHash: string) => void;
  // optional signer coming from RainbowKit/wagmi
  signer?: ethers.Signer;
}

export function SandModal({ isOpen, onClose, args, usdValue, onSuccess, signer }: SandModalProps) {
  React.useEffect(() => { injectSandModalStyles(); }, []);
  const [loading, setLoading] = React.useState(false);
  const [errMsg, setErrMsg] = React.useState<string | null>(null);
  const [internalSigner, setInternalSigner] = React.useState<ethers.Signer | null>(null);
  const [connectedAddr, setConnectedAddr] = React.useState<string | null>(null);
  const wcRef = React.useRef<any | null>(null);
  const [selectedWallet, setSelectedWallet] = React.useState<'metamask' | 'walletconnect' | null>(null);

  // Ensure this hook runs on all renders to keep order stable
  React.useEffect(() => {
    return () => {
      if (wcRef.current?.disconnect) {
        try { wcRef.current.disconnect(); } catch {}
      }
    };
  }, []);

  const hasAllArgs = Boolean(args.orderId && args.recipient && args.amount && usdValue);
  const recipientLooksValid = typeof args.recipient === 'string' && /^0x[a-fA-F0-9]{40}$/.test(args.recipient);

  // Prefer the signer selected in the modal (internal) so the user can override a parent-provided signer
  const chosenSigner = internalSigner ?? signer ?? null;

  const connectMetaMask = async () => {
    setErrMsg(null);
    try {
      const eth = (window as any).ethereum;
      if (!eth) throw new Error('MetaMask not found');
      await eth.request({ method: 'eth_requestAccounts' });
      const provider = new ethers.providers.Web3Provider(eth);
      const s = await provider.getSigner();
      const addr = await s.getAddress();
      setInternalSigner(s);
      setConnectedAddr(addr);
      setSelectedWallet('metamask');
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setErrMsg(msg);
    }
  };

  const connectWalletConnect = async () => {
    setErrMsg(null);
    try {
      const infuraId = process.env.VITE_INFURA_ID || process.env.INFURA_ID;
      const wc = new WalletConnectProvider({
        infuraId,
      });
      wcRef.current = wc;
      await wc.enable();
      const provider = new ethers.providers.Web3Provider(wc as any);
      const s = await provider.getSigner();
      const addr = await s.getAddress();
      setInternalSigner(s);
      setConnectedAddr(addr);
      setSelectedWallet('walletconnect');
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setErrMsg(msg);
    }
  };

  const handleConfirm = async () => {
    setLoading(true);
    setErrMsg(null);
    try {
      if (!chosenSigner) throw new Error('Please select a wallet first');
      const hash = await payWithSand({ ...args, signer: chosenSigner });
      onSuccess?.(hash);
      onClose();
    } catch (e) {
      console.error(e);
      const msg = e instanceof Error ? e.message : String(e);
      setErrMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  const orderId = args.orderId;
  const destination = args.recipient;
  const amount = ethers.utils.formatUnits(args.amount, 18);

  return (
    <Dialog open={isOpen} onClose={onClose} className="sand-modal-overlay">
      <div className="sand-modal-content">
        {/* Header */}
        <div className="sand-modal-header">
          <div style={{display:'flex',alignItems:'center',gap:'0.5rem'}}>
            <span className="sand-modal-network-icon">
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#fff" /></svg>
            </span>
            <span className="sand-modal-title">Pay with $SAND</span>
          </div>
          <button onClick={onClose} className="sand-modal-close">×</button>
        </div>

        {/* Amount */}
        <div className="sand-modal-amount-box">
          <div className="sand-modal-amount">{amount} $SAND</div>
          <div className="sand-modal-usd">{usdValue}</div>
        </div>
        {/* Validation status (inline, non-blocking for wallet selection) */}
        {(!hasAllArgs || !recipientLooksValid) && (
          <div className="sand-modal-error">
            {!hasAllArgs ? 'Missing required payment information.' : 'Recipient address looks invalid.'}
          </div>
        )}

        {/* Network */}
        <div className="sand-modal-network">
          <span className="sand-modal-network-icon">
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#7b3fe4" /></svg>
          </span>
          <div>
            <div className="sand-modal-network-label">Polygon</div>
            <div className="sand-modal-network-gas">gas ≈ 0.03 USD</div>
          </div>
        </div>

        {/* Wallet chooser (always visible so user can change wallet) */}
        <div className="sand-wallets">
          <div className="sand-wallets-title">Select Wallet</div>
          <div className="sand-wallets-row">
            <button
              className={`sand-wallet-btn ${selectedWallet === 'metamask' ? 'selected' : ''}`}
              onClick={connectMetaMask}
              disabled={loading}
            >
              <img src={MetaMaskIcon} alt="MetaMask" width={20} height={20} />
              MetaMask
            </button>
            <button
              className={`sand-wallet-btn ${selectedWallet === 'walletconnect' ? 'selected' : ''}`}
              onClick={connectWalletConnect}
              disabled={loading}
            >
              <img src={WalletConnectIcon} alt="WalletConnect" width={20} height={20} />
              WalletConnect
            </button>
            {internalSigner && (
              <button
                className="sand-wallet-btn"
                onClick={() => { setInternalSigner(null); setConnectedAddr(null); setSelectedWallet(null); }}
                disabled={loading}
              >
                Disconnect
              </button>
            )}
          </div>
        </div>

        {/* Connection status / errors */}
        {errMsg && (
          <div className="sand-modal-error">
            {errMsg}
          </div>
        )}

        {/* Order Recap */}
        <div className="sand-modal-recap">
          <div className="sand-modal-recap-label">Order Recap</div>
          <div className="sand-modal-recap-box">
            <div className="sand-modal-row">
              <span>Order ID</span>
              <span style={{maxWidth:'70%',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{orderId}</span>
            </div>
            <div className="sand-modal-row">
              <span>Destination</span>
              <span style={{maxWidth:'70%',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{destination}</span>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="sand-modal-actions">
          <button
            className="sand-modal-btn cancel"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            className="sand-modal-btn confirm"
            onClick={handleConfirm}
            disabled={
              loading ||
              !chosenSigner ||
              !hasAllArgs ||
              !recipientLooksValid
            }
          >
            {loading ? 'Processing…' : 'Confirm & Pay'}
          </button>
        </div>
      </div>
    </Dialog>
  );
}
