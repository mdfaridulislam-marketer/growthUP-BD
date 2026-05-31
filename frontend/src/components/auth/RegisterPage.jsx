// ══════════════════════════════════════════════════
// Register Page
// ══════════════════════════════════════════════════
import { useState } from 'react';

export default function RegisterPage({ onRegister, onGoLogin }) {
  const [name, setName]         = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [done, setDone]         = useState(false);

  const handleSubmit = async () => {
    if (!name || !email || !password) { setError('সব তথ্য দিন'); return; }
    if (password.length < 6) { setError('Password কমপক্ষে ৬ অক্ষর হতে হবে'); return; }
    setLoading(true); setError('');
    try {
      await onRegister(email, password, name);
      setDone(true);
    } catch (err) {
      setError(err.message || 'Register সমস্যা হয়েছে');
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div style={{
        minHeight: '100vh', background: '#1a1a1a', display: 'flex',
        alignItems: 'center', justifyContent: 'center', padding: '20px',
      }}>
        <div style={{
          background: '#fff', borderRadius: '16px', padding: '36px',
          width: '100%', maxWidth: '400px', textAlign: 'center',
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>✅</div>
          <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '10px' }}>
            Registration সফল!
          </h2>
          <p style={{ fontSize: '13px', color: '#666', marginBottom: '24px' }}>
            আপনার email verify করুন অথবা সরাসরি লগইন করুন।
          </p>
          <button
            onClick={onGoLogin}
            style={{
              padding: '12px 28px', background: '#F5C429', color: '#111',
              border: 'none', borderRadius: '10px', fontSize: '14px',
              fontWeight: '700', cursor: 'pointer',
            }}
          >
            লগইন পেজে যান →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh', background: '#1a1a1a', display: 'flex',
      alignItems: 'center', justifyContent: 'center', padding: '20px',
    }}>
      <div style={{
        background: '#fff', borderRadius: '16px', padding: '36px',
        width: '100%', maxWidth: '400px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '28px' }}>
          <div style={{
            width: '40px', height: '40px', background: '#F5C429', borderRadius: '10px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '20px', fontWeight: '900', color: '#111',
          }}>G</div>
          <div>
            <div style={{ fontWeight: '700', fontSize: '16px' }}>
              GrowthUp <span style={{ color: '#F5C429' }}>Pro</span>
            </div>
            <div style={{ fontSize: '11px', color: '#888' }}>Copywriting AI</div>
          </div>
        </div>

        <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '6px' }}>
          নতুন Account তৈরি করুন
        </h2>
        <p style={{ fontSize: '13px', color: '#888', marginBottom: '24px' }}>
          ফ্রি শুরু করুন — কোনো credit card নেই
        </p>

        {error && (
          <div style={{
            background: '#fee', color: '#c0392b', padding: '10px 14px',
            borderRadius: '8px', fontSize: '13px', marginBottom: '16px',
            border: '1px solid #fcc',
          }}>{error}</div>
        )}

        {[
          { label: 'আপনার নাম', value: name, set: setName, type: 'text', placeholder: 'যেমন: রাহেলা বেগম' },
          { label: 'Email', value: email, set: setEmail, type: 'email', placeholder: 'আপনার email' },
          { label: 'Password', value: password, set: setPassword, type: 'password', placeholder: 'কমপক্ষে ৬ অক্ষর' },
        ].map(({ label, value, set, type, placeholder }) => (
          <div key={label} style={{ marginBottom: '14px' }}>
            <label style={{ fontSize: '12px', fontWeight: '600', color: '#444', display: 'block', marginBottom: '6px' }}>
              {label}
            </label>
            <input
              type={type}
              value={value}
              onChange={e => set(e.target.value)}
              placeholder={placeholder}
              style={{
                width: '100%', padding: '11px 13px', border: '1.5px solid #e0e0d8',
                borderRadius: '10px', fontSize: '13px', outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>
        ))}

        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{
            width: '100%', padding: '13px', background: '#F5C429', color: '#111',
            border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: '700',
            cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1,
            marginTop: '6px',
          }}
        >
          {loading ? 'তৈরি হচ্ছে...' : 'ফ্রি Account তৈরি করুন →'}
        </button>

        <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '13px', color: '#888' }}>
          Account আছে?{' '}
          <span
            onClick={onGoLogin}
            style={{ color: '#F5C429', fontWeight: '700', cursor: 'pointer' }}
          >
            লগইন করুন
          </span>
        </div>
      </div>
    </div>
  );
}
