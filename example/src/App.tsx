import React from 'react';
import { SandModal, useSandUsdValue } from '@pay-with-sand/sdk';
import { ethers, utils as ethersUtils } from 'ethers';

export function App() {
  const [open, setOpen] = React.useState(false);
  const [args, setArgs] = React.useState<any | null>(null);

  // Generate a fresh unique order id per attempt (avoid reusing the same order)
  const makeOrderId = () => ethersUtils.formatBytes32String(`ORDER-${Date.now()}`);
  const AMOUNT_WEI = '1000000000000000'; // 1 SAND (18 decimals)
  const MERCHANT = process.env.MERCHANT_ADDRESS || '0x0000000000000000000000000000000000000001';
  const PAYMENT_CONTRACT = process.env.REACT_APP_PAYMENT_CONTRACT_ADDRESS || '';
  // SAND token address (from env, fallback to Base Sepolia default)
  const SAND_TOKEN = process.env.SAND_TOKEN_ADDRESS || '0x4e8949E43d218aA6a38B05dd4EF4105238683f2D';
  const SAND_NAME_ENV = process.env.SAND_TOKEN_NAME || '';

  // Ensure wallet is on Polygon mainnet (137). If chain is missing, add it.
  async function ensurePolygonChain(eth: any, provider: ethers.providers.Web3Provider) {
    const targetHex = '0x89'; // 137
    const network = await provider.getNetwork();
    if (network.chainId === 137) return;
    try {
      await eth.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: targetHex }],
      });
    } catch (switchError: any) {
      // Unrecognized chain -> add it then switch
      if (switchError?.code === 4902) {
        await eth.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: targetHex,
            chainName: 'Polygon Mainnet',
            nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 },
            rpcUrls: ['https://polygon-rpc.com/', 'https://rpc.ankr.com/polygon'],
            blockExplorerUrls: ['https://polygonscan.com']
          }],
        });
        await eth.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: targetHex }],
        });
      } else {
        throw switchError;
      }
    }
    await new Promise((res) => setTimeout(res, 500));
  }

  async function preparePermitAndOpen() {
    try {
      const eth = (window as any).ethereum;
      if (!eth) throw new Error('MetaMask not detected');
      const provider = new ethers.providers.Web3Provider(eth);
      // Disable polling to reduce background RPC
      provider.polling = false as any;
      await provider.send('eth_requestAccounts', []);
      const signer = provider.getSigner();
      const owner = await signer.getAddress();
      await ensurePolygonChain(eth, provider);

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

      // Token name for EIP-2612 domain: prefer env; otherwise fetch once with retry
      const name = SAND_NAME_ENV
        ? SAND_NAME_ENV
        : await withRetry(() => erc20.name(), 'erc20.name');
      await sleep(150);
      const nonce = await withRetry(() => erc20.nonces(owner), 'erc20.nonces');

      const domain = {
        name,
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
        nonce: nonce.toString(),
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

      const signature = await eth.request({
        method: 'eth_signTypedData_v4',
        params: [from, data],
      });
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
      console.error('[permit] Failed to prepare permit', err);
      // Fallback: open without permit so you can see error in the modal
      setArgs({ orderId: makeOrderId(), amount: AMOUNT_WEI, recipient: MERCHANT });
      setOpen(true);
    }
  }

  // Open modal without permit (classic approve + pay)
  async function openWithoutPermit() {
    const eth = (window as any).ethereum;
    if (eth) {
      const provider = new ethers.providers.Web3Provider(eth);
      provider.polling = false as any;
      try {
        await provider.send('eth_requestAccounts', []);
        await ensurePolygonChain(eth, provider);
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
        const current = await erc20.allowance(owner, PAYMENT_CONTRACT);
        console.log('[allowance] owner', owner);
        console.log('[allowance] token', SAND_TOKEN);
        console.log('[allowance] spender', PAYMENT_CONTRACT);
        console.log('[allowance] current', current.toString());
        if (current.lt(AMOUNT_WEI)) {
          const MAX = ethers.constants.MaxUint256;
          console.log('[approve] sending MaxUint256 to avoid repeated approvals');
          const tx = await erc20.approve(PAYMENT_CONTRACT, MAX);
          await tx.wait();
        }
      } catch (e) {
        console.warn('[openWithoutPermit] could not enforce Polygon chain', e);
      }
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
