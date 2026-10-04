import React, { useState } from 'react';
import { Modal } from './Modal';
import { Lock, Unlock, AlertCircle, RefreshCw } from 'lucide-react';
import { loginWithSecret } from '../../services/analysisApiClient';

interface AuthUnlockModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthenticated: () => void;
}

export const AuthUnlockModal: React.FC<AuthUnlockModalProps> = ({
  isOpen,
  onClose,
  onAuthenticated
}) => {
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      setError('Please enter the server AUDIT_SECRET passphrase.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const result = await loginWithSecret(password.trim());
    setIsSubmitting(false);

    if (result.success) {
      setPassword('');
      onAuthenticated();
      onClose();
    } else {
      setError(result.error || 'Authentication failed. Please check your credentials.');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Platform Security Unlock" maxWidth="480px">
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '8px',
              backgroundColor: 'rgba(56, 189, 248, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent-primary)',
              flexShrink: 0
            }}
          >
            <Lock size={20} />
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>Production Access Control</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Enter your server passphrase to establish a secure HttpOnly session
            </div>
          </div>
        </div>

        {error && (
          <div
            className="card badge-rose"
            style={{ padding: '10px 14px', display: 'flex', alignItems: 'center', gap: '8px', textTransform: 'none' }}
          >
            <AlertCircle size={16} />
            <span style={{ fontSize: '0.84rem' }}>{error}</span>
          </div>
        )}

        <div>
          <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px', color: 'var(--text-secondary)' }}>
            Server Secret / Passphrase
          </label>
          <input
            type="password"
            className="input"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Enter AUDIT_SECRET..."
            style={{ width: '100%' }}
            autoFocus
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
          <button type="button" className="btn btn-secondary btn-sm" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary btn-sm" disabled={isSubmitting}>
            {isSubmitting ? <RefreshCw className="spin" size={14} /> : <Unlock size={14} />}
            {isSubmitting ? 'Authenticating...' : 'Unlock Platform'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
