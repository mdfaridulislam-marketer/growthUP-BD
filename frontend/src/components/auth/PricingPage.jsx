// ══════════════════════════════════════════════════
// Pricing Page
// ══════════════════════════════════════════════════
import { useState } from 'react';
import { initPayment } from '../../lib/api';

export default function PricingPage({ currentPlan = 'free' }) {
  const [loading, setLoading] = useState(null);

  const handleUpgrade = async (plan) => {
    setLoading(plan);
    try {
      const { url, error } = await initPayment(plan);
      if (error) throw new Error(error);
      window.location.href = url;
    } catch (err) {
      alert('Payment শুরু করতে সমস্যা: ' + err.message);
      setLoading(null);
    }
  };

  const plans = [
    {
      key: 'free',
      name: 'Free',
      price: '০ টাকা',
      sub: 'চিরকাল বিনামূল্যে',
      color: '#888',
      features: [
        '১০ AI generation / মাস',
        'সব Section access',
        'কোনো credit card নেই',
      ],
    },
    {
      key: 'pro',
      name: 'Pro ⭐',
      price: '৳৪৯৯/মাস',
      sub: 'সবচেয়ে জনপ্রিয়',
      color: '#F5C429',
      featured: true,
      features: [
        'Unlimited AI generation',
        'সব Section access',
        'SSLCommerz / bKash payment',
        'Priority support',
      ],
    },
    {
      key: 'business',
      name: 'Business',
      price: '৳৯৯৯/মাস',
      sub: 'Agency ও বড় ব্যবসার জন্য',
      color: '#7c3aed',
      features: [
        'Unlimited AI generation',
        '৩ Team member',
        'সব Pro features',
        'Dedicated support',
      ],
    },
  ];

  return (
    <div style={{ padding: '24px', maxWidth: '860px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#1a1a1a', marginBottom: '8px' }}>
          আপনার Plan বেছে নিন
        </h2>
        <p style={{ fontSize: '14px', color: '#666' }}>
          bKash, Nagad, Rocket, সব bank card দিয়ে payment করুন
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
        {plans.map(plan => (
          <div
            key={plan.key}
            style={{
              background: '#fff',
              border: `2px solid ${plan.featured ? '#F5C429' : '#e8e8e0'}`,
              borderRadius: '16px',
              padding: '24px',
              position: 'relative',
              boxShadow: plan.featured ? '0 8px 32px rgba(245,196,41,0.2)' : 'none',
            }}
          >
            {plan.featured && (
              <div style={{
                position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)',
                background: '#F5C429', color: '#111', fontSize: '11px', fontWeight: '800',
                padding: '4px 16px', borderRadius: '99px', whiteSpace: 'nowrap',
              }}>
                সবচেয়ে জনপ্রিয় 🔥
              </div>
            )}

            <div style={{ fontSize: '16px', fontWeight: '800', color: '#111', marginBottom: '4px' }}>
              {plan.name}
            </div>
            <div style={{ fontSize: '11px', color: '#888', marginBottom: '16px' }}>{plan.sub}</div>

            <div style={{ fontSize: '26px', fontWeight: '800', color: plan.color, marginBottom: '20px' }}>
              {plan.price}
            </div>

            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px', fontSize: '13px', color: '#333' }}>
              {plan.features.map(f => (
                <li key={f} style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ color: '#27ae60', fontWeight: '700' }}>✓</span> {f}
                </li>
              ))}
            </ul>

            {currentPlan === plan.key ? (
              <div style={{
                width: '100%', padding: '12px', background: '#f5f5ef', color: '#888',
                borderRadius: '10px', fontSize: '13px', fontWeight: '700', textAlign: 'center',
              }}>
                ✓ বর্তমান Plan
              </div>
            ) : plan.key === 'free' ? (
              <div style={{
                width: '100%', padding: '12px', background: '#f5f5ef', color: '#666',
                borderRadius: '10px', fontSize: '13px', fontWeight: '600', textAlign: 'center',
              }}>
                Free Plan
              </div>
            ) : (
              <button
                onClick={() => handleUpgrade(plan.key)}
                disabled={loading === plan.key}
                style={{
                  width: '100%', padding: '13px',
                  background: plan.featured ? '#F5C429' : plan.color,
                  color: '#111', border: 'none', borderRadius: '10px',
                  fontSize: '13px', fontWeight: '700', cursor: 'pointer',
                  opacity: loading === plan.key ? 0.7 : 1,
                }}
              >
                {loading === plan.key ? 'Redirect হচ্ছে...' : `${plan.name} নিন →`}
              </button>
            )}
          </div>
        ))}
      </div>

      <div style={{
        marginTop: '24px', background: '#fffbeb', border: '1px solid #fcd34d',
        borderRadius: '12px', padding: '16px', fontSize: '13px', color: '#92400e',
        textAlign: 'center',
      }}>
        💳 SSLCommerz এর মাধ্যমে নিরাপদ payment • bKash • Nagad • Rocket • সব bank card
      </div>
    </div>
  );
}
