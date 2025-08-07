import React, { useState } from 'react';
import { SandModal } from './SandModal';
import { SandSDKTest } from './components/SandSDKTest';
import { DirectSDKUsage } from './examples/DirectSDKUsage';
import { PrivateKeyExample } from './examples/PrivateKeyExample';
import type { PayArgs } from './types';
import { WagmiConfig } from 'wagmi';
import { wagmiConfig } from './web3/config';

const dummyArgs: PayArgs = {
  orderId: 'DEMO-ORDER-' + Date.now(),
  recipient: '0x1234567890abcdef1234567890abcdef12345678',
  amount: '1000000000000000000', // 1 SAND
};

function App() {
  const [showModal, setShowModal] = useState(false);
  const [showSDKTest, setShowSDKTest] = useState(false);
  const [showDirectSDK, setShowDirectSDK] = useState(false);
  const [showPrivateKeyExample, setShowPrivateKeyExample] = useState(true);

  return (
    <WagmiConfig config={wagmiConfig}>
      <div style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          <button 
            onClick={() => setShowModal(!showModal)}
            style={{ ...buttonStyle, fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}
          >
            {showModal ? 'Cacher' : 'SandModal'}
          </button>
          <button 
            onClick={() => setShowSDKTest(!showSDKTest)}
            style={{ ...buttonStyle, fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}
          >
            {showSDKTest ? 'Cacher' : 'SDK Test'}
          </button>
          <button 
            onClick={() => setShowDirectSDK(!showDirectSDK)}
            style={{ ...buttonStyle, fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}
          >
            {showDirectSDK ? 'Cacher' : 'Direct SDK'}
          </button>
          <button 
            onClick={() => setShowPrivateKeyExample(!showPrivateKeyExample)}
            style={{ 
              ...buttonStyle, 
              fontSize: '0.8rem', 
              padding: '0.4rem 0.8rem',
              backgroundColor: showPrivateKeyExample ? '#2c5282' : '#00B3B0'
            }}
          >
            {showPrivateKeyExample ? 'Cacher' : 'Test Clé Privée'}
          </button>
        </div>

        <div style={{ marginTop: '1rem' }}>
          {showModal && (
            <SandModal
              isOpen={showModal}
              onClose={() => setShowModal(false)}
              args={dummyArgs}
            />
          )}

          {showSDKTest && <SandSDKTest />}
          {showDirectSDK && <DirectSDKUsage />}
          {showPrivateKeyExample && <PrivateKeyExample />}
        </div>
      </div>
    </WagmiConfig>
  );
}

const buttonStyle = {
  backgroundColor: '#00B3B0',
  color: 'white',
  padding: '0.5rem 1rem',
  border: 'none',
  borderRadius: '0.25rem',
  cursor: 'pointer',
  fontSize: '0.9rem'
};

export default App;
