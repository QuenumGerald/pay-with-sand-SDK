import React from 'react'
import { createRoot } from 'react-dom/client'
import type { PayArgs } from '../src/types'
import { Buffer } from 'buffer'
import * as util from 'util'
import processShim from 'process'
import inherits from 'inherits'

// Polyfill Buffer for libs (e.g., WalletConnect v1) expecting it in the browser
;(globalThis as any).Buffer = (globalThis as any).Buffer || Buffer
;(globalThis as any).util = (globalThis as any).util || util
;(globalThis as any).process = (globalThis as any).process || processShim
;(util as any).inherits = (util as any).inherits || (inherits as any)

// Map Vite env to process.env expected by the SDK
const { VITE_PAYMENT_CONTRACT_ADDRESS, VITE_INFURA_ID } = (import.meta as any).env as any
;(globalThis as any).process.env = (globalThis as any).process.env || {}
;(globalThis as any).process.env.REACT_APP_PAYMENT_CONTRACT_ADDRESS = VITE_PAYMENT_CONTRACT_ADDRESS
;(globalThis as any).process.env.INFURA_ID = VITE_INFURA_ID

// Load SandModal lazily so the polyfills above are in place before module evaluation
const SandModal = React.lazy(() => import('../src/components/SandModal').then(m => ({ default: m.SandModal })))

function App() {
  console.log('[App] render')
  const [open, setOpen] = React.useState(false)
  const [amount, setAmount] = React.useState('100000000000000000')
  const [orderId, setOrderId] = React.useState('TEST-ORDER-001')
  const [recipient, setRecipient] = React.useState('0x0000000000000000000000000000000000000000')

  const args: PayArgs = { amount, orderId, recipient }

  return (
    <div style={{ padding: 24, fontFamily: 'sans-serif', color: '#111', background: '#fff' }}>
      <h1 style={{ color: '#111' }}>Test du SDK pay-with-sand</h1>
      <p>Connectez votre wallet (MetaMask/WalletConnect) et cliquez sur le bouton pour ouvrir la modale.</p>

      <div style={{ display: 'grid', gap: 8, maxWidth: 520 }}>
        <label>
          Montant (wei)
          <input value={amount} onChange={e => setAmount(e.target.value)} style={{ width: '100%' }} />
        </label>
        <label>
          Order ID
          <input value={orderId} onChange={e => setOrderId(e.target.value)} style={{ width: '100%' }} />
        </label>
        <label>
          Destinataire (address)
          <input value={recipient} onChange={e => setRecipient(e.target.value)} style={{ width: '100%' }} />
        </label>
      </div>

      <button onClick={() => setOpen(true)} style={{ marginTop: 16, padding: '10px 16px' }}>
        Payer avec SAND (ouvrir la modale)
      </button>

      <React.Suspense fallback={<div>Chargement…</div>}>
        <SandModal
          isOpen={open}
          onClose={() => setOpen(false)}
          args={args}
          onSuccess={(hash) => console.log('Tx hash', hash)}
        />
      </React.Suspense>
    </div>
  )
}

const rootEl = document.getElementById('root')
if (!rootEl) {
  console.error('[App] #root not found')
} else {
  console.log('[App] mounting to #root')
  createRoot(rootEl).render(<App />)
}
