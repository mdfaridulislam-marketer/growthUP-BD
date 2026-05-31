import React from 'react';
import { createRoot } from 'react-dom/client';
import { useAuth } from './hooks/useAuth';
import LoginPage from './components/auth/LoginPage';
import RegisterPage from './components/auth/RegisterPage';
import UpgradeModal from './components/shared/UpgradeModal';
import { getUsage, generateStream, generateJSON } from './lib/api';
import { supabase } from './lib/supabase';

// ══════════════════════════════════════════════════
// GrowthUp Pro — React Entry Point
//
// কীভাবে কাজ করে:
// 1. React Auth Layer: Login/Register/Usage UI
// 2. Original HTML app: original JS সহ চলে
// 3. Original runAI() → backend proxy → Claude API
// ══════════════════════════════════════════════════

function AuthWrapper({ children }) {
  const { user, loading, login, register, logout } = useAuth();
  const [page, setPage] = React.useState('login');
  const [usage, setUsage] = React.useState(null);
  const [showUpgrade, setShowUpgrade] = React.useState(false);

  // Usage load করো
  React.useEffect(() => {
    if (!user) return;
    getUsage().then(setUsage).catch(() => {});
  }, [user]);

  // Global functions expose করো original JS এর জন্য
  React.useEffect(() => {
    if (!user) return;

    window.GU_USER = user;
    window.GU_PLAN = usage?.plan || 'free';
    window.GU_USAGE = usage;
    window.GU_SHOW_UPGRADE = () => setShowUpgrade(true);
    window.GU_LOGOUT = logout;
    window.GU_REFRESH_USAGE = () => getUsage().then(setUsage).catch(() => {});

    // ── CRITICAL: runAI কে backend proxy তে redirect করো ──
    // Original HTML এর runAI function override করো
    window.GU_GENERATE_STREAM = generateStream;
    window.GU_GENERATE_JSON   = generateJSON;
    window.GU_GET_TOKEN       = async () => {
      const { data } = await supabase.auth.getSession();
      return data.session?.access_token || null;
    };

    // Topbar update
    const topbarRight = document.querySelector('.app-topbar-right');
    if (topbarRight) {
      const planLabel = usage?.plan === 'pro' ? '⭐ Pro' : usage?.plan === 'business' ? '💎 Business' : '🆓 Free';
      topbarRight.innerHTML = `
        <span style="font-size:12px;color:#aaa;margin-right:10px">${planLabel} • ${user.email}</span>
        <button id="gu-upgrade-btn" style="font-size:11px;padding:5px 12px;border-radius:7px;border:1px solid #F5C429;background:transparent;cursor:pointer;color:#F5C429;font-weight:700;display:${usage?.plan === 'free' ? 'inline-block' : 'none'}">
          Upgrade →
        </button>
        <button id="gu-logout-btn" style="font-size:11px;padding:5px 12px;border-radius:7px;border:1px solid #444;background:#222;cursor:pointer;color:#ccc;font-weight:600;margin-left:6px">
          Logout
        </button>
      `;
      document.getElementById('gu-logout-btn')?.addEventListener('click', logout);
      document.getElementById('gu-upgrade-btn')?.addEventListener('click', () => setShowUpgrade(true));
    }
  }, [user, usage, logout]);

  // ── Loading ──
  if (loading) {
    return (
      <div style={{
        minHeight: '100vh', background: '#1a1a1a',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{ color: '#F5C429', fontSize: '18px', fontWeight: '700' }}>লোড হচ্ছে...</div>
      </div>
    );
  }

  // ── Not logged in ──
  if (!user) {
    // Original app hide করো
    document.querySelector('.app-topbar') && (document.querySelector('.app-topbar').style.display = 'none');
    document.querySelector('.app') && (document.querySelector('.app').style.display = 'none');
    document.getElementById('api-key-modal') && (document.getElementById('api-key-modal').style.display = 'none');

    if (page === 'register') {
      return <RegisterPage onRegister={register} onGoLogin={() => setPage('login')} />;
    }
    return <LoginPage onLogin={login} onGoRegister={() => setPage('register')} />;
  }

  // ── Logged in — show original app ──
  document.querySelector('.app-topbar') && (document.querySelector('.app-topbar').style.display = 'flex');
  document.querySelector('.app') && (document.querySelector('.app').style.display = 'flex');
  // API Key modal কখনো দেখাবে না (backend এ key আছে)
  document.getElementById('api-key-modal') && (document.getElementById('api-key-modal').style.display = 'none');

  return (
    <>
      {/* Usage indicator for free users */}
      {usage?.plan === 'free' && (
        <div style={{
          position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 999,
          background: '#111827', borderTop: '1px solid #1f2937',
          padding: '8px 20px', display: 'flex', alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <span style={{ fontSize: '12px', color: '#9ca3af' }}>
            এই মাসে:{' '}
            <strong style={{ color: '#F5C429' }}>{usage.used}/{usage.limit}</strong>
            {' '}generation ব্যবহার হয়েছে
          </span>
          <button
            onClick={() => setShowUpgrade(true)}
            style={{
              background: '#F5C429', color: '#111', border: 'none',
              borderRadius: '6px', padding: '5px 14px', fontSize: '11px',
              fontWeight: '700', cursor: 'pointer',
            }}
          >
            Pro নিন → Unlimited 🚀
          </button>
        </div>
      )}

      {showUpgrade && <UpgradeModal onClose={() => setShowUpgrade(false)} />}
    </>
  );
}

// ══════════════════════════════════════════════════
// React root → auth UI overlay করে
// Original app এর DOM এ inject করে
// ══════════════════════════════════════════════════
const reactRoot = document.createElement('div');
reactRoot.id = 'react-root';
document.body.appendChild(reactRoot);

createRoot(reactRoot).render(<AuthWrapper />);
