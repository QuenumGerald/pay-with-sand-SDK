// Shim for @walletconnect/web3-provider to avoid bundling WC v1 in the example app.
// If something tries to instantiate it at runtime, we throw with a clear message.
export default class WalletConnectWeb3ProviderShim {
  constructor(..._args: any[]) {
    throw new Error(
      "@walletconnect/web3-provider is not used in this example. Use RainbowKit/Wagmi for wallets, or provide a real WC provider."
    );
  }
}
