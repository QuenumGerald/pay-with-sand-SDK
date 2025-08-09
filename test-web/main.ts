import { payWithSand } from '../src/payWithSand';
import type { PayArgs } from '../src/types';

function log(msg: any) {
  const el = document.getElementById('log')!;
  el.textContent = (el.textContent || '') + `\n${typeof msg === 'string' ? msg : JSON.stringify(msg, null, 2)}`;
}

async function onPay() {
  const amount = (document.getElementById('amount') as HTMLInputElement).value.trim();
  const orderId = (document.getElementById('orderId') as HTMLInputElement).value.trim();
  const recipient = (document.getElementById('recipient') as HTMLInputElement).value.trim();
  const deadlineStr = (document.getElementById('deadline') as HTMLInputElement)?.value.trim();
  const vStr = (document.getElementById('v') as HTMLInputElement)?.value.trim();
  const r = (document.getElementById('r') as HTMLInputElement)?.value.trim();
  const s = (document.getElementById('s') as HTMLInputElement)?.value.trim();

  const args: PayArgs = { amount, orderId, recipient };
  if (deadlineStr && vStr && r && s) {
    (args as any).deadline = Number(deadlineStr);
    (args as any).v = Number(vStr);
    (args as any).r = r;
    (args as any).s = s;
  }

  log('Envoi de la transaction...');
  try {
    const txHash = await payWithSand(args);
    log(`OK. Tx hash: ${txHash}`);
  } catch (e) {
    console.error(e);
    log(`Erreur: ${e}`);
  }
}

(document.getElementById('pay') as HTMLButtonElement).addEventListener('click', onPay);
