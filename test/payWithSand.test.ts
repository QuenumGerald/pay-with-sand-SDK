import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock ethers module to avoid real blockchain calls
vi.mock('ethers', () => {
  class DummyContract {
    constructor(_addr: string, _abi: any, _signer: any) {}
    async pay() { return { hash: '0xpay' }; }
    async payWithPermit() { return { hash: '0xpermit' }; }
  }
  return {
    Contract: DummyContract,
    ethers: {
      utils: { isAddress: (a: string) => /^0x[a-fA-F0-9]{40}$/.test(a) },
    },
  };
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

describe('payWithSand signer-based flow', () => {
  const dummySigner = { provider: { getNetwork: async () => ({ chainId: 137 }) } } as any;

  beforeEach(() => {
    setEnv('REACT_APP_PAYMENT_CONTRACT_ADDRESS', '0x0000000000000000000000000000000000000001');
    // Unset potential chain-specific addresses
    setEnv('PAYMENT_CONTRACT_ADDRESS_137');
  });

  const baseArgs = {
    amount: '1000000000000000000',
    orderId: '0x0000000000000000000000000000000000000000000000000000000000000001',
    recipient: '0x000000000000000000000000000000000000dEaD',
  } as const;

  it('throws when no signer is provided', async () => {
    await expect(payWithSand(baseArgs as any)).rejects.toThrow(/No signer provided/i);
  });

  it('calls pay and returns tx hash when signer is provided', async () => {
    const hash = await payWithSand({ ...baseArgs, signer: dummySigner });
    expect(hash).toBe('0xpay');
  });

  it('calls payWithPermit when signature args are provided', async () => {
    const hash = await payWithSand({
      ...baseArgs,
      signer: dummySigner,
      deadline: Math.floor(Date.now() / 1000) + 3600,
      v: 27,
      r: '0x'.padEnd(66, '1'),
      s: '0x'.padEnd(66, '2'),
    } as any);
    expect(hash).toBe('0xpermit');
  });

  it('throws if contract address is missing', async () => {
    setEnv('REACT_APP_PAYMENT_CONTRACT_ADDRESS');
    await expect(payWithSand({ ...baseArgs, signer: dummySigner } as any)).rejects.toThrow(/PAYMENT_CONTRACT_ADDRESS|REACT_APP_PAYMENT_CONTRACT_ADDRESS/i);
  });
});
