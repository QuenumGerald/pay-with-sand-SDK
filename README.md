# @pay-with-sand/sdk

## Installation

```bash
npm install @pay-with-sand/sdk wagmi viem ethers @walletconnect/web3-provider @metamask/providers
```

## Usage

```tsx
import React, { useState } from 'react';
import { ethers } from 'ethers';
import { SandModal, useSandPaymentStatus } from '@pay-with-sand/sdk';
import type { PayArgs } from '@pay-with-sand/sdk';

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
        onSuccess={(hash) => setTxHash(hash)}
      />
      {txHash && <p>Tx hash: {txHash}</p>}
      <p>Statut: {status}</p>
    </>
  );
}
```

---

## Environment Variables

Configure the following environment variables depending on your app environment:

- `REACT_APP_PAYMENT_CONTRACT_ADDRESS` (required): address of the on-chain payment contract used by `useSandPaymentStatus()`.
- `INFURA_ID` (optional but recommended): Infura project ID used to initialize WalletConnect fallback in `useSandPaymentStatus()` when `window.ethereum` is not available.
- `PRICE_API_URL` (optional): override for the price endpoint used by `SandModal` to compute the USD equivalent. Defaults to CoinGecko simple price API for The Sandbox: `https://api.coingecko.com/api/v3/simple/price?ids=the-sandbox&vs_currencies=usd`.

Example `.env` (do not commit real secrets):

```env
# Payment status hook
REACT_APP_PAYMENT_CONTRACT_ADDRESS=0xYourPaymentContract
INFURA_ID=your_infura_project_id

# Optional: override price API (must return { "the-sandbox": { "usd": number } })
# PRICE_API_URL=https://your-proxy.example.com/the-sandbox-price
```
