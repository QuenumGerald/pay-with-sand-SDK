import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SandModal } from '../src/components/SandModal';

vi.mock('../src/payWithSand', () => ({
  payWithSand: vi.fn(async () => '0xhash')
}));

const baseArgs = {
  amount: '1000000000000000000',
  orderId: '0x0000000000000000000000000000000000000000000000000000000000000001',
  recipient: '0x000000000000000000000000000000000000dEaD',
};

describe('SandModal wallet selection UI', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders and toggles wallet selection', async () => {
    const onClose = vi.fn();
    const onSuccess = vi.fn();

    render(
      <SandModal
        isOpen={true}
        onClose={onClose}
        args={baseArgs as any}
        usdValue={'$1.00'}
        onSuccess={onSuccess}
      />
    );

    // Default is MetaMask selected
    expect(screen.getByText('MetaMask')).not.toBeNull();
    expect(screen.getByText('WalletConnect')).not.toBeNull();

    // Choose WalletConnect
    fireEvent.click(screen.getByText('WalletConnect'));

    // Confirm
    fireEvent.click(screen.getByText('Confirm & Pay'));
    await waitFor(() => expect(onSuccess).toHaveBeenCalledWith('0xhash'));
  });
});
