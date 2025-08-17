import React from 'react'
import { createRoot } from 'react-dom/client'
import type { PayArgs } from '../src/types'
import { useSandUsdValue } from '../src/useSandUsdValue'
import { Buffer } from 'buffer'
import * as util from 'util'
import processShim from 'process'
import inherits from 'inherits'
// Import ethers v5 from repo root to match SDK's ethers version
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { ethers as ethers5 } from '../node_modules/ethers'

// Polyfill Buffer for libs (e.g., WalletConnect v1) expecting it in the browser
;(globalThis as any).Buffer = (globalThis as any).Buffer || Buffer
// ESM import namespaces are immutable; create a polyfilled util object instead of mutating the import
const utilPoly: any = { ...(util as any) }
if (!utilPoly.inherits) utilPoly.inherits = inherits as any
;(globalThis as any).util = (globalThis as any).util || utilPoly
;(globalThis as any).process = (globalThis as any).process || processShim

// Map Vite env to process.env expected by the SDK
const { VITE_PAYMENT_CONTRACT_ADDRESS, VITE_INFURA_ID, VITE_CHAIN_ID } = (import.meta as any).env as any
;(globalThis as any).process.env = (globalThis as any).process.env || {}
;(globalThis as any).process.env.REACT_APP_PAYMENT_CONTRACT_ADDRESS = VITE_PAYMENT_CONTRACT_ADDRESS
;(globalThis as any).process.env.INFURA_ID = VITE_INFURA_ID
;(globalThis as any).process.env.PAY_WITH_SAND_CHAIN_ID = VITE_CHAIN_ID

// Load SandModal lazily so the polyfills above are in place before module evaluation
const SandModal = React.lazy(() => import('../src/components/SandModal').then(m => ({ default: m.SandModal })))

function App() {
  console.log('[App] render')
  const [open, setOpen] = React.useState(false)
  const [amount, setAmount] = React.useState('100000000000000000')
  const [orderId, setOrderId] = React.useState('TEST-ORDER-001')
  const [recipient, setRecipient] = React.useState('0x0000000000000000000000000000000000000000')
  const [signer, setSigner] = React.useState<any | null>(null)

  const args: PayArgs = { amount, orderId, recipient }
  const { usdValue } = useSandUsdValue(amount, 18)

  const connect = async () => {
    try {
      const eth = (window as any).ethereum
      if (!eth) {
        alert('MetaMask not found')
        return
      }
      await eth.request({ method: 'eth_requestAccounts' })
      const provider = new ethers5.providers.Web3Provider(eth)
      const s = await provider.getSigner()
      setSigner(s)
    } catch (e) {
      console.error('connect error', e)
      alert('Failed to connect wallet')
    }
  }

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

      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={connect} style={{ marginTop: 16, padding: '10px 16px' }}>
          Connect Wallet
        </button>
        <button onClick={() => setOpen(true)} style={{ marginTop: 16, padding: '10px 16px' }}>
        Payer avec SAND (ouvrir la modale)
        </button>
      </div>

      <React.Suspense fallback={<div>Chargement…</div>}>
        <SandModal
          isOpen={open}
          onClose={() => setOpen(false)}
          args={args}
          usdValue={usdValue}
          signer={signer || undefined}
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
