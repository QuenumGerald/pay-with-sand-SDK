# @sandbox/pay-with-sand

## Installation

```bash
npm install @sandbox/pay-with-sand wagmi viem ethers @walletconnect/web3-provider @metamask/providers
```

## Usage

```tsx
import React, { useState } from 'react';
import { SandModal, useSandPaymentStatus } from '@sandbox/pay-with-sand';
import type { PayArgs } from '@sandbox/pay-with-sand';

export function Checkout() {
  const [orderId] = useState(() => ethers.utils.id('order-123'));
  const [isOpen, setOpen] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const status = useSandPaymentStatus(orderId);

  const args: PayArgs = {
    amount: ethers.utils.parseUnits('1', 18).toString(),
    orderId,
    recipient: '0xRecipientAddress',
    // optional: permit fields
    // deadline: Math.floor(Date.now() / 1000) + 3600,
    // v, r, s
  };

  return (
    <>
      <button onClick={() => setOpen(true)}>Payer 1 $SAND</button>
      <SandModal
        isOpen={isOpen}
        onClose={() => setOpen(false)}
        args={args}
        usdValue="~ 6.80 USD"
        onSuccess={(hash) => setTxHash(hash)}
      />
      {txHash && <p>Tx hash: {txHash}</p>}
      <p>Statut: {status}</p>
    </>
  );
}
```

## Configuration

The SDK expects the following environment variables to be defined:

| Variable | Description |
|----------|-------------|
| `INFURA_ID` | Infura project ID used for WalletConnect fallback |
| `REACT_APP_PAYMENT_CONTRACT_ADDRESS` | Address of the payment contract |

Add them to a `.env` file or set them in your environment before running your application.

### Permit vs Approve flow

If the permit signature parameters (`deadline`, `v`, `r`, `s`) are provided in `PayArgs`, the SDK uses the gasless permit flow (EIP-2612). Otherwise, it falls back to the traditional `pay` function which requires prior token approval.

---
