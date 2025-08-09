import React from 'react';
import { Dialog } from '@headlessui/react';
import type { PayArgs } from '../types';
import { payWithSand } from '../payWithSand';
import { ethers } from 'ethers';

interface SandModalProps {
  isOpen: boolean;
  onClose: () => void;
  args: PayArgs;
  usdValue: string;
  onSuccess?: (txHash: string) => void;
}

export function SandModal({ isOpen, onClose, args, usdValue, onSuccess }: SandModalProps) {
  const [loading, setLoading] = React.useState(false);
  const [wallet, setWallet] = React.useState<'metamask' | 'walletconnect'>('metamask');
  const [errMsg, setErrMsg] = React.useState<string | null>(null);

  if (!args.orderId || !args.recipient || !args.amount || !usdValue) {
    return <div className="p-4 text-red-500">Missing required payment information</div>;
  }

  const handleConfirm = async () => {
    setLoading(true);
    setErrMsg(null);
    try {
      const hash = await payWithSand({ ...args, wallet });
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
    <Dialog open={isOpen} onClose={onClose} className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black bg-opacity-70" aria-hidden="true" />
      <div className="relative bg-[#14213d] rounded-2xl p-6 w-full max-w-md shadow-2xl border border-[#22335b]">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <span className="inline-flex items-center justify-center w-8 h-8 bg-[#22335b] rounded-full">
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#fff" /></svg>
            </span>
            <span className="text-white text-lg font-bold">Pay with $SAND</span>
          </div>
          <button onClick={onClose} className="text-[#8fa2c7] hover:text-white text-xl font-bold">×</button>
        </div>

        {/* Amount */}
        <div className="bg-[#1a2540] rounded-lg p-4 mb-2">
          <div className="text-white text-2xl font-semibold">{amount} $SAND</div>
          <div className="text-[#8fa2c7] text-sm mt-1">{usdValue}</div>
        </div>

        {/* Network */}
        <div className="flex items-center bg-[#1a2540] rounded-lg p-3 mb-4">
          <span className="inline-flex items-center justify-center w-8 h-8 bg-[#22335b] rounded-full mr-3">
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#7b3fe4" /></svg>
          </span>
          <div>
            <div className="text-white font-medium">Polygon</div>
            <div className="text-[#8fa2c7] text-xs">gas ≈ 0.03 USD</div>
          </div>
        </div>

        {/* Wallet selection */}
        <div className="mb-4">
          <div className="text-[#8fa2c7] text-sm mb-2">Select Wallet</div>
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={() => setWallet('metamask')}
              className={`flex flex-col items-center px-3 py-2 rounded-lg border-2 ${wallet === 'metamask' ? 'border-[#f8d34c]' : 'border-transparent'} bg-[#22335b] text-white font-medium focus:outline-none`}
            >
              <svg width="28" height="28" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="12" fill="#f8d34c" /></svg>
              <span className="mt-1 text-xs">MetaMask</span>
            </button>
            <button
              type="button"
              onClick={() => setWallet('walletconnect')}
              className={`flex flex-col items-center px-3 py-2 rounded-lg border-2 ${wallet === 'walletconnect' ? 'border-[#f8d34c]' : 'border-transparent'} bg-[#22335b] text-white font-medium`}
            >
              <svg width="28" height="28" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="12" fill="#2d2d2d" /></svg>
              <span className="mt-1 text-xs">WalletConnect</span>
            </button>
          </div>
          {errMsg && (
            <div className="mt-2 text-xs text-red-400">
              {errMsg}
            </div>
          )}
        </div>

        {/* Order Recap */}
        <div className="mb-4">
          <div className="text-[#8fa2c7] text-sm mb-1">Order Recap</div>
          <div className="bg-[#1a2540] rounded-lg p-3">
            <div className="flex justify-between text-[#8fa2c7] text-xs mb-1">
              <span>Order ID</span>
              <span>{orderId}</span>
            </div>
            <div className="flex justify-between text-[#8fa2c7] text-xs">
              <span>Destination</span>
              <span className="text-[#4db6ff]">{destination}</span>
            </div>
          </div>
        </div>

        {/* Info box */}
        <div className="bg-[#f8d34c]/10 border border-[#f8d34c] rounded-lg px-3 py-2 text-[#f8d34c] text-xs mb-5">
          You will sign ONE transaction using EIP-2612 permit. No separate 'approve' fee. <a href="#" className="underline">Learn more</a>
        </div>

        {/* Action buttons */}
        <div className="flex justify-between">
          <button
            className="w-1/2 mr-2 py-2 rounded-lg border border-[#8fa2c7] text-[#8fa2c7] font-semibold hover:bg-[#22335b] transition"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            className="w-1/2 py-2 rounded-lg bg-[#2563eb] text-white font-semibold hover:bg-[#1d4ed8] transition disabled:opacity-60"
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
