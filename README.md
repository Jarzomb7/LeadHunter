# 🎯 LeadHunter

AI-powered lead finder for freelancers. Monitor Facebook groups, job boards and social media for freelance opportunities. Get instant Telegram + email alerts.

## ✨ Features

- **Multi-platform monitoring** — Facebook, LinkedIn, Useme, Freelancer, Upwork, Reddit, Twitter
- **Keyword alerts** — Set keywords like "szukam strony", "web developer", "seo freelancer"
- **Lead CRM** — Track leads from NEW → WON with notes
- **AI message generator** — One-click personalized outreach (OpenAI GPT-4o-mini)
- **Proposal generator** — Full project proposals in seconds
- **Website analyzer** — Audit client sites for issues
- **Telegram + Email alerts** — Instant notifications on new leads
- **Multi-tenant** — Each user sees only their own data (Supabase RLS)

## 🚀 Quick Start

### 1. Clone & Install

```bash
git clone https://github.com/yourusername/leadhunter
cd leadhunter
npm install
```

### 2. Set up Supabase

1. Create project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run `supabase/schema.sql`
3. Go to **Authentication → Providers** and enable:
   - Email (enabled by default)
   - Google OAuth
   - Facebook OAuth
4. Set **Site URL** to `http://localhost:3000`
5. Add **Redirect URL**: `http://localhost:3000/auth/callback`

### 3. Configure Environment Variables

```bash
cp .env.local.example .env.local
```

Edit `.env.local`:

```env
# Supabase (Settings → API)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...
SUPABASE_SERVICE_ROLE_KEY=eyJhbG...

# OpenAI (platform.openai.com)
OPENAI_API_KEY=sk-...

# Resend email (resend.com)
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=alerts@yourdomain.com

# Telegram Bot (talk to @BotFather on Telegram)
TELEGRAM_BOT_TOKEN=1234567890:AAF...

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 🌐 Deploy to Vercel

### Option A: Vercel CLI

```bash
npm i -g vercel
vercel
```

### Option B: GitHub Integration

1. Push to GitHub
2. Go to [vercel.com](https://vercel.com) → New Project
3. Import your repository
4. Add all environment variables from `.env.local`
5. Deploy!

### After Deployment

Update in Supabase:
- **Site URL** → `https://yourdomain.vercel.app`
- **Redirect URLs** → `https://yourdomain.vercel.app/auth/callback`

---

## 🤖 Telegram Bot Setup

1. Message `@BotFather` on Telegram
2. Send `/newbot` and follow instructions
3. Copy the token to `TELEGRAM_BOT_TOKEN`
4. Users find their Chat ID by messaging `@userinfobot`
5. Enter the Chat ID in Settings → Notifications

---

## 📁 Project Structure

```
leadhunter/
├── app/
│   ├── page.tsx              # Landing page
│   ├── auth/
│   │   ├── login/            # Login page
│   │   ├── signup/           # Signup page
│   │   └── callback/         # OAuth callback
│   ├── dashboard/            # Stats dashboard
│   ├── leads/                # Lead finder + CRM
│   ├── keywords/             # Keyword manager
│   ├── groups/               # Group/source manager
│   ├── analyzer/             # Website analyzer
│   ├── proposals/            # AI proposal generator
│   ├── settings/             # Notifications settings
│   └── api/
│       ├── leads/            # CRUD leads
│       ├── keywords/         # CRUD keywords
│       ├── groups/           # CRUD groups
│       ├── analyze/          # Website analysis
│       ├── ai-message/       # AI outreach messages
│       ├── proposal/         # AI proposals
│       └── alerts/           # Alert settings + test
├── components/
│   └── Sidebar.tsx           # Navigation sidebar
├── lib/
│   ├── supabase/             # Supabase clients
│   ├── ai/                   # OpenAI functions
│   ├── notifications/        # Telegram + Email
│   └── utils.ts              # Helpers
├── types/
│   └── index.ts              # TypeScript types
└── supabase/
    └── schema.sql            # Database schema + RLS
```

---

## 🔒 Security

- **Row Level Security** on all Supabase tables
- All API routes verify user authentication
- Users can only access their own data
- OAuth via Supabase (Google, Facebook)

---

## 📊 Database Schema

See `supabase/schema.sql` for the full schema including:
- `users` — user profiles (auto-created on signup)
- `groups` — monitored sources
- `keywords` — search keywords
- `leads` — discovered leads with CRM status
- `alerts` — notification settings
- `proposals` — generated proposals

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | TailwindCSS |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| AI | OpenAI GPT-4o-mini |
| Email | Resend |
| Alerts | Telegram Bot API |
| Deployment | Vercel |

---

## 📝 License

MIT — free to use and modify.
