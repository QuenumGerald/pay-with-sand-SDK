// Shim for @walletconnect/ethereum-provider to prevent Vite optimizer errors in this example app.
// RainbowKit/Wagmi provide wallet connectivity; this provider is unnecessary here.
export default class WalletConnectEthereumProviderShim {
  static async init(..._args: any[]) {
    throw new Error(
      "@walletconnect/ethereum-provider is not used in this example. Use RainbowKit/Wagmi connectors."
    );
  }
  constructor(..._args: any[]) {
    throw new Error(
      "@walletconnect/ethereum-provider is not used in this example. Use RainbowKit/Wagmi connectors."
    );
  }
}
