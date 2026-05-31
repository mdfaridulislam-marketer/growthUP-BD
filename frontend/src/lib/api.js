// ══════════════════════════════════════════════════
// API Helper — Backend এ সব request পাঠায়
// Anthropic API Key এখন backend এ — নিরাপদ!
// ══════════════════════════════════════════════════
import { supabase } from './supabase';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

// ── JWT Token নাও ──
async function getToken() {
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token || null;
}

// ── Authorization header ──
async function authHeaders() {
  const token = await getToken();
  if (!token) throw new Error('লগইন করুন');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };
}

// ══════════════════════════════════════════════════
// generateStream — Streaming AI generation
// onChunk: প্রতিটি text chunk পেলে call হবে
// onDone: generation শেষে call হবে
// ══════════════════════════════════════════════════
export async function generateStream({ prompt, section, maxTokens, onChunk, onDone, onError }) {
  try {
    const headers = await authHeaders();

    const res = await fetch(`${BACKEND_URL}/api/generate`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ prompt, section, maxTokens }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));

      // Limit exceeded → upgrade prompt
      if (res.status === 429 && err.error === 'limit_exceeded') {
        onError?.({
          type: 'limit_exceeded',
          plan: err.plan,
          message: err.message,
        });
        return;
      }

      throw new Error(err.error || `Error ${res.status}`);
    }

    // Server-Sent Events পড়ো
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6).trim();
          if (data === '[DONE]') {
            onDone?.();
            return;
          }
          try {
            const json = JSON.parse(data);
            if (json.text)  onChunk?.(json.text);
            if (json.error) onError?.({ message: json.error });
          } catch {
            // ignore parse errors
          }
        }
      }
    }

    onDone?.();
  } catch (err) {
    onError?.({ message: err.message });
  }
}

// ══════════════════════════════════════════════════
// generateJSON — Non-streaming (product details এর জন্য)
// ══════════════════════════════════════════════════
export async function generateJSON({ prompt, maxTokens }) {
  const headers = await authHeaders();

  const res = await fetch(`${BACKEND_URL}/api/generate/json`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ prompt, maxTokens }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Error');
  return data.data;
}

// ── Usage info নাও ──
export async function getUsage() {
  const headers = await authHeaders();
  const res = await fetch(`${BACKEND_URL}/api/usage`, { headers });
  return res.json();
}

// ── Current user info ──
export async function getMe() {
  const headers = await authHeaders();
  const res = await fetch(`${BACKEND_URL}/api/me`, { headers });
  return res.json();
}

// ── Payment শুরু করো ──
export async function initPayment(plan) {
  const headers = await authHeaders();
  const res = await fetch(`${BACKEND_URL}/api/payment/init`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ plan }),
  });
  return res.json();
}
