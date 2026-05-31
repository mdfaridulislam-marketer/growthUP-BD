// ══════════════════════════════════════════════════
// Auth Routes
// ══════════════════════════════════════════════════
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const supabase = require('../lib/supabase');

// ── GET /api/me — Current user info ──
router.get('/me', authMiddleware, (req, res) => {
  res.json({
    id: req.user.id,
    email: req.user.email,
    name: req.user.name,
    plan: req.user.plan,
    planExpiresAt: req.user.planExpiresAt,
  });
});

// ── PUT /api/profile — Profile update ──
router.put('/profile', authMiddleware, async (req, res) => {
  const { name } = req.body;

  const { error } = await supabase
    .from('profiles')
    .update({ name })
    .eq('id', req.user.id);

  if (error) return res.status(400).json({ error: error.message });
  res.json({ success: true });
});

module.exports = router;
