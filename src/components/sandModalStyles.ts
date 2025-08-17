// Styles for SandModal and SDK components
// These styles are injected at runtime for isolation and zero-config UX
const sandModalStyles = `
.sand-modal-overlay {
  position: fixed; inset: 0; z-index: 9999;
  background: rgba(20,33,61,0.86);
  display: flex; align-items: center; justify-content: center;
}
.sand-modal-content {
  background: #14213d;
  border-radius: 1.5rem;
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.18);
  border: 1px solid #22335b;
  padding: 1.5rem;
  max-width: 420px; width: 100%;
  color: #fff;
  position: relative;
  font-family: 'Inter', 'Segoe UI', Arial, sans-serif;
}
.sand-modal-header {
  display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.5rem;
}
.sand-modal-title {
  font-size: 1.35rem; font-weight: 700;
  background: linear-gradient(90deg, #00ADEF, #00D1FF);
  background-clip: text; -webkit-background-clip: text;
  color: transparent; -webkit-text-fill-color: transparent;
}
.sand-modal-close {
  color: #8fa2c7; font-size: 1.7rem; font-weight: bold; background: none; border: none; cursor: pointer;
  transition: color 0.18s;
}
.sand-modal-close:hover { color: #fff; }
.sand-modal-amount-box { background: #1a2540; border-radius: 1rem; padding: 1rem; margin-bottom: 0.5rem; }
.sand-modal-amount {
  font-size: 2rem; font-weight: 600; color: #fff;
}
.sand-modal-usd { color: #8fa2c7; font-size: 0.95rem; margin-top: 0.25rem; }
.sand-modal-network {
  display: flex; align-items: center; background: #1a2540; border-radius: 1rem; padding: 0.75rem; margin-bottom: 1rem;
}
.sand-modal-network-icon {
  width: 2rem; height: 2rem; background: #22335b; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 0.75rem;
}
.sand-modal-network-label { color: #fff; font-weight: 500; }
.sand-modal-network-gas { color: #8fa2c7; font-size: 0.75rem; }
.sand-modal-error {
  color: #f87171; background: #1a2540; border-radius: 0.5rem; padding: 0.5rem 0.75rem; margin-bottom: 1rem; font-size: 0.92rem;
}
.sand-modal-recap {
  margin-bottom: 1rem;
}
.sand-modal-recap-label { color: #8fa2c7; font-size: 0.93rem; margin-bottom: 0.3rem; }
.sand-modal-recap-box {
  background: #1a2540; border-radius: 0.8rem; padding: 0.75rem 1rem;
}
.sand-modal-row {
  display: flex; justify-content: space-between; align-items: center; gap: 0.5rem; color: #8fa2c7; font-size: 0.88rem; margin-bottom: 0.2rem;
}
.sand-modal-row span:last-child { color: #4db6ff; text-align: right; }
.sand-modal-info {
  background: rgba(248,211,76,0.08); border: 1px solid #f8d34c; border-radius: 0.7rem; padding: 0.5rem 1rem; color: #f8d34c; font-size: 0.9rem; margin-bottom: 1.4rem;
}
.sand-modal-actions {
  display: flex; justify-content: space-between; gap: 0.75rem;
}
.sand-modal-btn {
  flex: 1;
  padding: 0.7rem 0;
  border-radius: 0.7rem;
  font-weight: 600;
  font-size: 1.07rem;
  border: none;
  transition: background 0.18s, color 0.12s, transform 0.1s;
  cursor: pointer;
}
.sand-modal-btn.cancel {
  background: transparent; color: #8fa2c7; border: 1.5px solid #8fa2c7;
}
.sand-modal-btn.cancel:hover { background: #22335b; color: #fff; }
.sand-modal-btn.confirm {
  background: #00ADEF; /* Sandbox primary blue */
  color: #fff;
}
.sand-modal-btn.confirm:hover { background: #0096cc; transform: scale(1.03); }
.sand-modal-btn:disabled { opacity: 0.6; cursor: not-allowed; }

/* Wallet cards */
.sand-wallets {
  margin-bottom: 1rem;
}
.sand-wallets-title { color: #8fa2c7; font-size: 0.93rem; margin-bottom: 0.4rem; }
.sand-wallets-row { display: flex; gap: 0.75rem; flex-wrap: wrap; }
.sand-wallet-btn {
  background: #1a2540; border: 2px solid transparent; color: #fff; border-radius: 0.7rem;
  width: 120px; height: 80px; display: inline-flex; align-items: center; justify-content: center; flex-direction: column; gap: 0.4rem;
  cursor: pointer; transition: border-color .15s, transform .1s;
}
.sand-wallet-btn:hover { transform: translateY(-1px); }
.sand-wallet-btn.selected { border-color: #f8d34c; box-shadow: 0 0 0 2px rgba(248,211,76,0.25) inset; }
.sand-wallet-btn img { width: 28px; height: 28px; }
`;

export function injectSandModalStyles() {
  if (typeof document === 'undefined') return;
  if (document.getElementById('sand-modal-styles')) return;
  const style = document.createElement('style');
  style.id = 'sand-modal-styles';
  style.innerHTML = sandModalStyles;
  document.head.appendChild(style);
}
