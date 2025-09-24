// Styles for SandModal and SDK components
// These styles are injected at runtime for isolation and zero-config UX
const sandModalStyles = `
.sand-modal-overlay {
  position: fixed; inset: 0; z-index: 9999;
  background: rgba(20,33,61,0.86);
  display: flex; align-items: center; justify-content: center;
}
.sand-modal-shell {
  position: relative;
  padding: 1.5px;
  border-radius: 1.6rem;
  background: linear-gradient(135deg, rgba(0,173,239,0.35), rgba(248,211,76,0.25));
  max-width: 440px;
  width: 100%;
  box-shadow: 0 25px 70px rgba(5, 16, 38, 0.65);
}
.sand-modal-accent {
  position: absolute;
  inset: -25% -35%;
  background: radial-gradient(circle at top, rgba(0,173,239,0.35), transparent 60%),
    radial-gradient(circle at bottom right, rgba(248,211,76,0.22), transparent 55%);
  filter: blur(20px);
  z-index: 0;
  pointer-events: none;
}
.sand-modal-content {
  background: rgba(20,33,61,0.92);
  border-radius: 1.5rem;
  border: 1px solid rgba(34,51,91,0.8);
  padding: 1.75rem;
  max-width: 420px; width: 100%;
  color: #fff;
  position: relative;
  z-index: 1;
  overflow: hidden;
  font-family: 'Inter', 'Segoe UI', Arial, sans-serif;
  backdrop-filter: blur(12px);
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
  transition: color 0.18s, transform 0.18s;
}
.sand-modal-close:hover { color: #fff; transform: scale(1.08); }
.sand-modal-subtitle {
  color: #8fa2c7;
  margin-top: -0.4rem;
  margin-bottom: 1.2rem;
  font-size: 0.95rem;
}
.sand-modal-badges {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-bottom: 1.1rem;
}
.sand-modal-badge {
  padding: 0.3rem 0.75rem;
  border-radius: 999px;
  background: rgba(0,173,239,0.12);
  color: #4db6ff;
  font-size: 0.75rem;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  border: 1px solid rgba(0,173,239,0.25);
}
.sand-modal-amount-box {
  background: linear-gradient(145deg, rgba(26,37,64,0.95), rgba(20,33,61,0.9));
  border-radius: 1.1rem;
  padding: 1.2rem 1.1rem 1.15rem;
  margin-bottom: 0.9rem;
  border: 1px solid rgba(0,173,239,0.18);
  box-shadow: inset 0 0 0 1px rgba(0,173,239,0.08);
}
.sand-modal-amount {
  font-size: 2rem; font-weight: 600; color: #fff;
}
.sand-modal-usd { color: #8fa2c7; font-size: 0.95rem; margin-top: 0.25rem; }
.sand-modal-amount-details {
  display: flex;
  justify-content: space-between;
  margin-top: 0.9rem;
  gap: 0.75rem;
}
.sand-modal-amount-details-label {
  display: block;
  color: #8fa2c7;
  font-size: 0.72rem;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  margin-bottom: 0.2rem;
}
.sand-modal-amount-details-value {
  font-size: 0.93rem;
  color: #fff;
  font-weight: 500;
}
.sand-modal-status-pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.15rem 0.6rem;
  border-radius: 999px;
  background: rgba(0,173,239,0.18);
  color: #4db6ff;
  font-size: 0.8rem;
}
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
.sand-modal-divider {
  height: 1px;
  width: 100%;
  background: linear-gradient(90deg, rgba(0,173,239,0), rgba(0,173,239,0.65), rgba(0,173,239,0));
  margin: 1.35rem 0 1.1rem;
}
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
  box-shadow: 0 12px 24px rgba(0,173,239,0.28);
}
.sand-modal-btn.confirm:hover { background: #0096cc; transform: scale(1.03); }
.sand-modal-btn.confirm:focus-visible {
  outline: 2px solid rgba(248,211,76,0.5);
  outline-offset: 3px;
}
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
  cursor: pointer; transition: border-color .15s, transform .1s, box-shadow .15s;
}
.sand-wallet-btn:hover { transform: translateY(-2px); box-shadow: 0 10px 22px rgba(0,173,239,0.18); }
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
