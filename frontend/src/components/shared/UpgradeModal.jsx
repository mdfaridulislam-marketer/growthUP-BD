// ══════════════════════════════════════════════════
// Upgrade Modal — Free limit পার হলে দেখায়
// ══════════════════════════════════════════════════
import { initPayment } from '../../lib/api';
import { useState } from 'react';

export default function UpgradeModal({ onClose }) {
  const [loading, setLoading] = useState(null);

  const handleUpgrade = async (plan) => {
    setLoading(plan);
    try {
      const { url } = await initPayment(plan);
      window.location.href = url;
    } catch (err) {
      alert('সমস্যা: ' + err.message);
      setLoading(null);
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
      zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px',
    }}>
      <div style={{
        background: '#fff', borderRadius: '20px', width: '100%', maxWidth: '440px',
        padding: '32px', textAlign: 'center',
      }}>
        <div style={{ fontSize: '48px', marginBottom: '12px' }}>🚀</div>
        <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#111', marginBottom: '8px' }}>
          Free Limit শেষ!
        </h2>
        <p style={{ fontSize: '13px', color: '#666', marginBottom: '24px', lineHeight: '1.6' }}>
          এই মাসে ১০টি Free generation শেষ হয়েছে।<br />
          Pro Plan নিয়ে Unlimited ব্যবহার করুন।
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
          <button
            onClick={() => handleUpgrade('pro')}
            disabled={!!loading}
            style={{
              padding: '16px', background: '#F5C429', color: '#111', border: 'none',
              borderRadius: '12px', cursor: 'pointer', fontWeight: '800',
            }}
          >
            <div style={{ fontSize: '16px', marginBottom: '4px' }}>Pro Plan</div>
            <div style={{ fontSize: '20px', fontWeight: '900' }}>৳৪৯৯</div>
            <div style={{ fontSize: '11px', opacity: 0.7 }}>/মাস • Unlimited</div>
          </button>
          <button
            onClick={() => handleUpgrade('business')}
            disabled={!!loading}
            style={{
              padding: '16px', background: '#1a1a1a', color: '#fff', border: 'none',
              borderRadius: '12px', cursor: 'pointer', fontWeight: '800',
            }}
          >
            <div style={{ fontSize: '16px', marginBottom: '4px' }}>Business</div>
            <div style={{ fontSize: '20px', fontWeight: '900' }}>৳৯৯৯</div>
            <div style={{ fontSize: '11px', opacity: 0.6 }}>/মাস • ৩ User</div>
          </button>
        </div>

        <button
          onClick={onClose}
          style={{
            background: 'none', border: 'none', color: '#888',
            fontSize: '13px', cursor: 'pointer', padding: '8px',
          }}
        >
          এখন নয়
        </button>
      </div>
    </div>
  );
}
