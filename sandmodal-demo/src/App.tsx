import React from 'react';
import { SandModal } from './SandModal';
import type { PayArgs } from './types';

const dummyArgs: PayArgs = {
  orderId: 'DEMO-ORDER-001',
  recipient: '0x1234567890abcdef1234567890abcdef12345678',
  amount: '1000000000000000000',
};

function App() {
  const [open, setOpen] = React.useState(true);

  return (
    <SandModal
      isOpen={open}
      onClose={() => setOpen(false)}
      args={dummyArgs}
    />
  );
}
export default App;
