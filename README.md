# @pay-with-sand/sdk

React SDK to accept payments in $SAND with a drop-in modal, hooks, and utilities.

- Latest stable: 0.4.0 (npm tag: latest)
- Package: `@pay-with-sand/sdk`

## Features

- 🎨 **Modern UI** - Clean, intuitive interface for optimal user experience
- 📱 **Fully Responsive** - Works seamlessly on all devices, from mobile to desktop
- 🌓 **Light/Dark Themes** - Built-in system theme preference support
- ⚡ **Optimized Performance** - Fast loading and smooth animations
- 🔌 **Easy Integration** - Ready-to-use components with advanced customization
- 🔒 **Secure** - Safe transaction and wallet connection handling
- 💳 **Wallet Support** - MetaMask and other Ethereum-compatible wallets
- 📊 **Payment Tracking** - Real-time transaction status hooks
- 🛠 **Simple API** - `payWithSand()` for quick and easy integration

## 🖼️ Preview

<div align="center">
  <img src="screenshots/modal-light.png" alt="Payment Modal - Light Theme" width="45%" />
  <img src="screenshots/modal-dark.png" alt="Payment Modal - Dark Theme" width="45%" />
  
  *Modern interface with light/dark theme support*
</div>

## Supported Network

- Network: **Polygon (PoS)** 
- Payment Contract (Polygon): `0xB15626D438168b4906c28716F0abEF3683287924`
- Default SAND Token (Polygon): `0xBbba073C31bF03b8ACf7c28EF0738DeCF3695683`

## Installation

Install the SDK with npm:

```bash
npm i @pay-with-sand/sdk
```

**Prerequisites:**
- React 17 or 18
- An `ethers` v5 `Signer` object (typically provided by your wallet connection solution)

## Basic Usage

### 1. Wrap your app with `SandProvider`

```tsx
import { SandProvider } from '@pay-with-sand/sdk';

function App() {
  return (
    <SandProvider>
      <YourApp />
    </SandProvider>
  );
}
```

### 2. Use the `SandModal` component

```tsx
import { SandModal } from '@pay-with-sand/sdk';

function PaymentButton() {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <>
      <button onClick={() => setIsOpen(true)}>
        Pay with SAND
      </button>
      <SandModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onSuccess={(txHash) => console.log('Payment successful:', txHash)}
        onError={(error) => console.error('Payment error:', error)}
        amount="10" // Amount in SAND
        receiver="0x123..." // Recipient address
      />
    </>
  );
}
```

## Hooks

### `useSandPaymentStatus`

```tsx
import { useSandPaymentStatus } from '@pay-with-sand/sdk';

function PaymentStatus({ txHash }) {
  const { status, error } = useSandPaymentStatus(txHash);
  
  return (
    <div>
      Payment status: {status}
      {error && <div>Error: {error.message}</div>}
    </div>
  );
}
```

### `useSandUsdValue`

```tsx
import { useSandUsdValue } from '@pay-with-sand/sdk';

function SandPrice() {
  const { price, loading, error } = useSandUsdValue();
  
  if (loading) return <div>Loading SAND price...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return <div>1 SAND = ${price}</div>;
}
```

## API Reference

### Types

```ts
export type PayArgs = {
  amount: string;              // Token amount in smallest unit (wei)
  orderId: string;             // Unique order identifier (bytes32-encodable)
  recipient: string;           // Destination address
  tokenAddress?: string;       // Defaults to SAND on Polygon
  permitArgs?: {
    deadline: number;          // Block timestamp when permit expires
    v: number;                // ECDSA recovery id (27/28 or 0/1)
    r: string;                // ECDSA signature r
    s: string;                // ECDSA signature s
  };
};

interface SandProviderProps {
  children: React.ReactNode;
  theme?: 'light' | 'dark' | 'system';
  sandTokenAddress?: string;   // Defaults to SAND on Polygon
  paymentContractAddress?: string; // Defaults to payment contract on Polygon
  // Default for chain 137 (Polygon): `0xBbba073C31bF03b8ACf7c28EF0738DeCF3695683`
}
```

## Configuration

### Environment Variables

- **WalletConnect / RPC (optional)**:
  - `VITE_INFURA_ID` (falls back to `INFURA_ID`)

### Price Endpoint Customization

You can override the price endpoint. The endpoint should return a CoinGecko-compatible shape or a plain number.

Example configuration:

```bash
# CoinGecko-compatible JSON shape
PRICE_API_URL=https://your-api.example.com/sand-price
# Or point to an endpoint that returns a plain number
# PRICE_API_JSON_PATH=data.token.usd
```

## Wallets and Networks

