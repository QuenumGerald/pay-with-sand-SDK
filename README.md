# @pay-with-sand/sdk

React SDK to accept payments in $SAND with a drop-in modal, hooks, and utilities.

- Latest stable: 0.3.1 (npm tag: latest)
- Package: `@pay-with-sand/sdk`

## Features

 - Drop-in modal UI: `SandModal` with built-in wallet selector (MetaMask)
 - Simple payment API via `payWithSand()` under the hood
 - Hooks for UX and pricing: `useSandPaymentStatus()`, `useSandUsdValue()`
 - Note: SAND on Polygon does not support EIP-2612 permit today; SDK performs approve → pay automatically
 - Automatic ERC-20 allowance handling when not using permit (sends `approve` if needed)
 - Styled with The Sandbox blue palette (button + title gradient)
 - Works with wallets connected via RainbowKit/Wagmi (MetaMask, WalletConnect v2, etc.)

## Network support

- Supported network: **Polygon (PoS)** 
- Payment contract (Polygon): `0xB15626D438168b4906c28716F0abEF3683287924`
 - Default SAND token (Polygon): `0xBbba073C31bF03b8ACf7c28EF0738DeCF3695683`

## Installation

Install the SDK:

```bash
npm i @pay-with-sand/sdk
```

Notes:

- React 17 or 18 is required (peer).
- The SDK expects an external `ethers` v5 `Signer` (typically provided via RainbowKit/Wagmi). If your app already uses RainbowKit/Wagmi, you can pass the connected `Signer` directly.

## API Reference

### Types

```ts
export type PayArgs = {
  amount: string;              // token amount in smallest units (wei)
  orderId: string;             // unique order identifier (bytes32-encodable)
  recipient: string;           // destination address
  // Optional EIP-2612 permit fields (not supported by SAND on Polygon; reserved for future compatibility)
  deadline?: number;           // unix seconds
  v?: number;
  r?: string;
  s?: string;
  // Optional: prefer a specific chain id (defaults to 137 / Polygon)
  chainId?: number;
  // Optional: pass a connected ethers v5 Signer (recommended)
  signer?: import('ethers').Signer;
};
```

### Components

- `SandModal(props)`
  - `isOpen: boolean`
  - `onClose: () => void`
  - `args: PayArgs`
  - `usdValue: string` — formatted (e.g. `$6.80` or `~`)
  - `onSuccess?: (txHash: string) => void`
  - `signer?: Signer` — connected wallet signer (you can also omit here and call `payWithSand({ ...args, signer })` directly)

### Hooks

- `useSandUsdValue(amountWei: string | bigint | BigNumber, decimals = 18)`
  - Returns `{ usdValue: string, priceUsd: number | null, loading: boolean, error: Error | null }`

- `useSandPaymentStatus(orderId: string)`
  - Returns one of: `idle | pending | confirmed | failed` (string)

## Environment configuration

Set the following environment variables in `.env` or your process environment (Vite/CRA supported). The SDK includes safe defaults for Polygon mainnet.

Supported keys (first present wins):

- **Chain ID** (defaults to 137 if omitted):
  - `VITE_PAY_WITH_SAND_CHAIN_ID`, `VITE_CHAIN_ID`

- **Payment contract address** (per-chain preferred):
  - Per-chain: `PAYMENT_CONTRACT_ADDRESS_<chainId>`, `VITE_PAYMENT_CONTRACT_ADDRESS_<chainId>`
  - Global fallback: `REACT_APP_PAYMENT_CONTRACT_ADDRESS`, `VITE_PAYMENT_CONTRACT_ADDRESS`
  - Built-in default for 137: `0xB15626D438168b4906c28716F0abEF3683287924`

- **SAND token address** (per-chain preferred):
  - Per-chain: `SAND_TOKEN_ADDRESS_<chainId>`, `VITE_SAND_TOKEN_ADDRESS_<chainId>`
  - Global fallback: `SAND_TOKEN_ADDRESS`, `VITE_SAND_TOKEN_ADDRESS`
  - Built-in default for 137: `0xBbba073C31bF03b8ACf7c28EF0738DeCF3695683`

- **WalletConnect / RPC (optional)**:
  - `VITE_INFURA_ID` (falls back to `INFURA_ID`)

Optional price endpoint override. The endpoint should return a CoinGecko-like shape or a plain number.

Example overrides:

```bash
# CoinGecko-compatible JSON shape
PRICE_API_URL=https://your-proxy.example.com/the-sandbox-price
# Or point to an endpoint that returns a plain number
# PRICE_API_JSON_PATH=data.token.usd
```

## Wallets and Networks

- Connect wallets using RainbowKit/Wagmi (MetaMask, etc.). Obtain an `ethers.Signer` v5 from the active connection and pass it to the SDK.
- The SDK verifies `chainId` at runtime and throws if it differs from your configured chain (default 137/Polygon via env or `args.chainId`).
- Default network: Polygon (137). Other chains are supported by providing `PAYMENT_CONTRACT_ADDRESS_<chainId>` and `SAND_TOKEN_ADDRESS_<chainId>`.

### Modal wallet selector

`SandModal` includes an internal wallet selector with a MetaMask card. The Confirm button is enabled only when:

- A wallet is selected and connected
- Required args are valid (recipient, amount, orderId)

## Permit vs Approve

> Important
>
> The SAND token on Polygon currently does not implement EIP‑2612 permit. As a result, the SDK always uses the classic `approve` → `pay` flow. The permit fields in `PayArgs` are kept for forward compatibility and are ignored for SAND on Polygon.

The SDK will:

- Check SAND balance and throw a clear error if insufficient
- Check allowance and, if needed, automatically send `approve(paymentContract, amount)` before calling `pay`

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
  - Wrong network: expected configured `chainId`, got a different one
  - Missing per-chain address: `PAYMENT_CONTRACT_ADDRESS_<chainId>` not provided (a default is included for 137)
  - SAND token address missing (a default is included for 137)

### Troubleshooting gas estimation reverts

- Ensure the payer wallet is on Polygon (137)
- Ensure `recipient` is a valid non-zero address and not equal to the payer (some contracts forbid self-payments)
- Ensure `orderId` matches the contract’s business rules (e.g., registered, not consumed)
- If not using permit, you’ll be prompted to approve first time; accept the approval tx
- If using a custom SAND token address or different chain, verify decimals and addresses

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

Example `.env` for Polygon (Vite variables):

```env
# Chain selection (defaults to 137)
VITE_PAY_WITH_SAND_CHAIN_ID=137
VITE_CHAIN_ID=137

# Contracts per chain (defaults exist for 137; override if needed)
VITE_PAYMENT_CONTRACT_ADDRESS_137=0xB15626D438168b4906c28716F0abEF3683287924
VITE_SAND_TOKEN_ADDRESS_137=0xBbba073C31bF03b8ACf7c28EF0738DeCF3695683

# Optional WalletConnect RPC
VITE_INFURA_ID=<your_infura_project_id>
```

## Versioning / NPM Tags

- Stable releases are published under the `latest` tag (e.g., `0.2.0`).
- Install stable:

```bash
npm i @pay-with-sand/sdk
```

## License

MIT
