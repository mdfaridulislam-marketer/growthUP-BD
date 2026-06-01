// ══════════════════════════════════════════════════
// GrowthUp Pro — Main Server
// ══════════════════════════════════════════════════
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const generateRoute  = require('./routes/generate');
const authRoute      = require('./routes/auth');
const usageRoute     = require('./routes/usage');
const paymentRoute   = require('./routes/payment');

const app = express();

// ── CORS (শুধু frontend URL থেকে request accept করবে) ──
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:5173',
    'http://localhost:5173',
    'http://localhost:3000',
  ],
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Rate Limiting (প্রতি user সর্বোচ্চ ৩০ req/minute) ──
const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  message: { error: 'অনেক বেশি request। একটু অপেক্ষা করুন।' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// ── Health Check ──
app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'GrowthUp Pro API চালু আছে ✅' });
});

// ── Routes ──
app.use('/api', generateRoute);
app.use('/api', authRoute);
app.use('/api', usageRoute);
app.use('/api', paymentRoute);

// ── 404 Handler ──
app.use((req, res) => {
  res.status(404).json({ error: 'Route পাওয়া যায়নি' });
});

// ── Error Handler ──
app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  res.status(500).json({ error: 'Server এ সমস্যা হয়েছে' });
});

// ── Start Server ──
const PORT = process.env.PORT || 3001;
app.get('/health', (req, res) => res.json({ status: 'ok' }));
app.listen(PORT, () => {
  console.log(`✅ GrowthUp Pro Server চলছে → http://localhost:${PORT}`);
});