- Connect wallets using your preferred solution (MetaMask, etc.). Get an `ethers.Signer` v5 from the active connection and pass it to the SDK.
- The SDK checks the `chainId` at runtime and throws if it differs from the configured chain (default 137/Polygon via environment variables or `args.chainId`).
- Default network: Polygon (137). Other chains are supported by providing `PAYMENT_CONTRACT_ADDRESS_<chainId>` and `SAND_TOKEN_ADDRESS_<chainId>`.

### Modal Wallet Selector

`SandModal` includes a built-in wallet selector with a MetaMask card. The confirm button is only enabled when:

- A wallet is selected and connected
- Required arguments are valid (recipient, amount, order ID)

## Permit vs Approve

> Important
>
> The SAND token on Polygon currently does not implement the EIP-2612 permit standard. Therefore, the SDK always uses the classic `approve` → `pay` flow. The permit fields in `PayArgs` are kept for future compatibility and are ignored for SAND on Polygon.

The SDK will:

1. Check SAND balance and throw a clear error if insufficient
2. Check allowance and, if needed, automatically send `approve(paymentContract, amount)` before calling `pay`

### What are v, r, s?

ECDSA signatures on secp256k1 (used by Ethereum) consist of three parts:

- **r**: First 32-byte component (hex string). Related to an x-coordinate derived during signing.
- **s**: Second 32-byte component (hex string). On Ethereum, it must be in "low-s" form.
- **v**: Recovery id (number) enabling public key recovery from `(r, s)` and the message. Common values are `27` or `28`. Some libraries return `0` or `1`; you can convert by adding `27`.

In EIP-2612 (permit), you sign typed data (EIP-712). Here's how to obtain and split a signature using ethers:

```ts
import { ethers } from 'ethers';

// Example: Sign EIP-712 typed data and extract v, r, s
async function signPermitAndSplit(
  wallet: ethers.Wallet,
  domain: any,
  types: any,
  value: any
) {
  // 65-byte signature: r(32) + s(32) + v(1)
  const signature = await wallet._signTypedData(domain, types, value);
  
  // Split into v, r, s
  const sig = ethers.utils.splitSignature(signature);
  
  // Convert v if needed (some libraries return 0/1 instead of 27/28)
  let { v, r, s } = sig;
  if (v === 0 || v === 1) {
    v += 27;
  }
  
  return { v, r, s };
}
```

Practical notes:

- **Types**: `r` and `s` are hex strings (32 bytes). `v` is a number (27/28 or 0/1 depending on the source; if 0/1, add 27).
- **Validation**: The contract returns an error if the signature is invalid (incorrect domain/chainId, expired `deadline`, non-matching owner, etc.).
- **Security**: Always sign the correct EIP-712 domain (name, version, chainId, verifying contract) to prevent replay attacks on other networks/contracts.

## Error Handling

- Most functions return standard error instances with descriptive messages.
- Common issues:
  - Wrong network: The expected `chainId` differs from the configured one (default 137/Polygon via environment variables or `args.chainId`).
  - Missing wallet address: `PAYMENT_CONTRACT_ADDRESS_<chainId>` not provided (a default is included for 137).
  - Missing SAND token address (a default is included for 137).

### Gas Estimation Reverts

- Ensure the payer's wallet is on Polygon (137).
- Ensure `recipient` is a valid non-zero address different from the payer (some contracts forbid self-payments).
- Ensure `orderId` matches the contract's business rules (e.g., registered, not consumed).
- If not using a permit, you'll be prompted to approve the first time; accept the approval transaction.
- If using a custom SAND token address or a different chain, verify the decimals and addresses.

## TypeScript

- Types are included with the package (`dist/index.d.ts`).
- Typical `tsconfig` settings: `strict`, `esModuleInterop`, `jsx: react-jsx`.

## Local Test Web App

Use the `test-web/` directory for a minimal test environment with Vite and React using the SDK. To run:

```bash
cd test-web
npm i
npm run dev
```

Example `.env` file for Polygon (place in `test-web/.env`):

```env
# Chain selection (default: 137)
VITE_PAY_WITH_SAND_CHAIN_ID=137
VITE_CHAIN_ID=137

# Contracts per chain (defaults exist for 137; override if needed)
VITE_PAYMENT_CONTRACT_ADDRESS_137=0xB15626D438168b4906c28716F0abEF3683287924
VITE_SAND_TOKEN_ADDRESS_137=0xBbba073C31bF03b8ACf7c28EF0738DeCF3695683

# WalletConnect / RPC (optional)
VITE_INFURA_ID=<your_infura_project_id>
```

## Versioning / NPM Tags

- Stable releases are published under the `latest` tag (e.g., `0.4.0`).
- To install the latest stable version:

```bash
npm i @pay-with-sand/sdk
```

## License

MIT
