// ══════════════════════════════════════════════════
// POST /api/generate — Claude AI Call (Streaming)
// এটাই সবচেয়ে গুরুত্বপূর্ণ route
// Frontend থেকে prompt আসে → Claude কে পাঠায় → stream করে ফেরত দেয়
// ══════════════════════════════════════════════════
const express = require('express');
const Anthropic = require('@anthropic-ai/sdk');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { planMiddleware } = require('../middleware/planMiddleware');
const supabase = require('../lib/supabase');

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// ── Usage Log করে ──
async function logUsage(userId, section) {
  await supabase.from('usage').insert({
    user_id: userId,
    section: section || 'general',
  });
}

// ── POST /api/generate ──
router.post('/generate', authMiddleware, planMiddleware, async (req, res) => {
  const { prompt, section, maxTokens } = req.body;

  if (!prompt || prompt.trim().length < 5) {
    return res.status(400).json({ error: 'Prompt দিন' });
  }

  // SSE headers (streaming)
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', process.env.FRONTEND_URL || '*');

  try {
    const stream = client.messages.stream({
      model: 'claude-sonnet-4-20250514',
      max_tokens: maxTokens || 1200,
      messages: [{ role: 'user', content: prompt }],
    });

    stream.on('text', (text) => {
      res.write(`data: ${JSON.stringify({ text })}\n\n`);
    });

    stream.on('message', async () => {
      // Usage log করো generation শেষে
      await logUsage(req.user.id, section || 'general');
      res.write(`data: [DONE]\n\n`);
      res.end();
    });

    stream.on('error', (err) => {
      console.error('Stream Error:', err);
      res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
      res.end();
    });

  } catch (err) {
    console.error('Generate Error:', err);
    if (!res.headersSent) {
      res.status(500).json({ error: 'AI generation সমস্যা: ' + err.message });
    } else {
      res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
      res.end();
    }
  }
});

// ── POST /api/generate/json — JSON response (streaming নয়) ──
// Product details auto-fill এর জন্য
router.post('/generate/json', authMiddleware, async (req, res) => {
  const { prompt, maxTokens } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt দিন' });
  }

  try {
    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: maxTokens || 800,
      messages: [{ role: 'user', content: prompt }],
    });

    let text = message.content.map(b => b.text || '').join('');
    // Strip markdown fences
    text = text.replace(/```json|```/g, '').trim();

    try {
      const json = JSON.parse(text);
      res.json({ success: true, data: json });
    } catch {
      res.json({ success: true, data: text });
    }

  } catch (err) {
    console.error('Generate JSON Error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
