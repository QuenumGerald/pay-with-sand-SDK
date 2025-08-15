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
              {/* Official MetaMask SVG (inlined) */}
              <svg width={28} height={28} viewBox="0 0 142 136.878" aria-hidden="true">
                <path fill="#FF5C16" d="M132.682,132.192l-30.583-9.106l-23.063,13.787l-16.092-0.007l-23.077-13.78l-30.569,9.106L0,100.801
 	l9.299-34.839L0,36.507L9.299,0l47.766,28.538h27.85L132.682,0l9.299,36.507l-9.299,29.455l9.299,34.839L132.682,132.192
 	L132.682,132.192z"/>
                <path fill="#FF5C16" d="M9.305,0l47.767,28.558l-1.899,19.599L9.305,0z M39.875,100.814l21.017,16.01l-21.017,6.261
 	C39.875,123.085,39.875,100.814,39.875,100.814z M59.212,74.345l-4.039-26.174L29.317,65.97l-0.014-0.007v0.013l0.08,18.321
 	l10.485-9.951L59.212,74.345L59.212,74.345z M132.682,0L84.915,28.558l1.893,19.599L132.682,0z M102.113,100.814l-21.018,16.01
 	l21.018,6.261V100.814z M112.678,65.975h0.007H112.678v-0.013l-0.006,0.007L86.815,48.171l-4.039,26.174h19.336l10.492,9.95
 	C112.604,84.295,112.678,65.975,112.678,65.975z"/>
                <path fill="#E34807" d="M39.868,123.085l-30.569,9.106L0,100.814h39.868C39.868,100.814,39.868,123.085,39.868,123.085z
 	 M59.205,74.338l5.839,37.84l-8.093-21.04L29.37,84.295l10.491-9.956h19.344L59.205,74.338z M102.112,123.085l30.57,9.106
 	l9.299-31.378h-39.869C102.112,100.814,102.112,123.085,102.112,123.085z M82.776,74.338l-5.839,37.84l8.092-21.04l27.583-6.843
 	l-10.498-9.956H82.776V74.338z"/>
                <path fill="#FF8D5D" d="M0,100.801l9.299-34.839h19.997l0.073,18.327l27.584,6.843l8.092,21.039l-4.16,4.633l-21.017-16.01H0
 	V100.801z M141.981,100.801l-9.299-34.839h-19.998l-0.073,18.327l-27.582,6.843l-8.093,21.039l4.159,4.633l21.018-16.01h39.868
 	V100.801z M84.915,28.538h-27.85l-1.891,19.599l9.872,64.013h11.891l9.878-64.013L84.915,28.538z"/>
                <path fill="#661800" d="M9.299,0L0,36.507l9.299,29.455h19.997l25.87-17.804L9.299,0z M53.426,81.938h-9.059l-4.932,4.835
 	l17.524,4.344l-3.533-9.186V81.938z M132.682,0l9.299,36.507l-9.299,29.455h-19.998L86.815,48.158L132.682,0z M88.568,81.938h9.072
 	l4.932,4.841l-17.544,4.353l3.54-9.201V81.938z M79.029,124.385l2.067-7.567l-4.16-4.633h-11.9l-4.159,4.633l2.066,7.567"/>
                <path fill="#C0C4CD" d="M79.029,124.384v12.495H62.945v-12.495L79.029,124.384L79.029,124.384z"/>
                <path fill="#E7EBF6" d="M39.875,123.072l23.083,13.8v-12.495l-2.067-7.566C60.891,116.811,39.875,123.072,39.875,123.072z
 	 M102.113,123.072l-23.084,13.8v-12.495l2.067-7.566C81.096,116.811,102.113,123.072,102.113,123.072z"/>
              </svg>
              <span className="mt-1 text-xs">MetaMask</span>
            </button>
            <button
              type="button"
              onClick={() => setWallet('walletconnect')}
              className={`flex flex-col items-center px-3 py-2 rounded-lg border-2 ${wallet === 'walletconnect' ? 'border-[#f8d34c]' : 'border-transparent'} bg-[#22335b] text-white font-medium`}
            >
              {/* Official WalletConnect SVG (inlined) */}
              <svg width={28} height={19} viewBox="0 0 480 332" aria-hidden="true">
                <path d="m126.613 93.9842c62.622-61.3123 164.152-61.3123 226.775 0l7.536 7.3788c3.131 3.066 3.131 8.036 0 11.102l-25.781 25.242c-1.566 1.533-4.104 1.533-5.67 0l-10.371-10.154c-43.687-42.7734-114.517-42.7734-158.204 0l-11.107 10.874c-1.565 1.533-4.103 1.533-5.669 0l-25.781-25.242c-3.132-3.066-3.132-8.036 0-11.102zm280.093 52.2038 22.946 22.465c3.131 3.066 3.131 8.036 0 11.102l-103.463 101.301c-3.131 3.065-8.208 3.065-11.339 0l-73.432-71.896c-.783-.767-2.052-.767-2.835 0l-73.43 71.896c-3.131 3.065-8.208 3.065-11.339 0l-103.4657-101.302c-3.1311-3.066-3.1311-8.036 0-11.102l22.9456-22.466c3.1311-3.065 8.2077-3.065 11.3388 0l73.4333 71.897c.782.767 2.051.767 2.834 0l73.429-71.897c3.131-3.065 8.208-3.065 11.339 0l73.433 71.897c.783.767 2.052.767 2.835 0l73.431-71.895c3.132-3.066 8.208-3.066 11.339 0z" fill="#3396ff"/>
              </svg>
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
            {/* Ensure row can shrink and values can truncate */}
            <div className="flex justify-between items-center gap-2 min-w-0 text-[#8fa2c7] text-xs mb-1">
              <span>Order ID</span>
              <span className="truncate max-w-[70%] text-right">{orderId}</span>
            </div>
            <div className="flex justify-between items-center gap-2 min-w-0 text-[#8fa2c7] text-xs">
              <span>Destination</span>
              <span className="truncate max-w-[70%] text-right text-[#4db6ff]">{destination}</span>
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
