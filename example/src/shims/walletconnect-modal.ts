// Shim for @walletconnect/modal to prevent Vite optimizer errors in this example app.
// RainbowKit is used for wallet UX; this modal is not needed.
export class WalletConnectModalShim {
  constructor(..._args: any[]) {
    throw new Error(
      "@walletconnect/modal is not used in this example. Use RainbowKit for wallet UI."
    );
  }
  openModal() { /* no-op */ }
  closeModal() { /* no-op */ }
}
export default WalletConnectModalShim;
