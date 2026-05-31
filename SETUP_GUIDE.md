# GrowthUp Pro — সম্পূর্ণ Setup Guide
### বাংলাদেশের F-commerce উদ্যোক্তাদের জন্য AI Copywriting SaaS

---

## 📦 Project Structure (যা পাচ্ছেন)

```
growthup-project/
├── frontend/          ← Vercel এ deploy হবে
│   ├── index.html     ← Original GrowthUp app (modified)
│   ├── src/
│   │   ├── main.jsx        ← React Auth entry
│   │   ├── lib/
│   │   │   ├── supabase.js ← Supabase client
│   │   │   └── api.js      ← Backend API calls
│   │   ├── hooks/
│   │   │   ├── useAuth.js  ← Login/Logout
│   │   │   └── useUsage.js ← Usage tracking
│   │   └── components/
│   │       ├── auth/       ← Login, Register, Pricing pages
│   │       └── shared/     ← AIBlock, UpgradeModal
│   ├── package.json
│   └── vercel.json
│
├── backend/           ← Railway এ deploy হবে
│   ├── server.js      ← Main Express server
│   ├── routes/
│   │   ├── generate.js  ← Claude API proxy (streaming)
│   │   ├── auth.js      ← User info
│   │   ├── usage.js     ← Usage tracking
│   │   └── payment.js   ← SSLCommerz payment
│   ├── middleware/
│   │   ├── authMiddleware.js ← JWT verify
│   │   └── planMiddleware.js ← Usage limit check
│   ├── lib/supabase.js
│   └── package.json
│
└── supabase_schema.sql  ← Database setup SQL
```

---

## 🚀 STEP 1 — Supabase Setup (Database + Auth)

### 1.1 Account বানান
1. **https://supabase.com** এ যান
2. **Start your project** → GitHub দিয়ে sign up করুন
3. **New Project** বানান:
   - Name: `growthup-pro`
   - Password: একটা শক্তিশালী password দিন (মনে রাখুন)
   - Region: **Southeast Asia (Singapore)** — বাংলাদেশের কাছে

### 1.2 Database Schema Setup
1. Left sidebar → **SQL Editor**
2. **New query** ক্লিক করুন
3. `supabase_schema.sql` ফাইলের পুরো content copy করুন
4. SQL Editor এ paste করুন
5. **Run** বাটন চাপুন (বা Ctrl+Enter)
6. "Success" দেখলে হয়ে গেছে ✅

### 1.3 Auth Settings
1. Left sidebar → **Authentication** → **Providers**
2. **Email** চালু আছে কিনা দেখুন (default চালু থাকে)
3. **Authentication** → **Email Templates** → `Confirm signup` OFF করুন
   *(শুরুতে email verify ছাড়াই login করতে পারবে)*

### 1.4 API Keys নোট করুন
1. Left sidebar → **Settings** → **API**
2. এই দুটো copy করুন:
   - **Project URL**: `https://xxxxxxxxxx.supabase.co`
   - **anon/public key**: `eyJhbGci...` (frontend এর জন্য)
   - **service_role key**: `eyJhbGci...` (backend এর জন্য, secret!)

---

## 🚀 STEP 2 — GitHub Repository তৈরি

### 2.1 Frontend Repository
```bash
# Terminal/Command Prompt এ:
cd growthup-project/frontend
git init
git add .
git commit -m "Initial: GrowthUp Pro Frontend"
```
1. **https://github.com** → **New Repository**
2. Name: `growthup-frontend` → **Private** ✓ → **Create**
3. Repository page এর command copy করুন (push existing):
```bash
git remote add origin https://github.com/আপনার-username/growthup-frontend.git
git push -u origin main
```

### 2.2 Backend Repository
```bash
cd ../backend
git init
git add .
git commit -m "Initial: GrowthUp Pro Backend"
```
1. GitHub → **New Repository**
2. Name: `growthup-backend` → **Private** → **Create**
```bash
git remote add origin https://github.com/আপনার-username/growthup-backend.git
git push -u origin main
```

---

## 🚀 STEP 3 — Railway Setup (Backend Hosting)

Railway তে backend deploy করতে হবে **Vercel এর আগে** — কারণ backend URL টা frontend এ দিতে হবে।

### 3.1 Account
1. **https://railway.app** → **Login with GitHub**

### 3.2 New Project
1. **New Project** → **Deploy from GitHub repo**
2. `growthup-backend` select করুন
3. **Deploy Now** ক্লিক করুন

### 3.3 Environment Variables দিন
Railway Dashboard → আপনার project → **Variables** tab:

```
ANTHROPIC_API_KEY      = sk-ant-xxxxxxxxxxxx
SUPABASE_URL           = https://xxxxxxxxxx.supabase.co
SUPABASE_SERVICE_KEY   = eyJhbGci...  (service_role key)
SSLCOMMERZ_STORE_ID    = আপনার store ID
SSLCOMMERZ_STORE_PASSWORD = আপনার password
SSLCOMMERZ_IS_LIVE     = false
FRONTEND_URL           = https://growthup-frontend.vercel.app  (পরে update করবেন)
BACKEND_URL            = https://growthup-backend.up.railway.app
PORT                   = 3001
```

