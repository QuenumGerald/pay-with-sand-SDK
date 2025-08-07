import React, { useState, useEffect } from 'react';
import { payWithPrivateKey, getBalance, getAddressFromPrivateKey } from '../utils/privateKeyProvider';

export const PrivateKeyExample = () => {
  const [amount, setAmount] = useState('1000000000000000000'); // 1 SAND
  const [recipient, setRecipient] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [txHash, setTxHash] = useState('');
  const [error, setError] = useState('');
  const [senderAddress, setSenderAddress] = useState('');
  const [senderBalance, setSenderBalance] = useState('0');
  const [network, setNetwork] = useState('sepolia');

  // Récupérer l'adresse du compte au chargement
  useEffect(() => {
    try {
      const address = getAddressFromPrivateKey();
      setSenderAddress(address);
      updateBalance(address);
    } catch (err: any) {
      setError(err.message);
    }
  }, []);

  const updateBalance = async (address: string) => {
    try {
      const balance = await getBalance(address, network);
      setSenderBalance(balance);
    } catch (err: any) {
      console.error('Error fetching balance:', err);
    }
  };

  const handlePayment = async () => {
    if (!recipient && !senderAddress) {
      setError('Veuillez spécifier un destinataire');
      return;
    }

    setStatus('sending');
    setError('');

    try {
      const orderId = `ORDER-${Date.now()}`;
      const hash = await payWithPrivateKey(
        orderId,
        amount,
        recipient || senderAddress, // Utiliser l'adresse de l'expéditeur si aucun destinataire n'est spécifié
        network
      );
      
      setTxHash(hash);
      setStatus('success');
      
      // Mettre à jour le solde après la transaction
      await updateBalance(senderAddress);
    } catch (err: any) {
      console.error('Payment error:', err);
      setError(err.message || 'Une erreur est survenue');
      setStatus('error');
    }
  };

  return (
    <div style={containerStyle}>
      <h2>Test avec clé privée</h2>
      
      <div style={infoBox}>
        <p><strong>Compte:</strong> {senderAddress || 'Non disponible'}</p>
        <p><strong>Solde:</strong> {parseFloat(senderBalance).toFixed(4)} ETH</p>
      </div>
      
      <div style={formGroup}>
        <label>Réseau:</label>
        <select 
          value={network}
          onChange={(e) => setNetwork(e.target.value)}
          style={inputStyle}
        >
          <option value="sepolia">Sepolia (Testnet)</option>
          {/* Ajoutez d'autres réseaux si nécessaire */}
        </select>
      </div>
      
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
          placeholder="Laissez vide pour vous envoyer à vous-même"
        />
      </div>

      <button
        onClick={handlePayment}
        disabled={status === 'sending' || !senderAddress}
        style={{
          ...buttonStyle,
          opacity: (status === 'sending' || !senderAddress) ? 0.7 : 1,
          cursor: (status === 'sending' || !senderAddress) ? 'not-allowed' : 'pointer'
        }}
      >
        {status === 'sending' ? 'Envoi en cours...' : 'Effectuer un paiement'}
      </button>

      {error && (
        <div style={{ ...messageStyle, backgroundColor: '#fee2e2', color: '#b91c1c', marginTop: '1rem' }}>
          Erreur: {error}
        </div>
      )}

      {status === 'success' && txHash && (
        <div style={messageStyle}>
          <p>Paiement réussi !</p>
          <a 
            href={`https://${network}.etherscan.io/tx/${txHash}`}
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

const infoBox = {
  backgroundColor: '#f8fafc',
  padding: '1rem',
  borderRadius: '0.5rem',
  marginBottom: '1rem',
  border: '1px solid #e2e8f0',
  fontSize: '0.9rem',
  wordBreak: 'break-all' as const
};

const formGroup = {
  marginBottom: '1rem'
};

const inputStyle = {
  width: '100%',
  padding: '0.5rem',
  marginTop: '0.25rem',
  border: '1px solid #e2e8f0',
  borderRadius: '0.25rem',
  backgroundColor: '#fff'
};

const buttonStyle = {
  backgroundColor: '#00B3B0',
  color: 'white',
  padding: '0.75rem 1.5rem',
  border: 'none',
  borderRadius: '0.25rem',
  fontSize: '1rem',
  fontWeight: 'bold' as const,
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
