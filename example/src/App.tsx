import React from 'react';
import { SandModal, useSandUsdValue } from '@pay-with-sand/sdk';
import { ethers, utils as ethersUtils } from 'ethers';

export function App() {
  const [open, setOpen] = React.useState(false);
  const [args, setArgs] = React.useState<any | null>(null);
  // Plus besoin de gestion signer ni approvingRef

  // Generate a fresh unique order id per attempt (avoid reusing the same order)
  const makeOrderId = () => ethersUtils.formatBytes32String(`ORDER-${Date.now()}`);
  const AMOUNT_WEI = '1000000000000000'; // example amount (1e15 wei)
  const MERCHANT = process.env.MERCHANT_ADDRESS || '0x0000000000000000000000000000000000000001';

  // Resolve per-chain envs first, then generic, then safe defaults
  const CHAIN_ID = Number(process.env.PAY_WITH_SAND_CHAIN_ID || '137');
  const pickChainEnv = (base: string) => {
  };
  const { usdValue } = useSandUsdValue(AMOUNT_WEI, 18);

  return (
    <div className="app-container">
      <h1>Pay With Sand - Example</h1>
      <p>Amount: 1 SAND</p>
      <p>Approx in USD: {usdValue || 'Loading...'}</p>
      <button
        onClick={() => setOpen(true)}
        className="pay-btn"
        title="Payer avec SAND"
      >
        <span className="i-tabler:currency-ethereum" aria-hidden="true"></span>
        Pay with SAND
      </button>
      <SandModal
        isOpen={open}
        onClose={() => setOpen(false)}
        args={{ orderId: makeOrderId(), amount: AMOUNT_WEI, recipient: MERCHANT }}
        usdValue={usdValue || ''}
        onSuccess={(txHash) => {
          // eslint-disable-next-line no-alert
          alert(`Payment sent! Tx: ${txHash}`);
        }}
      />
    </div>
  );
}
