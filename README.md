# @pay-with-sand/sdk

## Installation

```bash
npm install @pay-with-sand/sdk wagmi viem ethers @walletconnect/web3-provider @metamask/providers
```

## Usage

```tsx
import React, { useState } from 'react';
import { ethers } from 'ethers';
import { SandModal, useSandPaymentStatus, useSandUsdValue } from '@pay-with-sand/sdk';
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

  // Compute USD display value for the given SAND amount
  const { usdValue } = useSandUsdValue(args.amount, 18);

  return (
    <>
      <button onClick={() => setOpen(true)}>Payer 1 $SAND</button>
      <SandModal
        isOpen={isOpen}
        onClose={() => setOpen(false)}
        args={args}
        usdValue={usdValue}
        onSuccess={(hash) => setTxHash(hash)}
      />
      {txHash && <p>Tx hash: {txHash}</p>}
      <p>Statut: {status}</p>
    </>
  );
}
```

### Hook: useSandUsdValue

Small helper to compute and format the USD value for a SAND amount.

```ts
const { usdValue, priceUsd, loading, error } = useSandUsdValue(amountWei, 18);
```

- `amountWei`: string | bigint | BigNumber (token amount in smallest units).
- `decimals`: defaults to 18.
- Returns:
  - `usdValue`: formatted string, e.g. "$6.80" or `~` if unavailable
  - `priceUsd`: unit price (number) or null
  - `loading`: boolean
  - `error`: Error | null

## Configuration

The SDK expects the following environment variables to be defined:

| Variable | Description |
|----------|-------------|
| `INFURA_ID` | Infura project ID used for WalletConnect fallback |
| `REACT_APP_PAYMENT_CONTRACT_ADDRESS` | Address of the payment contract |

Add them to a `.env` file or set them in your environment before running your application.

### Permit vs Approve flow

If the permit signature parameters (`deadline`, `v`, `r`, `s`) are provided in `PayArgs`, the SDK uses the gasless permit flow (EIP-2612). Otherwise, it falls back to the traditional `pay` function which requires prior token approval.

# Optional: override price API (must return { "the-sandbox": { "usd": number } })
# PRICE_API_URL=https://your-proxy.example.com/the-sandbox-price
