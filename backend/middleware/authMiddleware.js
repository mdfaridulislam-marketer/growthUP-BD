// ══════════════════════════════════════════════════
// Auth Middleware — Supabase JWT verify করে
// প্রতিটি protected route এ এটা লাগাতে হবে
// ══════════════════════════════════════════════════
const supabase = require('../lib/supabase');

async function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'লগইন করুন' });
    }

    const token = authHeader.split(' ')[1];

    // Supabase দিয়ে token verify করো
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ error: 'Token invalid। আবার লগইন করুন।' });
    }

    // User এর profile ও plan fetch করো
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    req.user = {
      id: user.id,
      email: user.email,
      plan: profile?.plan || 'free',
      name: profile?.name || '',
      planExpiresAt: profile?.plan_expires_at || null,
    };

    // Plan expire হয়েছে কিনা check করো
    if (req.user.plan !== 'free' && req.user.planExpiresAt) {
      const now = new Date();
      const expiry = new Date(req.user.planExpiresAt);
      if (now > expiry) {
        // Plan expire → free তে নামিয়ে দাও
        await supabase
          .from('profiles')
          .update({ plan: 'free', plan_expires_at: null })
          .eq('id', user.id);
        req.user.plan = 'free';
      }
    }

    next();
  } catch (err) {
    console.error('Auth Middleware Error:', err);
    res.status(500).json({ error: 'Authentication সমস্যা' });
  }
}

module.exports = authMiddleware;
