import React from 'react';
import { SandModal, useSandUsdValue } from '@pay-with-sand/sdk';

export function App() {
  const [open, setOpen] = React.useState(false);

  // Example args
  const args = {
    orderId: 'ORDER-123',
    recipient: process.env.REACT_APP_PAYMENT_CONTRACT_ADDRESS || '0x0000000000000000000000000000000000000001',
    // 1 SAND (18 decimals)
    amount: '1000000000000000000',
  } as const;

  const { usdValue } = useSandUsdValue(args.amount, 18);

  return (
    <div style={{ padding: 24, fontFamily: 'sans-serif' }}>
      <h1>Pay With Sand - Example</h1>
      <p>Amount: 1 SAND</p>
      <p>Approx in USD: {usdValue || 'Loading...'}</p>
      <button onClick={() => setOpen(true)} style={{ padding: '8px 12px' }}>
        Pay with SAND
      </button>

      <SandModal
        isOpen={open}
        onClose={() => setOpen(false)}
        args={args as any}
        usdValue={usdValue || ''}
        onSuccess={(txHash) => {
          // eslint-disable-next-line no-alert
          alert(`Payment sent! Tx: ${txHash}`);
        }}
      />
    </div>
  );
}
