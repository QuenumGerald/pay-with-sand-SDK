import React from 'react';
import { SandModal, useSandUsdValue, payWithSand } from '@pay-with-sand/sdk';
import { ethers, utils as ethersUtils } from 'ethers';

export function App() {
  const [open, setOpen] = React.useState(false);
  const [args, setArgs] = React.useState<any | null>(null);

  // Static values for the demo
  const ORDER_BYTES32 = ethersUtils.formatBytes32String('ORDER-123');
  const AMOUNT_WEI = '1000000000000000000'; // 1 SAND (18 decimals)
  const MERCHANT = process.env.MERCHANT_ADDRESS || '0x0000000000000000000000000000000000000001';
  const PAYMENT_CONTRACT = process.env.REACT_APP_PAYMENT_CONTRACT_ADDRESS || '';
  // SAND token address (from env, fallback to Base Sepolia default)
  const SAND_TOKEN = process.env.SAND_TOKEN_ADDRESS || '0x4e8949E43d218aA6a38B05dd4EF4105238683f2D';
  const SAND_NAME_ENV = process.env.SAND_TOKEN_NAME || '';

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
      const network = await provider.getNetwork();
      if (network.chainId !== 84532) {
        // Base Sepolia chainId = 84532 (0x14A34)
        await eth.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0x14A34' }],
        });
        // small pause after switching chain to let provider settle
        await new Promise((res) => setTimeout(res, 500));
      }

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
        chainId: 84532,
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
        types: { EIP712Domain: [
          { name: 'name', type: 'string' },
          { name: 'version', type: 'string' },
          { name: 'chainId', type: 'uint256' },
          { name: 'verifyingContract', type: 'address' },
        ], ...types },
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
        orderId: ORDER_BYTES32,
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
      setArgs({ orderId: ORDER_BYTES32, amount: AMOUNT_WEI, recipient: MERCHANT });
      setOpen(true);
    }
  }

  async function handlePayDirect() {
    try {
      const txHash = await payWithSand({
        orderId: ORDER_BYTES32,
        amount: AMOUNT_WEI,
        recipient: MERCHANT,
      } as any);
      // eslint-disable-next-line no-alert
      alert(`Payment sent! Tx: ${txHash}`);
    } catch (err) {
      console.error('[pay] Failed to send payment', err);
    }
  }

  const { usdValue } = useSandUsdValue(AMOUNT_WEI, 18);

  return (
    <div style={{ padding: 24, fontFamily: 'sans-serif' }}>
      <h1>Pay With Sand - Example</h1>
      <p>Amount: 1 SAND</p>
      <p>Approx in USD: {usdValue || 'Loading...'}</p>
      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={preparePermitAndOpen} style={{ padding: '8px 12px' }}>
          Pay with SAND (permit)
        </button>
        <button onClick={handlePayDirect} style={{ padding: '8px 12px' }}>
          Pay with SAND (direct)
        </button>
      </div>

      <SandModal
        isOpen={open}
        onClose={() => setOpen(false)}
        args={(args || { orderId: ORDER_BYTES32, amount: AMOUNT_WEI, recipient: MERCHANT }) as any}
        usdValue={usdValue || ''}
        onSuccess={(txHash) => {
          // eslint-disable-next-line no-alert
          alert(`Payment sent! Tx: ${txHash}`);
        }}
      />
    </div>
  );
}
