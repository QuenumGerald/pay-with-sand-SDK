import React from 'react';
import { Dialog } from '@headlessui/react';
import type { PayArgs } from '../types';
import { payWithSand } from '../payWithSand';
import { ethers } from 'ethers';
import { injectSandModalStyles } from './sandModalStyles';


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

  if (!args.orderId || !args.recipient || !args.amount || !usdValue) {
    return <div className="p-4 text-red-500">Missing required payment information</div>;
  }

  const handleConfirm = async () => {
    setLoading(true);
    setErrMsg(null);
    try {
      const hash = await payWithSand({ ...args, signer });
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

        {/* Info box */}
        <div className="sand-modal-info">
          You will sign ONE transaction using EIP-2612 permit. No separate 'approve' fee. <a href="#" style={{textDecoration:'underline',color:'#f8d34c'}}>Learn more</a>
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
            disabled={loading}
          >
            {loading ? 'Processing…' : 'Confirm & Pay'}
          </button>
        </div>
      </div>
    </Dialog>
  );
}
