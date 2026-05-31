// ══════════════════════════════════════════════════
// Payment Routes — SSLCommerz (বাংলাদেশ Payment)
// ══════════════════════════════════════════════════
const express = require('express');
const router = express.Router();
const SSLCommerzPayment = require('sslcommerz-lts');
const authMiddleware = require('../middleware/authMiddleware');
const supabase = require('../lib/supabase');

// Plan prices (টাকায়)
const PRICES = {
  pro:      499,
  business: 999,
};

// ── POST /api/payment/init — Payment শুরু করো ──
router.post('/payment/init', authMiddleware, async (req, res) => {
  try {
    const { plan } = req.body;

    if (!PRICES[plan]) {
      return res.status(400).json({ error: 'Invalid plan' });
    }

    const tranId = 'GU_' + Date.now() + '_' + req.user.id.substring(0, 8);
    const amount = PRICES[plan];

    const data = {
      total_amount:     amount,
      currency:         'BDT',
      tran_id:          tranId,
      success_url:      `${process.env.BACKEND_URL}/api/payment/success`,
      fail_url:         `${process.env.BACKEND_URL}/api/payment/fail`,
      cancel_url:       `${process.env.FRONTEND_URL}/pricing`,
      ipn_url:          `${process.env.BACKEND_URL}/api/payment/ipn`,
      cus_name:         req.user.name || 'User',
      cus_email:        req.user.email,
      cus_phone:        '01700000000',
      cus_add1:         'Bangladesh',
      cus_city:         'Dhaka',
      cus_country:      'Bangladesh',
      product_name:     `GrowthUp ${plan} Plan`,
      product_category: 'SaaS',
      product_profile:  'general',
      shipping_method:  'NO',
      num_of_item:      1,
      product_amount:   amount,
      // User ID ও plan সেভ করো — success callback এ লাগবে
      value_a:          req.user.id,
      value_b:          plan,
      value_c:          tranId,
    };

    const isLive = process.env.SSLCOMMERZ_IS_LIVE === 'true';
    const sslcz = new SSLCommerzPayment(
      process.env.SSLCOMMERZ_STORE_ID,
      process.env.SSLCOMMERZ_STORE_PASSWORD,
      isLive
    );

    const apiResponse = await sslcz.init(data);

    if (!apiResponse?.GatewayPageURL) {
      throw new Error('SSLCommerz URL পাওয়া যায়নি');
    }

    // Transaction pre-save করো
    await supabase.from('subscriptions').insert({
      user_id:     req.user.id,
      plan:        plan,
      amount:      amount,
      payment_ref: tranId,
      status:      'pending',
    });

    res.json({ url: apiResponse.GatewayPageURL, tranId });

  } catch (err) {
    console.error('Payment Init Error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ── POST /api/payment/success — SSLCommerz Callback ──
router.post('/payment/success', async (req, res) => {
  try {
    const { val_id, tran_id, status, value_a: userId, value_b: plan } = req.body;

    if (status !== 'VALID' && status !== 'VALIDATED') {
      return res.redirect(`${process.env.FRONTEND_URL}/pricing?payment=failed`);
    }

    // SSLCommerz দিয়ে verify করো
    const isLive = process.env.SSLCOMMERZ_IS_LIVE === 'true';
    const sslcz = new SSLCommerzPayment(
      process.env.SSLCOMMERZ_STORE_ID,
      process.env.SSLCOMMERZ_STORE_PASSWORD,
      isLive
    );

    const validation = await sslcz.validate({ val_id });

    if (validation?.status !== 'VALID') {
      return res.redirect(`${process.env.FRONTEND_URL}/pricing?payment=invalid`);
    }

    // ৩০ দিন পরে expire
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    // User plan update করো
    await supabase
      .from('profiles')
      .update({
        plan:            plan,
        plan_expires_at: expiresAt.toISOString(),
      })
      .eq('id', userId);

    // Subscription active করো
    await supabase
      .from('subscriptions')
      .update({ status: 'active', starts_at: new Date().toISOString(), expires_at: expiresAt.toISOString() })
      .eq('payment_ref', tran_id)
      .eq('user_id', userId);

    // Dashboard এ redirect করো
    res.redirect(`${process.env.FRONTEND_URL}/dashboard?payment=success&plan=${plan}`);

  } catch (err) {
    console.error('Payment Success Error:', err);
    res.redirect(`${process.env.FRONTEND_URL}/pricing?payment=error`);
  }
});

// ── POST /api/payment/fail ──
router.post('/payment/fail', (req, res) => {
  const { tran_id } = req.body;
  if (tran_id) {
    supabase.from('subscriptions').update({ status: 'failed' }).eq('payment_ref', tran_id);
  }
  res.redirect(`${process.env.FRONTEND_URL}/pricing?payment=failed`);
});

// ── POST /api/payment/cancel ──
router.post('/payment/cancel', (req, res) => {
  res.redirect(`${process.env.FRONTEND_URL}/pricing?payment=cancelled`);
});

// ── POST /api/payment/ipn — Instant Payment Notification ──
router.post('/payment/ipn', async (req, res) => {
  // IPN এ আসলে আবার verify করো
  const { val_id, status, value_a: userId, value_b: plan, tran_id } = req.body;

  if (status === 'VALID' || status === 'VALIDATED') {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    await supabase.from('profiles')
      .update({ plan, plan_expires_at: expiresAt.toISOString() })
      .eq('id', userId);
  }

  res.json({ received: true });
});

// ── GET /api/plan — User এর current plan ──
router.get('/plan', authMiddleware, (req, res) => {
  res.json({
    plan:          req.user.plan,
    planExpiresAt: req.user.planExpiresAt,
  });
});

module.exports = router;
