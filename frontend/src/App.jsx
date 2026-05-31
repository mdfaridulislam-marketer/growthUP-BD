// ══════════════════════════════════════════════════
// GrowthUp Pro — Main App
// Auth wrap করা হয়েছে — বাকি সব original HTML থেকে আসে
// ══════════════════════════════════════════════════
import { useState, useEffect } from 'react';
import { useAuth } from './hooks/useAuth';
import { useUsage } from './hooks/useUsage';
import LoginPage from './components/auth/LoginPage';
import RegisterPage from './components/auth/RegisterPage';
import PricingPage from './components/auth/PricingPage';
import UpgradeModal from './components/shared/UpgradeModal';

export default function App() {
  const { user, loading, login, register, logout } = useAuth();
  const { usage, refreshUsage } = useUsage(user);
  const [page, setPage] = useState('login'); // login | register
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [appReady, setAppReady] = useState(false);

  // User logged in হলে original app load করো
  useEffect(() => {
    if (user && !appReady) {
      setAppReady(true);
      // Original JS এর ANTHROPIC_API_KEY এর দরকার নেই এখন
      // Backend থেকে call হবে — window.GU_USER সেট করো
      window.GU_USER = {
        id:    user.id,
        email: user.email,
        plan:  usage?.plan || 'free',
      };
      window.GU_LOGOUT = logout;

      // Upgrade modal trigger
      window.GU_SHOW_UPGRADE = () => setShowUpgrade(true);
    }
  }, [user, appReady, usage, logout]);

  // Usage refresh করো generation এর পরে
  useEffect(() => {
    window.GU_REFRESH_USAGE = refreshUsage;
  }, [refreshUsage]);

  // Payment success check
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('payment') === 'success') {
      const plan = params.get('plan');
      alert(`🎉 Payment সফল! ${plan === 'pro' ? 'Pro' : 'Business'} Plan active হয়েছে।`);
      window.history.replaceState({}, '', '/');
      refreshUsage();
    }
  }, []);

  // ── Loading ──
  if (loading) {
    return (
      <div style={{
        minHeight: '100vh', background: '#1a1a1a',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{ color: '#F5C429', fontSize: '20px', fontWeight: '700' }}>
          GrowthUp Pro লোড হচ্ছে...
        </div>
      </div>
    );
  }

  // ── Not logged in ──
  if (!user) {
    if (page === 'register') {
      return (
        <RegisterPage
          onRegister={register}
          onGoLogin={() => setPage('login')}
        />
      );
    }
    return (
      <LoginPage
        onLogin={login}
        onGoRegister={() => setPage('register')}
      />
    );
  }

  // ── Logged in — Original App ──
  return (
    <>
      {/* Usage Bar */}
      {usage && usage.plan === 'free' && (
        <div style={{
          position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 1000,
          background: '#111', borderTop: '1px solid #2a2a2a',
          padding: '8px 20px', display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', fontSize: '12px',
        }}>
          <span style={{ color: '#888' }}>
            ব্যবহার: <strong style={{ color: '#F5C429' }}>{usage.used}/{usage.limit}</strong> generation এই মাসে
          </span>
          <button
            onClick={() => setShowUpgrade(true)}
            style={{
              background: '#F5C429', color: '#111', border: 'none',
              borderRadius: '6px', padding: '5px 14px', fontSize: '11px',
              fontWeight: '700', cursor: 'pointer',
            }}
          >
            Pro নিন → Unlimited
          </button>
        </div>
      )}

      {/* User Info Topbar Addon */}
      <div id="gu-user-bar" style={{ display: 'none' }} />

      {/* Upgrade Modal */}
      {showUpgrade && <UpgradeModal onClose={() => setShowUpgrade(false)} />}

      {/*
        Original GrowthUp HTML app এখানে inject হয়।
        GrowthUpApp component এ original HTML render হয়।
      */}
      <GrowthUpApp user={user} usage={usage} onLogout={logout} onShowUpgrade={() => setShowUpgrade(true)} />
    </>
  );
}

// ══════════════════════════════════════════════════
// GrowthUpApp — Original HTML app wrapper
// Original JS সব এখানে চলে, শুধু API call বদলে গেছে
// ══════════════════════════════════════════════════
function GrowthUpApp({ user, usage, onLogout, onShowUpgrade }) {
  useEffect(() => {
    // User info টপবারে দেখাও
    const topbarRight = document.querySelector('.app-topbar-right');
    if (topbarRight) {
      topbarRight.innerHTML = `
        <span style="font-size:12px;color:#888;margin-right:8px">
          ${usage?.plan === 'pro' ? '⭐ Pro' : usage?.plan === 'business' ? '💎 Business' : '🆓 Free'}
          • ${user.email}
        </span>
        <button id="gu-logout-btn" style="font-size:12px;padding:6px 14px;border-radius:7px;border:1px solid #333;background:#222;cursor:pointer;color:#ccc;font-weight:600;">
          Logout
        </button>
      `;
      document.getElementById('gu-logout-btn')?.addEventListener('click', onLogout);
    }
  }, [user, usage, onLogout]);

  // Original app এর API calls intercept করো
  useEffect(() => {
    // Original window.ANTHROPIC_API_KEY থেকে backend proxy তে redirect করো
    // এই function টা override করা হয় না — original runAI এর পরিবর্তে
    // backend থেকে call হবে (api.js এ generateStream)
    // Original HTML এর runAI function টা backend call করবে
    // কারণ index.html এ original script load হওয়ার পরে
    // window.GU_BACKEND_URL set থাকলে সে সেটা use করবে

    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';
    window.GU_BACKEND_URL = backendUrl;

    // Upgrade trigger
    window.GU_SHOW_UPGRADE = onShowUpgrade;

  }, [onShowUpgrade]);

  return null; // Original app HTML এ already render হয়ে আছে
}
