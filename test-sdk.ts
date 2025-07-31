import { payWithSand } from './sandmodal-demo/src/payWithSand.ts';

const args = {
  amount: '1000000000000000000', // 1 SAND en wei
  orderId: 'TEST-ORDER-001',
  recipient: '0x1234567890abcdef1234567890abcdef12345678',
  // deadline, v, r, s peuvent être ajoutés ici si besoin
};

(async () => {
  try {
    const txHash = await payWithSand(args);
    console.log('Transaction envoyée ! Hash:', txHash);
  } catch (err) {
    console.error('Erreur SDK:', err);
  }
})();
