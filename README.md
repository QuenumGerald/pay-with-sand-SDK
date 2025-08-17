# @pay-with-sand/sdk

React SDK to accept payments in $SAND with a drop-in modal, hooks, and utilities.

- Latest stable: 0.1.1 (npm tag: latest)
- Package: `@pay-with-sand/sdk`

## Features

- Drop-in modal UI: `SandModal`
- Simple payment API via `payWithSand()` under the hood
- Hooks for UX and pricing: `useSandPaymentStatus()`, `useSandUsdValue()`
- EIP-2612 permit flow (single signed tx) with automatic fallback to approve+pay
- Works with MetaMask and WalletConnect (WC v1 provider as peer)

## Network support

- Supported network: **Polygon (PoS)** 
- Payment contract (Polygon): `0xB15626D438168b4906c28716F0abEF3683287924`

## Installation

Install the SDK and required peers:

```bash
npm i @pay-with-sand/sdk wagmi viem @walletconnect/web3-provider @metamask/providers
```

Notes:

- React 17 or 18 is required (peer).
- Ethers is bundled by the SDK; you do not need to install it separately.

## Quick Start

```tsx
import React, { useState } from 'react';
import { ethers } from 'ethers';
import { SandModal, useSandPaymentStatus, useSandUsdValue } from '@pay-with-sand/sdk';
import type { PayArgs } from '@pay-with-sand/sdk';

export function Checkout() {
  const [isOpen, setOpen] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [orderId] = useState(() => ethers.utils.id('order-123'));
  const status = useSandPaymentStatus(orderId);

  const args: PayArgs = {
    amount: ethers.utils.parseUnits('1', 18).toString(),
    orderId,
    recipient: '0xRecipientAddress'
    // Optional (EIP-2612): deadline, v, r, s
  };

  const { usdValue } = useSandUsdValue(args.amount, 18);

  return (
    <>
      <button onClick={() => setOpen(true)}>Pay 1 $SAND</button>
      <SandModal
        isOpen={isOpen}
        onClose={() => setOpen(false)}
        args={args}
        usdValue={usdValue}
        onSuccess={(hash) => setTxHash(hash)}
      />
      {txHash && <p>Tx hash: {txHash}</p>}
      <p>Status: {status}</p>
    </>
  );
}
```

## API Reference

### Types

```ts
export type PayArgs = {
  amount: string;              // token amount in smallest units (wei)
  orderId: string;             // unique order identifier (bytes32-encodable)
  recipient: string;           // destination address
  // Optional EIP-2612 permit fields
  deadline?: number;           // unix seconds
  v?: number;
  r?: string;
  s?: string;
};
```

### Components

- `SandModal(props)`
  - `isOpen: boolean`
  - `onClose: () => void`
  - `args: PayArgs`
  - `usdValue: string` — formatted (e.g. `$6.80` or `~`)
  - `onSuccess?: (txHash: string) => void`

### Hooks

- `useSandUsdValue(amountWei: string | bigint | BigNumber, decimals = 18)`
  - Returns `{ usdValue: string, priceUsd: number | null, loading: boolean, error: Error | null }`

- `useSandPaymentStatus(orderId: string)`
  - Returns one of: `idle | pending | confirmed | failed` (string)

## Configuration

Set the following environment variables in `.env` or your process environment:

| Variable | Description |
|----------|-------------|
| `INFURA_ID` | Infura Project ID used by WalletConnect fallback |
| `REACT_APP_PAYMENT_CONTRACT_ADDRESS` | Payment contract address |

Optional price endpoint override. The endpoint should return a CoinGecko-like shape:

```json
{ "the-sandbox": { "usd": 0.42 } }
```

Environment override example:

```bash
PRICE_API_URL=https://your-proxy.example.com/the-sandbox-price
```

## Wallets and Networks

- MetaMask is used when present and selected.
- WalletConnect is used when selected (requires `INFURA_ID`).
- Example network in UI: Polygon (gas information is indicative).

## Permit vs Approve

If EIP‑2612 signature fields (`deadline`, `v`, `r`, `s`) are provided in `PayArgs`, the SDK uses a gasless permit flow (single signed transaction, no separate approval fee). Otherwise, it falls back to the classic `approve` + `pay` flow.

### What are v, r, s?

ECDSA signatures on secp256k1 (used by Ethereum) are composed of three parts:

- **r**: first 32-byte component (hex string). Related to an x‑coordinate derived during signing.
- **s**: second 32-byte component (hex string). On Ethereum it must be in “low‑s” form.
- **v**: recovery id (number) enabling public key recovery from `(r, s)` and the message. Common values are `27` or `28`. Some libraries return `0/1`; you can convert by adding `27`.

In EIP‑2612 (permit), you sign typed data (EIP‑712). Here is how to obtain and split a signature using ethers:

```ts
import { ethers } from 'ethers';

// Example: sign EIP-712 permit typed data and extract v, r, s
async function signPermitAndSplit(
  wallet: ethers.Wallet,
  domain: any,
  types: any,
  value: any
) {
  // 65-byte signature: r(32) + s(32) + v(1)
  const signature = await wallet._signTypedData(domain, types, value);
  const { v, r, s } = ethers.utils.splitSignature(signature);
  return { v, r, s };
}
```

Practical notes:

- **Types**: `r` and `s` are `0x` hex strings (32 bytes). `v` is a number (27/28 or 0/1 depending on the source; if 0/1, add 27).
- **Validation**: The contract will revert if the signature is invalid (wrong domain/chainId, expired `deadline`, mismatched owner, etc.).
- **Security**: Always sign the correct EIP‑712 domain (name, version, chainId, verifyingContract) to avoid replay on other networks/contracts.

## Error Handling

- Most functions throw standard `Error` instances with descriptive messages.
- Common causes:
  - Missing env var: `REACT_APP_PAYMENT_CONTRACT_ADDRESS`
  - WalletConnect path without `INFURA_ID`
  - No MetaMask when MetaMask is explicitly selected

## TypeScript

- Types are shipped with the package (`dist/index.d.ts`).
- Typical `tsconfig` settings: `strict`, `esModuleInterop`, `jsx: react-jsx`.

## Example App

See `example/` for a minimal Vite + React setup using the SDK. To run:

```bash
cd example
npm i
npm run dev
```

## Versioning / NPM Tags

- Stable releases are published under the `latest` tag (e.g., `0.1.1`).
- Install stable:

```bash
npm i @pay-with-sand/sdk
```

## License

MIT
