import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SandModal } from '../src/components/SandModal';
import type { Signer } from 'ethers';

vi.mock('../src/payWithSand', () => ({
  payWithSand: vi.fn(async () => '0xhash')
}));

const baseArgs = {
  amount: '1000000000000000000',
  orderId: '0x0000000000000000000000000000000000000000000000000000000000000001',
  recipient: '0x000000000000000000000000000000000000dEaD',
};

describe('SandModal basic interactions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders and triggers confirm which calls payWithSand', async () => {
    const onClose = vi.fn();
    const onSuccess = vi.fn();
    const dummySigner = { provider: { getNetwork: async () => ({ chainId: 137 }) } } as unknown as Signer;

    render(
      <SandModal
        isOpen={true}
        onClose={onClose}
        args={baseArgs as any}
        usdValue={'$1.00'}
        signer={dummySigner}
        onSuccess={onSuccess}
      />
    );

    fireEvent.click(screen.getByText('Confirm & Pay'));
    await waitFor(() => expect(onSuccess).toHaveBeenCalledWith('0xhash'));
  });
});
