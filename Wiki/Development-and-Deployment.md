# 💻 Development & Deployment Manual

This guide provides technical instructions for local environment setup, project structure navigation, build pipelines, Oxlint static analysis, and Cloudflare Pages deployment.

---

## 1. Prerequisites & Environment Setup

- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **Git**: v2.30.0 or higher

### Environment Configuration (`.env`):
Create a `.env` file in the root directory if connecting to a custom Supabase instance:

```env
VITE_SUPABASE_URL=https://your-supabase-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

If these environment variables are omitted, Tamed automatically runs in **Offline Demo Mode** using local browser storage (`mockBackend.js`).

---

## 2. Local CLI Commands

```bash
# 1. Clone & Install Dependencies
git clone https://github.com/NottKoneko/Tamed.git
cd Tamed
npm install

# 2. Run Local Development Server (Vite 6)
npm run dev

# 3. Build Production Bundle (Outputs to dist/)
npm run build

# 4. Preview Production Build Locally
npm run preview

# 5. Run Oxlint Static Analysis
npm run lint
```

---

## 3. Directory & Architecture Map

```
PetOwner Site/
├── .github/workflows/       # GitHub Actions & CI Workflows (e.g. CodeQL)
├── public/                  # Static web assets (favicon, logo, icons)
├── scripts/                 # Utility scripts (e.g., pad_icons.ps1)
├── src/
│   ├── assets/              # Web assets and icons
│   ├── components/          # Reusable UI components
│   │   ├── BottomNav.jsx         # Navigation bar
│   │   ├── Calendar.jsx          # Interactive status calendar
│   │   ├── ConfirmationModal.jsx # Generic modal dialog
│   │   ├── MascotAvatar.jsx      # Animated pet species mascot
│   │   ├── PinModal.jsx          # 4-digit security PIN modal
│   │   ├── PraiseCardModal.jsx   # Praise card popover
│   │   ├── QuickSwitchBanner.jsx # Fast role switcher
│   │   ├── RemindersSection.jsx  # Check-in nudges
│   │   ├── Toast.jsx             # Notification toasts
│   │   └── XPProgressBar.jsx     # Level progress bar
│   ├── pages/               # Top-level page views
│   │   ├── AuthScreen.jsx        # Supabase sign-up / sign-in
│   │   ├── DashboardOwner.jsx    # Owner schedule view
│   │   ├── DashboardPet.jsx      # Pet schedule view
│   │   ├── Home.jsx              # Main habit dashboard
│   │   ├── Onboarding.jsx        # Initial profile setup
│   │   ├── Requests.jsx          # Redemption requests
│   │   ├── Rewards.jsx           # Store catalog & redemptions
│   │   └── Settings.jsx         # Profile & app configuration
│   ├── services/            # Data layer interfaces
│   │   ├── mockBackend.js        # Offline demo mode mock engine
│   │   └── supabaseClient.js     # Supabase client & API wrapper
│   ├── store/               # State management
│   │   └── useAppStore.js        # Zustand 5 application store
│   └── utils/               # Core utility modules
│       ├── audio.js              # Web Audio API sound synthesizer
│       ├── confetti.js           # Canvas particle confetti
│       ├── cryptoUtils.js        # Web Crypto API random generator
│       ├── currency.js          # Currency formatting
│       ├── dateUtils.js          # Local date formatting
│       ├── notifications.js     # Browser native notifications
│       ├── rateLimiter.js        # Sliding window rate limiter
│       ├── sanitizer.js          # XSS text sanitizer
│       ├── theme.js              # Dynamic CSS token theme engine
│       └── xpUtils.js            # Leveling & XP math functions
├── supabase-schema.sql      # Full PostgreSQL schema, RPCs & RLS policies
└── vite.config.js           # Vite 6 configuration file
```

---

## 4. Cloudflare Pages Deployment

Tamed is optimized for single-command static site hosting on **Cloudflare Pages**:

1. **Build Command:** `npm run build`
2. **Build Output Directory:** `dist`
3. **Environment Variables:** Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in Cloudflare Pages dashboard settings.
4. **Live URL:** `https://tamed.pages.dev/`
