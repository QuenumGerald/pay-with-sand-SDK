import { payWithSand } from './src/payWithSand';
import type { PayArgs } from './src/types';

async function testPayWithSand() {
  const args: PayArgs = {
    amount: '1000000000000000000', // 1 SAND en wei (18 décimales)
    orderId: 'TEST-ORDER-001',
    recipient: '0xVotreAdresseEthereumIci'
    // Ajoutez ici les champs permit si vous voulez tester le flow EIP-2612
  };

  try {
    const txHash = await payWithSand(args);
    console.log('Transaction envoyée ! Hash:', txHash);
  } catch (err) {
    console.error('Erreur lors du paiement :', err);
  }
}

testPayWithSand();
