import React from 'react';
import './App.css';
import { SandModal } from './SandModal';
import type { PayArgs } from './types';

const dummyArgs: PayArgs = {
  orderId: 'DEMO-ORDER-001',
  recipient: '0x1234567890abcdef1234567890abcdef12345678',
  amount: '1000000000000000000', // 1 SAND in wei
};

function App() {
  const [open, setOpen] = React.useState(true);
  return (
    <div className="App" style={{ minHeight: '100vh', background: '#0a192f', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>

      <SandModal
        isOpen={open}
        onClose={() => setOpen(false)}
        args={dummyArgs}
        onSuccess={txHash => alert('Paiement réussi ! Tx: ' + txHash)}
      />
    </div>
  );
}

export default App;
