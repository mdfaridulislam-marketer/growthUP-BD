// ══════════════════════════════════════════════════
// Usage Routes — Usage tracking ও limit check
// ══════════════════════════════════════════════════
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { getMonthUsage, PLAN_LIMITS } = require('../middleware/planMiddleware');

// ── GET /api/usage — এই মাসে কতবার use করেছে ──
router.get('/usage', authMiddleware, async (req, res) => {
  try {
    const used = await getMonthUsage(req.user.id);
    const limit = PLAN_LIMITS[req.user.plan] || PLAN_LIMITS.free;

    res.json({
      plan: req.user.plan,
      used,
      limit,
      remaining: Math.max(0, limit - used),
      isUnlimited: limit >= 999999,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
