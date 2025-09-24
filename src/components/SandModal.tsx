import React from 'react';
import { Dialog } from '@headlessui/react';
import type { PayArgs } from '../types';
import { payWithSand } from '../payWithSand';
import { ethers } from 'ethers';
import { injectSandModalStyles } from './sandModalStyles';
import MetaMaskIcon from '../assets/MetaMask-icon-fox.svg';
// WalletConnect removed per product requirement


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
  const [selectedWallet, setSelectedWallet] = React.useState<'metamask' | null>(null);

  // Ensure this hook runs on all renders to keep order stable
  React.useEffect(() => { return () => {}; }, []);

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
      setInternalSigner(s);
      setSelectedWallet('metamask');
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setErrMsg(msg);
    }
  };

  // WalletConnect removed

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
      <div className="sand-modal-shell">
        <div className="sand-modal-accent" aria-hidden="true" />
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

          <p className="sand-modal-subtitle">Expérience de paiement premium sécurisée sur Polygon.</p>

          <div className="sand-modal-badges" role="list">
            <span className="sand-modal-badge" role="listitem">Sécurisé</span>
            <span className="sand-modal-badge" role="listitem">Temps réel</span>
            <span className="sand-modal-badge" role="listitem">Non-custodial</span>
          </div>

          {/* Amount */}
          <div className="sand-modal-amount-box">
            <div className="sand-modal-amount">{amount} $SAND</div>
            <div className="sand-modal-usd">{usdValue}</div>
            <div className="sand-modal-amount-details">
              <div>
                <span className="sand-modal-amount-details-label">Débit estimé</span>
                <span className="sand-modal-amount-details-value">Immédiat</span>
              </div>
              <div>
                <span className="sand-modal-amount-details-label">Statut</span>
                <span className="sand-modal-amount-details-value sand-modal-status-pill">Prêt</span>
              </div>
            </div>
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
              {/* Disconnect button removed */}
            </div>
          </div>

          {/* Connection status / errors */}
          {errMsg && (
            <div className="sand-modal-error">
              {errMsg}
            </div>
          )}

          <div className="sand-modal-divider" aria-hidden="true" />

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
        </div>
      </Dialog>
    );
  }
