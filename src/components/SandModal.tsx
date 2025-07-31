import React from 'react';
import { Dialog } from '@headlessui/react';
import { Button } from '@/components/ui/button';
import type { PayArgs } from '../types';
import { payWithSand } from '../payWithSand';
import { ethers } from 'ethers';

interface SandModalProps {
  isOpen: boolean;
  onClose: () => void;
  args: PayArgs;
  onSuccess?: (txHash: string) => void;
}

export function SandModal({ isOpen, onClose, args, onSuccess }: SandModalProps) {
  const [loading, setLoading] = React.useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      const hash = await payWithSand(args);
      onSuccess?.(hash);
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="fixed inset-0 z-50 flex items-center justify-center">
      <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />
      <div className="bg-white rounded-2xl p-6 w-96 shadow-lg">
        <Dialog.Title className="text-xl font-semibold mb-4">Payer avec $SAND</Dialog.Title>
        <p className="mb-6">Montant: {ethers.utils.formatUnits(args.amount, 18)} $SAND</p>
        <div className="flex justify-end space-x-2">
          <Button variant="secondary" onClick={onClose} disabled={loading}>Annuler</Button>
          <Button onClick={handleConfirm} disabled={loading}>
            {loading ? 'Traitement…' : 'Confirmer'}
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
