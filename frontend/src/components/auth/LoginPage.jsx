// ══════════════════════════════════════════════════
// Login Page
// ══════════════════════════════════════════════════
import { useState } from 'react';

export default function LoginPage({ onLogin, onGoRegister }) {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  const handleSubmit = async () => {
    if (!email || !password) { setError('Email ও Password দিন'); return; }
    setLoading(true);
    setError('');
    try {
      await onLogin(email, password);
    } catch (err) {
      setError(err.message || 'Login সমস্যা হয়েছে');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', background: '#1a1a1a', display: 'flex',
      alignItems: 'center', justifyContent: 'center', padding: '20px',
    }}>
      <div style={{
        background: '#fff', borderRadius: '16px', padding: '36px',
        width: '100%', maxWidth: '400px',
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '28px' }}>
          <div style={{
            width: '40px', height: '40px', background: '#F5C429', borderRadius: '10px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '20px', fontWeight: '900', color: '#111',
          }}>G</div>
          <div>
            <div style={{ fontWeight: '700', fontSize: '16px', color: '#111' }}>
              GrowthUp <span style={{ color: '#F5C429' }}>Pro</span>
            </div>
            <div style={{ fontSize: '11px', color: '#888' }}>Copywriting AI</div>
          </div>
        </div>

        <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#111', marginBottom: '6px' }}>
          লগইন করুন
        </h2>
        <p style={{ fontSize: '13px', color: '#888', marginBottom: '24px' }}>
          আপনার account এ প্রবেশ করুন
        </p>

        {error && (
          <div style={{
            background: '#fee', color: '#c0392b', padding: '10px 14px',
            borderRadius: '8px', fontSize: '13px', marginBottom: '16px',
            border: '1px solid #fcc',
          }}>{error}</div>
        )}

        <div style={{ marginBottom: '14px' }}>
          <label style={{ fontSize: '12px', fontWeight: '600', color: '#444', display: 'block', marginBottom: '6px' }}>
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            placeholder="আপনার email"
            style={{
              width: '100%', padding: '11px 13px', border: '1.5px solid #e0e0d8',
              borderRadius: '10px', fontSize: '13px', outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ fontSize: '12px', fontWeight: '600', color: '#444', display: 'block', marginBottom: '6px' }}>
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            placeholder="আপনার password"
            style={{
              width: '100%', padding: '11px 13px', border: '1.5px solid #e0e0d8',
              borderRadius: '10px', fontSize: '13px', outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{
            width: '100%', padding: '13px', background: '#F5C429', color: '#111',
            border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: '700',
            cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? 'লগইন হচ্ছে...' : 'লগইন করুন →'}
        </button>

        <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '13px', color: '#888' }}>
          Account নেই?{' '}
          <span
            onClick={onGoRegister}
            style={{ color: '#F5C429', fontWeight: '700', cursor: 'pointer' }}
          >
            Register করুন
          </span>
        </div>
      </div>
    </div>
  );
}
