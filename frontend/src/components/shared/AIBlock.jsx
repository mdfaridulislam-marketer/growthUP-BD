// ══════════════════════════════════════════════════
// AIBlock — Reusable AI Generation Component
// প্রতিটি section এ এটা ব্যবহার করা হয়
// ══════════════════════════════════════════════════
import { useState } from 'react';
import { generateStream } from '../../lib/api';

export default function AIBlock({
  btnId,
  label = 'AI দিয়ে তৈরি করুন',
  getPrompt,        // () => prompt string
  section,          // section name (usage tracking এর জন্য)
  maxTokens,
  onDone,           // generation শেষে callback
  onLimitExceeded,  // limit পার হলে callback
}) {
  const [loading, setLoading]   = useState(false);
  const [result, setResult]     = useState('');
  const [copied, setCopied]     = useState(false);
  const [error, setError]       = useState('');

  const handleGenerate = async () => {
    const prompt = getPrompt?.();
    if (!prompt) { setError('আগে পণ্যের তথ্য দিন'); return; }

    setLoading(true);
    setResult('');
    setError('');
    let text = '';

    await generateStream({
      prompt,
      section,
      maxTokens,
      onChunk: (chunk) => {
        text += chunk;
        setResult(text);
      },
      onDone: () => {
        setLoading(false);
        onDone?.(text);
      },
      onError: (err) => {
        setLoading(false);
        if (err.type === 'limit_exceeded') {
          onLimitExceeded?.(err);
          setError(err.message || 'Generation limit শেষ হয়েছে। Pro Plan নিন।');
        } else {
          setError(err.message || 'সমস্যা হয়েছে');
        }
      },
    });
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(result).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleSave = () => {
    try {
      const saved = JSON.parse(localStorage.getItem('gu_saved') || '[]');
      saved.push({ label, text: result, date: new Date().toLocaleString('bn-BD') });
      localStorage.setItem('gu_saved', JSON.stringify(saved.slice(-50)));
      alert('✅ সংরক্ষণ হয়েছে! Saved Outputs এ দেখুন।');
    } catch {
      alert('সংরক্ষণ সমস্যা হয়েছে');
    }
  };

  return (
    <div>
      <button
        id={btnId}
        onClick={handleGenerate}
        disabled={loading}
        style={{
          width: '100%', padding: '13px', background: '#F5C429', color: '#111',
          border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: '700',
          cursor: loading ? 'not-allowed' : 'pointer', marginTop: '14px',
          opacity: loading ? 0.8 : 1, transition: 'all .15s',
        }}
      >
        {loading ? (
          <span>
            <span className="dot" /> <span className="dot" /> <span className="dot" /> তৈরি হচ্ছে...
          </span>
        ) : result ? 'আবার তৈরি করুন ↗' : label}
      </button>

      {error && (
        <div style={{
          marginTop: '12px', background: '#fee', color: '#c0392b', padding: '12px 14px',
          borderRadius: '10px', fontSize: '13px', border: '1px solid #fcc',
        }}>
          {error}
        </div>
      )}

      {result && (
        <div style={{ marginTop: '16px' }}>
          <div style={{
            fontSize: '11.5px', fontWeight: '600', color: '#888', marginBottom: '8px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <span>✨ AI Generated Result</span>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button onClick={handleCopy} style={{
                fontSize: '11px', padding: '4px 11px', borderRadius: '6px',
                border: '1px solid #e0e0d8', background: '#f5f5ef', cursor: 'pointer', color: '#555',
              }}>
                {copied ? '✓ কপি হয়েছে' : 'কপি করুন'}
              </button>
              <button onClick={handleSave} style={{
                fontSize: '11px', padding: '4px 11px', borderRadius: '6px',
                border: '1px solid #e0e0d8', background: '#f5f5ef', cursor: 'pointer', color: '#555',
              }}>
                💾 সেভ করুন
              </button>
            </div>
          </div>
          <div style={{
            background: '#f9f9f5', border: '1px solid #e8e8e0', borderRadius: '10px',
            padding: '16px', fontSize: '13px', color: '#1a1a1a', lineHeight: '1.9',
            whiteSpace: 'pre-wrap', minHeight: '80px', maxHeight: '400px', overflowY: 'auto',
          }}>
            {result}
          </div>
        </div>
      )}

      <style>{`
        .dot { display: inline-block; width: 6px; height: 6px; background: #111; border-radius: 50%; animation: bounce .8s infinite; margin: 0 2px; }
        .dot:nth-child(2){ animation-delay: .15s }
        .dot:nth-child(3){ animation-delay: .3s }
        @keyframes bounce { 0%,60%,100%{ transform: translateY(0) } 30%{ transform: translateY(-5px) } }
      `}</style>
    </div>
  );
}
