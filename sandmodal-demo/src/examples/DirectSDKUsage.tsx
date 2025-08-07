import React, { useState } from 'react';
import { payWithSand } from '../payWithSand';
import { useAccount } from 'wagmi';

type PaymentStatus = 'idle' | 'sending' | 'success' | 'error';

export const DirectSDKUsage = () => {
  const { address, isConnected } = useAccount();
  const [amount, setAmount] = useState('1000000000000000000'); // 1 SAND
  const [recipient, setRecipient] = useState('');
  const [status, setStatus] = useState<PaymentStatus>('idle');
  const [txHash, setTxHash] = useState('');
  const [error, setError] = useState('');

  const handlePayment = async () => {
    if (!isConnected || !address) {
      setError('Veuillez connecter votre portefeuille');
      return;
    }

    setStatus('sending');
    setError('');

    try {
      const hash = await payWithSand({
        orderId: `ORDER-${Date.now()}`,
        amount,
        recipient: recipient || address, // Utilise l'adresse connectée si aucun destinataire n'est spécifié
      });
      
      setTxHash(hash);
      setStatus('success');
      console.log('Transaction hash:', hash);
    } catch (err: any) {
      console.error('Erreur de paiement:', err);
      setError(err.message || 'Une erreur est survenue');
      setStatus('error');
    }
  };

  return (
    <div style={containerStyle}>
      <h2>Utilisation directe du SDK SAND</h2>
      
      <div style={formGroup}>
        <label>Montant (en wei):</label>
        <input
          type="text"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          style={inputStyle}
          placeholder="1000000000000000000 (1 SAND)"
        />
      </div>
      
      <div style={formGroup}>
        <label>Destinataire (optionnel):</label>
        <input
          type="text"
          value={recipient}
          onChange={(e) => setRecipient(e.target.value)}
          style={inputStyle}
          placeholder={`${address?.substring(0, 6)}... (votre adresse)`}
        />
      </div>

      <button
        onClick={handlePayment}
        disabled={status === 'sending' || !isConnected}
        style={{
          ...buttonStyle,
          opacity: (status === 'sending' || !isConnected) ? 0.7 : 1,
          cursor: (status === 'sending' || !isConnected) ? 'not-allowed' : 'pointer'
        }}
      >
        {status === 'sending' ? 'Envoi en cours...' : 'Effectuer un paiement'}
      </button>

      {!isConnected && (
        <p style={{ color: '#e53e3e', marginTop: '1rem' }}>
          Veuillez connecter votre portefeuille pour continuer
        </p>
      )}

      {error && (
        <div style={{ ...messageStyle, color: '#e53e3e' }}>
          Erreur: {error}
        </div>
      )}

      {status === 'success' && txHash && (
        <div style={messageStyle}>
          <p>Paiement réussi !</p>
          <a 
            href={`https://sepolia.etherscan.io/tx/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: '#3182ce' }}
          >
            Voir la transaction sur Etherscan
          </a>
        </div>
      )}
    </div>
  );
};

// Styles
const containerStyle = {
  maxWidth: '500px',
  margin: '2rem auto',
  padding: '2rem',
  border: '1px solid #e2e8f0',
  borderRadius: '0.5rem',
  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
};

const formGroup = {
  marginBottom: '1rem'
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

const messageStyle = {
  marginTop: '1rem',
  padding: '0.75rem',
  borderRadius: '0.25rem',
  backgroundColor: '#f0fff4',
  color: '#2f855a',
  textAlign: 'center' as const
};
