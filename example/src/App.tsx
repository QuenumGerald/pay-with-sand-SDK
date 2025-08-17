import React from 'react';
import { SandModal, useSandUsdValue } from '@pay-with-sand/sdk';
import { ethers, utils as ethersUtils } from 'ethers';
import { EthereumProvider } from '@walletconnect/ethereum-provider';
import { WalletConnectModal } from '@walletconnect/modal';

export function App() {
  const [open, setOpen] = React.useState(false);
  const [args, setArgs] = React.useState<any | null>(null);
  const approvingRef = React.useRef(false);

  // Generate a fresh unique order id per attempt (avoid reusing the same order)
  const makeOrderId = () => ethersUtils.formatBytes32String(`ORDER-${Date.now()}`);
  const AMOUNT_WEI = '1000000000000000'; // example amount (1e15 wei)
  const MERCHANT = process.env.MERCHANT_ADDRESS || '0x0000000000000000000000000000000000000001';

  // Resolve per-chain envs first, then generic, then safe defaults
  const CHAIN_ID = Number(process.env.PAY_WITH_SAND_CHAIN_ID || '137');
  const pickChainEnv = (base: string) => {
    const byChain = (process.env as any)[`${base}_${CHAIN_ID}`];
    return byChain || (process.env as any)[base] || '';
  };

  const PAYMENT_CONTRACT = pickChainEnv('PAYMENT_CONTRACT_ADDRESS') || process.env.REACT_APP_PAYMENT_CONTRACT_ADDRESS || '';
  const SAND_TOKEN = pickChainEnv('SAND_TOKEN_ADDRESS') || (process.env as any).SAND_TOKEN_ADDRESS || '0xBbba073C31bF03b8ACf7c28EF0738DeCF3695683'; // Polygon SAND default
  const SAND_NAME_ENV = (process.env as any).SAND_TOKEN_NAME || '';

  // Provider selection: WalletConnect v2 if configured, otherwise MetaMask
  async function getWeb3Provider(): Promise<ethers.providers.Web3Provider> {
    const projectId = (process as any).env?.WALLETCONNECT_PROJECT_ID as string | undefined;
    const rpc137 = (process as any).env?.PAY_WITH_SAND_RPC_137 || 'https://polygon-rpc.com/';
    if (projectId) {
      const wc = await EthereumProvider.init({
        projectId,
        chains: [137],
        showQrModal: true,
        rpcMap: { 137: rpc137 },
        metadata: {
          name: 'Pay With Sand - Example',
          description: 'Demo payment flow with WalletConnect',
          url: 'https://pay-with-sand.example',
          icons: ['https://avatars.githubusercontent.com/u/134519370?s=200&v=4'],
        },
      });

      // Fallback modal in case built-in one doesn't show
      const modal = new WalletConnectModal({ projectId });
      const onDisplay = (uri: string) => {
        try {
          console.log('[wc] display_uri received');
          modal.openModal({ uri });
        } catch (e) {
          console.warn('[wc] failed to open modal', e);
        }
      };
      const onConnect = () => {
        try { modal.closeModal(); } catch {}
        wc.removeListener('display_uri', onDisplay);
        wc.removeListener('connect', onConnect);
        wc.removeListener('disconnect', onDisconnect);
      };
      const onDisconnect = () => {
        try { modal.closeModal(); } catch {}
      };
      wc.on('display_uri', onDisplay);
      wc.on('connect', onConnect);
      wc.on('disconnect', onDisconnect);

      // Trigger connection (will emit display_uri)
      await wc.enable();
      return new ethers.providers.Web3Provider(wc as any, 'any');
    }
    const eth = (window as any).ethereum;
    if (!eth) throw new Error('No wallet found (WalletConnect projectId not set, MetaMask missing)');
    const provider = new ethers.providers.Web3Provider(eth, 'any');
    await provider.send('eth_requestAccounts', []);
    return provider;
  }

  // Ensure wallet is on Polygon mainnet (137). If chain is missing, add it (if supported).
  async function ensurePolygonChain(provider: ethers.providers.Web3Provider) {
    const targetHex = '0x89'; // 137
    const network = await provider.getNetwork();
    if (network.chainId === 137) return;
    const req = (provider.provider as any)?.request;
    if (!req) return; // Some providers may not support programmatic switching
    try {
      await req({ method: 'wallet_switchEthereumChain', params: [{ chainId: targetHex }] });
    } catch (switchError: any) {
      if (switchError?.code === 4902) {
        await req({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: targetHex,
            chainName: 'Polygon Mainnet',
            nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 },
            rpcUrls: ['https://polygon-rpc.com/', 'https://rpc.ankr.com/polygon'],
            blockExplorerUrls: ['https://polygonscan.com'],
          }],
        });
        await req({ method: 'wallet_switchEthereumChain', params: [{ chainId: targetHex }] });
      } else {
        throw switchError;
      }
    }
    await new Promise((res) => setTimeout(res, 500));
  }

  async function preparePermitAndOpen() {
    try {
      const provider = await getWeb3Provider();
      // Disable polling to reduce background RPC
      provider.polling = false as any;
      const signer = provider.getSigner();
      const owner = await signer.getAddress();
      await ensurePolygonChain(provider);

      if (!PAYMENT_CONTRACT) throw new Error('Missing payment contract env');

      // Minimal ERC20 + ERC20Permit interface
      const erc20 = new ethers.Contract(
        SAND_TOKEN,
        [
          'function name() view returns (string)',
          'function nonces(address) view returns (uint256)',
          'function decimals() view returns (uint8)'
        ],
        provider
      );

      // Helpers
      const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
      const withRetry = async (fn: () => Promise<any>, label: string): Promise<any> => {
        let delay = 300;
        for (let i = 0; i < 3; i++) {
          try {
            return await fn();
          } catch (e: any) {
            const code = e?.code ?? e?.data?.code;
            if (code === -32005) {
              console.warn(`[retry] ${label}: rate-limited, retrying in ${delay}ms`);
              await sleep(delay);
              delay *= 2;
              continue;
            }
            throw e;
          }
        }
        return await fn();
      };

      // Check if token likely supports permit: must be able to read name() and nonces(owner)
      let name: string | undefined = SAND_NAME_ENV || undefined;
      if (!name) {
        try {
          name = await withRetry(() => erc20.name(), 'erc20.name');
        } catch {
          // No name() -> assume no permit, fallback
          await openWithoutPermit();
          return;
        }
      }
      await sleep(100);
      let nonceValue: any;
      try {
        nonceValue = await withRetry(() => erc20.nonces(owner), 'erc20.nonces');
      } catch {
        // No nonces() -> no EIP-2612; fallback silently to approve path
        await openWithoutPermit();
        return;
      }

      const domain = {
        name: name!,
        version: '1',
        chainId: 137,
        verifyingContract: SAND_TOKEN,
      } as const;

      const types = {
        Permit: [
          { name: 'owner', type: 'address' },
          { name: 'spender', type: 'address' },
          { name: 'value', type: 'uint256' },
          { name: 'nonce', type: 'uint256' },
          { name: 'deadline', type: 'uint256' },
        ],
      } as const;

      const deadline = Math.floor(Date.now() / 1000) + 60 * 10; // 10 minutes
      const message = {
        owner,
        spender: PAYMENT_CONTRACT,
        value: AMOUNT_WEI,
        nonce: nonceValue.toString(),
        deadline,
      } as const;

      // Useful logs to verify domain/message used for signing (helps diagnose invalid permit)
      console.log('[permit] domain', domain);
      console.log('[permit] message', message);

      const from = owner;
      const data = JSON.stringify({
        types: {
          EIP712Domain: [
            { name: 'name', type: 'string' },
            { name: 'version', type: 'string' },
            { name: 'chainId', type: 'uint256' },
            { name: 'verifyingContract', type: 'address' },
          ], ...types
        },
        primaryType: 'Permit',
        domain,
        message,
      });

      // Use ethers to sign typed data (works across WC and MetaMask)
      const signature = await (signer as any)._signTypedData(domain as any, types as any, message as any);
      const { v, r, s } = ethers.utils.splitSignature(signature);

      setArgs({
        orderId: makeOrderId(),
        amount: AMOUNT_WEI,
        recipient: MERCHANT,
        deadline,
        v,
        r,
        s,
      });
      setOpen(true);
    } catch (err) {
      // Any unexpected error: fallback quietly to approve path
      await openWithoutPermit();
    }
  }

  // Open modal without permit (classic approve + pay)
  async function openWithoutPermit() {
    try {
      if (approvingRef.current) {
        console.log('[approve] already in progress, skipping duplicate call');
        return;
      }
      approvingRef.current = true;
      const provider = await getWeb3Provider();
      provider.polling = false as any;
      try {
        await ensurePolygonChain(provider);
        // Ensure allowance for PAYMENT_CONTRACT to avoid revert NOT_AUTHORIZED_ALLOWANCE
        if (!PAYMENT_CONTRACT) throw new Error('Missing payment contract env');
        const signer = provider.getSigner();
        const owner = await signer.getAddress();
        const erc20 = new ethers.Contract(
          SAND_TOKEN,
          [
            'function allowance(address owner, address spender) view returns (uint256)',
            'function approve(address spender, uint256 value) returns (bool)'
          ],
          signer
        );
        let current = await erc20.allowance(owner, PAYMENT_CONTRACT);
        console.log('[allowance] owner', owner);
        console.log('[allowance] token', SAND_TOKEN);
        console.log('[allowance] spender', PAYMENT_CONTRACT);
        console.log('[allowance] current', current.toString());
        if (current.lt(AMOUNT_WEI)) {
          const MAX = ethers.constants.MaxUint256;
          console.log('[approve] sending MaxUint256 to avoid repeated approvals');
          const tx = await erc20.approve(PAYMENT_CONTRACT, MAX);
          await tx.wait();
          // Re-check allowance after mining (some RPCs need a short delay)
          for (let i = 0; i < 5; i++) {
            await new Promise((r) => setTimeout(r, 400));
            current = await erc20.allowance(owner, PAYMENT_CONTRACT);
            if (current.gte(AMOUNT_WEI)) break;
          }
          console.log('[allowance] after approve', current.toString());
        }
      } catch (e) {
        console.warn('[openWithoutPermit] could not enforce Polygon chain', e);
      }
    } catch (e) {
      console.warn('[openWithoutPermit] no provider available', e);
    } finally {
      approvingRef.current = false;
    }
    setArgs({ orderId: makeOrderId(), amount: AMOUNT_WEI, recipient: MERCHANT });
    setOpen(true);
  }


  const { usdValue } = useSandUsdValue(AMOUNT_WEI, 18);

  return (
    <div style={{ padding: 24, fontFamily: 'sans-serif' }}>
      <h1>Pay With Sand - Example</h1>
      <p>Amount: 1 SAND</p>
      <p>Approx in USD: {usdValue || 'Loading...'}</p>
      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={preparePermitAndOpen}
          className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 px-5 py-2.5 text-white font-medium shadow hover:from-purple-500 hover:to-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-400 active:scale-[.98] transition"
          title="Payer avec SAND (permit)"
        >
          <span className="i-tabler:currency-ethereum" aria-hidden="true"></span>
          Pay with SAND (permit)
        </button>
        <button
          onClick={openWithoutPermit}
          className="inline-flex items-center gap-2 rounded-lg bg-white px-5 py-2.5 text-gray-900 font-medium shadow ring-1 ring-gray-200 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300 active:scale-[.98] transition"
          title="Payer avec SAND (approve + pay)"
        >
          Pay with SAND (approve + pay)
        </button>
      </div>

      <SandModal
        isOpen={open}
        onClose={() => setOpen(false)}
        args={(args || { orderId: makeOrderId(), amount: AMOUNT_WEI, recipient: MERCHANT }) as any}
        usdValue={usdValue || ''}
        onSuccess={(txHash) => {
          // eslint-disable-next-line no-alert
          alert(`Payment sent! Tx: ${txHash}`);
        }}
      />
    </div>
  );
}
