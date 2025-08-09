import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock ethers module to avoid real provider/contract usage
vi.mock('ethers', () => {
  class DummySigner {}
  class DummyWeb3Provider {
    constructor(public src: any) {}
    async send(_method: string, _params: any[]) { return []; }
    getSigner() { return new DummySigner(); }
  }
  class DummyContract {
    constructor(_addr: string, _abi: any, _signer: any) {}
    async pay() { return { hash: '0xpay' }; }
    async payWithPermit() { return { hash: '0xpermit' }; }
  }
  return {
    Contract: DummyContract,
    ethers: {
      providers: { Web3Provider: DummyWeb3Provider },
      utils: { isAddress: (a: string) => /^0x[a-fA-F0-9]{40}$/.test(a) },
    },
  };
});

// Mock WalletConnect provider (define inside factory to avoid hoist issues)
const enableSpy = vi.fn();
vi.mock('@walletconnect/web3-provider', () => {
  class MockWC {
    constructor(_opts: any) {}
    enable = enableSpy;
  }
  return { default: MockWC };
});

// Under test
import { payWithSand } from '../src/payWithSand';

// Helpers to mutate env safely
const setEnv = (k: string, v?: string) => {
  if (v === undefined) {
    delete (process as any).env[k];
  } else {
    (process as any).env[k] = v;
  }
};

describe('payWithSand wallet selection & transactions', () => {
  beforeEach(() => {
    // clean window.ethereum and env between tests
    // @ts-ignore
    delete global.window.ethereum;
    setEnv('INFURA_ID');
    setEnv('REACT_APP_PAYMENT_CONTRACT_ADDRESS', '0x0000000000000000000000000000000000000001');
    enableSpy.mockClear();
  });

  const baseArgs = {
    amount: '1000000000000000000',
    orderId: '0x0000000000000000000000000000000000000000000000000000000000000001',
    recipient: '0x000000000000000000000000000000000000dEaD',
  } as const;

  it('uses MetaMask when selected and available', async () => {
    // @ts-ignore
    global.window = global.window || ({} as any);
    // @ts-ignore
    global.window.ethereum = { isMetaMask: true } as any;

    const hash = await payWithSand({ ...baseArgs, wallet: 'metamask' });
    expect(hash).toBe('0xpay');
  });

  it('throws when MetaMask selected but not present', async () => {
    await expect(payWithSand({ ...baseArgs, wallet: 'metamask' })).rejects.toThrow(/MetaMask not detected/i);
  });

  it('uses WalletConnect when selected and INFURA_ID provided', async () => {
    setEnv('INFURA_ID', 'test');
    const hash = await payWithSand({ ...baseArgs, wallet: 'walletconnect' });
    expect(hash).toBe('0xpay');
    expect(enableSpy).toHaveBeenCalled();
  });

  it('auto-selects WalletConnect when MetaMask missing', async () => {
    setEnv('INFURA_ID', 'test');
    const hash = await payWithSand(baseArgs as any);
    expect(hash).toBe('0xpay');
  });

  it('errors if WalletConnect path without INFURA_ID', async () => {
    await expect(payWithSand({ ...baseArgs, wallet: 'walletconnect' })).rejects.toThrow(/INFURA_ID/i);
  });

  it('calls payWithPermit when signature args are provided', async () => {
    // Ensure MetaMask path available
    // @ts-ignore
    global.window = global.window || ({} as any);
    // @ts-ignore
    global.window.ethereum = { isMetaMask: true } as any;
    const hash = await payWithSand({
      ...baseArgs,
      wallet: 'metamask',
      deadline: Math.floor(Date.now() / 1000) + 3600,
      v: 27,
      r: '0x'.padEnd(66, '1'),
      s: '0x'.padEnd(66, '2'),
    } as any);
    expect(hash).toBe('0xpermit');
  });

  it('throws if REACT_APP_PAYMENT_CONTRACT_ADDRESS is missing', async () => {
    setEnv('REACT_APP_PAYMENT_CONTRACT_ADDRESS');
    // Ensure provider can init (MetaMask present)
    // @ts-ignore
    global.window = global.window || ({} as any);
    // @ts-ignore
    global.window.ethereum = { isMetaMask: true } as any;
    await expect(payWithSand({ ...baseArgs, wallet: 'metamask' } as any)).rejects.toThrow(/REACT_APP_PAYMENT_CONTRACT_ADDRESS/);
  });
});