### 3.4 Domain নোট করুন
Deploy হলে Railway একটা URL দেবে: `https://xxxxx.up.railway.app`
এটা **VITE_BACKEND_URL** হিসেবে frontend এ লাগবে।

### 3.5 Test করুন
Browser এ যান: `https://xxxxx.up.railway.app`
দেখতে পাবেন: `{"status":"ok","message":"GrowthUp Pro API চালু আছে ✅"}`

---

## 🚀 STEP 4 — Vercel Setup (Frontend Hosting)

### 4.1 Account
1. **https://vercel.com** → **Login with GitHub**

### 4.2 New Project
1. **Add New Project** → **Import Git Repository**
2. `growthup-frontend` select করুন → **Import**

### 4.3 Environment Variables দিন
**Environment Variables** section এ:

```
VITE_SUPABASE_URL      = https://xxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY = eyJhbGci...  (anon/public key)
VITE_BACKEND_URL       = https://xxxxx.up.railway.app  (Railway URL)
```

### 4.4 Deploy
**Deploy** বাটন চাপুন। ১-২ মিনিটে deploy হবে।

Vercel URL পাবেন: `https://growthup-frontend.vercel.app`

### 4.5 Railway এ FRONTEND_URL Update করুন
Railway → Variables → `FRONTEND_URL` = `https://growthup-frontend.vercel.app`
Railway automatically redeploy করবে।

---

## 🚀 STEP 5 — SSLCommerz Setup (Payment)

### 5.1 Account বানান
1. **https://developer.sslcommerz.com** এ যান
2. **Register** করুন (business information লাগবে)
3. **Sandbox** account দিয়ে শুরু করুন (test payment)

### 5.2 Store ID পান
1. Login করুন → **Manage Profile** → Store ID ও Password দেখুন
2. Railway Variables এ update করুন

### 5.3 Sandbox Test
- Test card: `4111111111111111`
- CVV: `123`, Expiry: যেকোনো future date
- বা bKash sandbox নম্বর: SSLCommerz documentation দেখুন

### 5.4 Live করার সময়
Railway Variables এ: `SSLCOMMERZ_IS_LIVE = true`

---

## 🚀 STEP 6 — Anthropic API Key

1. **https://console.anthropic.com** এ যান
2. **API Keys** → **Create Key**
3. নামে লিখুন: `growthup-pro`
4. Key copy করুন: `sk-ant-xxxxxxxxxxxx`
5. Railway Variables এ `ANTHROPIC_API_KEY` তে দিন

> ⚠️ এই key শুধু Railway এ রাখুন — কখনো GitHub বা frontend এ দেবেন না!

---

## ✅ STEP 7 — Final Test

সব setup হলে test করুন:

1. **https://growthup-frontend.vercel.app** এ যান
2. **Register করুন** (নতুন account)
3. Login করুন
4. **Input Options** → পণ্যের নাম দিন
5. **Hashtag & Caption** → Generate করুন
6. ✅ AI content দেখলে সব কাজ করছে!

### Payment Test:
1. **Pricing Plans** এ যান
2. **Pro নিন** বাটন চাপুন
3. SSLCommerz checkout এ যাবে
4. Sandbox card দিয়ে payment করুন
5. Dashboard এ ফিরে আসলে Pro badge দেখবেন

---

## 🔄 Daily Workflow (Deploy করার পরে)

```bash
# নতুন feature বা fix করুন
# তারপর:
git add .
git commit -m "নতুন: Hashtag section update"
git push origin main

# ৯০ সেকেন্ড পরে সব user নতুন version পাচ্ছে ✅
# Vercel ও Railway automatically build করে!
```

---

## 💰 Pricing Plans (backend/middleware/planMiddleware.js এ বদলান)

```javascript
const PLAN_LIMITS = {
  free:     10,      // মাসে ১০টি generation
  pro:      999999,  // Unlimited
  business: 999999,  // Unlimited
};
```

Payment prices বদলাতে (backend/routes/payment.js):
```javascript
const PRICES = {
  pro:      499,   // ৳৪৯৯/মাস
  business: 999,   // ৳৯৯৯/মাস
};
```

---

## 🐛 সমস্যা হলে

### "লগইন করুন" error দেখাচ্ছে
→ Supabase URL ও Anon Key সঠিক কিনা দেখুন

### AI generate হচ্ছে না
→ Railway এ `ANTHROPIC_API_KEY` সঠিক কিনা দেখুন
→ Railway logs: `railway logs` command

### Payment redirect হচ্ছে না
→ SSLCommerz credentials সঠিক কিনা দেখুন
→ `SSLCOMMERZ_IS_LIVE=false` (sandbox এ)

### CORS error browser এ
→ Railway এ `FRONTEND_URL` সঠিক Vercel URL দিয়েছেন কিনা দেখুন

---

## 📞 Support

যেকোনো সমস্যায় এই project এর code সহ Claude কে জিজ্ঞেস করুন।
প্রতিটি ফাইলে বাংলায় comment দেওয়া আছে।

---
*GrowthUp Pro v10 — Confidential*
