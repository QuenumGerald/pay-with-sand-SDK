import React, { useState } from 'react';
import { payWithSand } from '../payWithSand';
import { useAccount } from 'wagmi';

export const SandSDKTest = () => {
  const [orderId, setOrderId] = useState('test-order-' + Date.now());
  const [amount, setAmount] = useState('1000000000000000000'); // 1 SAND
  const [recipient, setRecipient] = useState('0x...'); // Remplacez par une adresse de test
  const [isLoading, setIsLoading] = useState(false);
  const [txHash, setTxHash] = useState('');
  const [error, setError] = useState('');
  
  const { address, isConnected } = useAccount();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConnected) {
      setError('Veuillez connecter votre portefeuille');
      return;
    }

    setIsLoading(true);
    setError('');
    
    try {
      const hash = await payWithSand({
        orderId,
        amount,
        recipient: recipient || address!, // Utilise l'adresse connectée si aucun destinataire n'est spécifié
      });
      
      setTxHash(hash);
      console.log('Transaction hash:', hash);
    } catch (err: any) {
      console.error('Erreur:', err);
      setError(err.message || 'Une erreur est survenue');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      maxWidth: '500px',
      margin: '2rem auto',
      padding: '2rem',
      border: '1px solid #e2e8f0',
      borderRadius: '0.5rem',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
    }}>
      <h2>Test du SDK SAND</h2>
      
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '1rem' }}>
          <label>Order ID:</label>
          <input 
            type="text" 
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
            style={inputStyle}
          />
        </div>
        
        <div style={{ marginBottom: '1rem' }}>
          <label>Montant (en wei):</label>
          <input 
            type="text" 
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            style={inputStyle}
          />
        </div>
        
        <div style={{ marginBottom: '1rem' }}>
          <label>Destinataire (optionnel):</label>
          <input 
            type="text" 
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            placeholder="Si vide, utilise votre adresse connectée"
            style={inputStyle}
          />
        </div>
        
        <button 
          type="submit" 
          disabled={isLoading || !isConnected}
          style={{
            ...buttonStyle,
            opacity: (isLoading || !isConnected) ? 0.7 : 1,
            cursor: (isLoading || !isConnected) ? 'not-allowed' : 'pointer'
          }}
        >
          {isLoading ? 'Envoi en cours...' : 'Tester le paiement'}
        </button>
        
        {!isConnected && (
          <p style={{ color: '#e53e3e', marginTop: '1rem' }}>
            Veuillez connecter votre portefeuille pour continuer
          </p>
        )}
        
        {error && (
          <div style={{ marginTop: '1rem', color: '#e53e3e' }}>
            Erreur: {error}
          </div>
        )}
        
        {txHash && (
          <div style={{ marginTop: '1rem', wordBreak: 'break-all' }}>
            <p>Transaction envoyée avec succès !</p>
            <a 
              href={`https://sepolia.etherscan.io/tx/${txHash}`} 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ color: '#3182ce' }}
            >
              Voir sur Etherscan
            </a>
          </div>
        )}
      </form>
    </div>
  );
};

const inputStyle = {
  width: '100%',
  padding: '0.5rem',
  marginTop: '0.25rem',
  border: '1px solid #e2e8f0',
  borderRadius: '0.25rem'
};

const buttonStyle = {
  backgroundColor: '#00B3B0',
  color: 'white',
  padding: '0.75rem 1.5rem',
  border: 'none',
  borderRadius: '0.25rem',
  fontSize: '1rem',
  fontWeight: 'bold',
  cursor: 'pointer',
  marginTop: '1rem',
  width: '100%'
};
