// ══════════════════════════════════════════════════
// Plan Middleware — Usage Limit Check করে
// Free: ১০ generation/মাস
// Pro/Business: Unlimited
// ══════════════════════════════════════════════════
const supabase = require('../lib/supabase');

const PLAN_LIMITS = {
  free:     10,
  pro:      999999,
  business: 999999,
};

async function getMonthUsage(userId) {
  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  const { count } = await supabase
    .from('usage')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('created_at', firstDay);

  return count || 0;
}

async function planMiddleware(req, res, next) {
  try {
    const plan = req.user.plan;
    const limit = PLAN_LIMITS[plan] || PLAN_LIMITS.free;

    const monthUsage = await getMonthUsage(req.user.id);

    if (monthUsage >= limit) {
      return res.status(429).json({
        error: 'limit_exceeded',
        plan: plan,
        used: monthUsage,
        limit: limit,
        message: plan === 'free'
          ? `এই মাসে ${limit}টি free generation শেষ হয়েছে। Pro Plan নিন → Unlimited!`
          : 'Limit শেষ হয়েছে।',
      });
    }

    req.monthUsage = monthUsage;
    req.planLimit = limit;
    next();
  } catch (err) {
    console.error('Plan Middleware Error:', err);
    res.status(500).json({ error: 'Plan check সমস্যা' });
  }
}

module.exports = { planMiddleware, getMonthUsage, PLAN_LIMITS };
