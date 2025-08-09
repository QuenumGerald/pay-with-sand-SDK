// Minimal browser polyfills for libraries expecting Node globals
// Fixes: "global is not defined" in some WalletConnect v1 deps
declare global {
  interface Window { global?: any; }
}

if (typeof window !== 'undefined' && (window as any).global === undefined) {
  (window as any).global = window;
}

// Provide Buffer for Node libs running in the browser (e.g., ethereumjs-util)
import { Buffer as BufferPolyfill } from 'buffer';
if (typeof (window as any).Buffer === 'undefined') {
  (window as any).Buffer = BufferPolyfill;
}

// Provide process for Node libs (e.g., safe-event-emitter / web3-provider-engine deps)
import processPolyfill from 'process';
if (typeof (window as any).process === 'undefined') {
  (window as any).process = processPolyfill;
}

export {};
