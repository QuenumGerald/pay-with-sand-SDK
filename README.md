# @pay-with-sand/sdk

React SDK to accept payments in $SAND with a drop-in modal, hooks, and utilities.

- Latest stable: 0.2.0 (npm tag: latest)
- Package: `@pay-with-sand/sdk`

## Features

- Drop-in modal UI: `SandModal`
- Simple payment API via `payWithSand()` under the hood
- Hooks for UX and pricing: `useSandPaymentStatus()`, `useSandUsdValue()`
- EIP-2612 permit flow (single signed tx) with automatic fallback to approve+pay
- Works with MetaMask and WalletConnect v2

## Network support

- Supported network: **Polygon (PoS)** 
- Payment contract (Polygon): `0xB15626D438168b4906c28716F0abEF3683287924`

## Installation

Install the SDK:

```bash
npm i @pay-with-sand/sdk
```

Notes:

- React 17 or 18 is required (peer).
- Ethers is bundled by the SDK; you do not need to install it separately.
- If you already use wagmi/viem, they remain compatible but are not required.

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
  // Optional: prefer a specific chain id (defaults to 137 / Polygon)
  chainId?: number;
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

Set the following environment variables in `.env` or your process environment. The SDK now supports multi-chain with WalletConnect v2.

| Variable | Description |
|----------|-------------|
| `WALLETCONNECT_PROJECT_ID` | WalletConnect Cloud Project ID (required for WalletConnect) |
| `PAY_WITH_SAND_CHAIN_ID` | Preferred chain id (default: `137` for Polygon) |
| `PAY_WITH_SAND_RPC_<chainId>` | RPC URL for the preferred chain (e.g., `PAY_WITH_SAND_RPC_137=https://polygon-rpc.com/`) |
| `PAYMENT_CONTRACT_ADDRESS_<chainId>` | Payment contract address for that chain (e.g., `PAYMENT_CONTRACT_ADDRESS_137=0xB15626...`) |
| `REACT_APP_PAYMENT_CONTRACT_ADDRESS` | Legacy single-network fallback (discouraged) |

Optional price endpoint override. The endpoint should return a CoinGecko-like shape:

```json
{ "the-sandbox": { "usd": 0.42 } }
```

Environment override example:

```bash
PRICE_API_URL=https://your-proxy.example.com/the-sandbox-price
```

## Wallets and Networks

- MetaMask is used when present and selected. The SDK verifies `chainId` and will error with a clear message if you’re on the wrong network.
- WalletConnect v2 is used when selected. Requires `WALLETCONNECT_PROJECT_ID`. The QR modal opens and the session is initialized on the configured `PAY_WITH_SAND_CHAIN_ID`.
- Default network: Polygon (137). Other chains are supported by providing the appropriate env variables.

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
  - Missing env var: `WALLETCONNECT_PROJECT_ID` (when using WalletConnect)
  - Wrong network: expected `PAY_WITH_SAND_CHAIN_ID`, got a different `chainId`
  - Missing per-chain address: `PAYMENT_CONTRACT_ADDRESS_<chainId>` not provided
  - Legacy setups: using `REACT_APP_PAYMENT_CONTRACT_ADDRESS` without matching the active chain

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

Example `.env` for Polygon (example app variables typically prefixed with `VITE_`):

```env
# WalletConnect v2
VITE_WALLETCONNECT_PROJECT_ID=your_wc_project_id

# Chain selection (defaults to 137)
VITE_PAY_WITH_SAND_CHAIN_ID=137
VITE_PAY_WITH_SAND_RPC_137=https://polygon-rpc.com/

# Contracts per chain
VITE_PAYMENT_CONTRACT_ADDRESS_137=0xB15626D438168b4906c28716F0abEF3683287924
VITE_SAND_TOKEN_ADDRESS_137=<SAND_TOKEN_ADDRESS_ON_POLYGON>
```

## Versioning / NPM Tags

- Stable releases are published under the `latest` tag (e.g., `0.2.0`).
- Install stable:

```bash
npm i @pay-with-sand/sdk
```

## License

MIT
