<div align="center">
  <img src="public/logo.png" alt="Tamed Logo" width="180" />
  <h1>TAMED</h1>
  <p><b>The Ultimate Gamified Routine Tracking, Positive Reinforcement & Reward Management App for Couples & Partners.</b></p>
</div>

[![Live Web Application](https://img.shields.io/badge/🚀_Live_App-tamed.pages.dev-8B5CF6?style=for-the-badge&logo=cloudflare&logoColor=white)](https://tamed.pages.dev/)
[![Official Wiki](https://img.shields.io/badge/📖_Documentation-GitHub_Wiki-2ea44f?style=for-the-badge&logo=github&logoColor=white)](https://github.com/NottKoneko/Tamed/wiki)
[![React Version](https://img.shields.io/badge/React-19.2.7-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Vite Version](https://img.shields.io/badge/Vite-6.2.0-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Zustand](https://img.shields.io/badge/Zustand-v5.0.14-443e38?style=for-the-badge&logo=react&logoColor=white)](https://github.com/pmndrs/zustand)
[![Supabase](https://img.shields.io/badge/Supabase-JS_v2.110-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![Deployment](https://img.shields.io/badge/Deploy-Cloudflare_Pages-F38020?style=for-the-badge&logo=cloudflare&logoColor=white)](https://tamed.pages.dev/)

---

> [!IMPORTANT]
> ### 🌐 Official Live Web Application
> **Access Tamed directly in your browser:** **[https://tamed.pages.dev/](https://tamed.pages.dev/)**  
> Using **[tamed.pages.dev](https://tamed.pages.dev/)** is the **preferred and primary way to use the application**. No local installation, code build, or server setup is required! Both partners can link accounts in seconds using a 6-digit pair code.

---

## 📖 Official Documentation & Wiki Portal

Comprehensive user manuals, persona breakdowns, security audits, database schemas, and developer guides are maintained in our **[Official GitHub Wiki](https://github.com/NottKoneko/Tamed/wiki)**:

| Wiki Document | Description | Target Audience |
| :--- | :--- | :--- |
| 📖 [**Wiki Home**](https://github.com/NottKoneko/Tamed/wiki/Home) | Main Documentation Portal, quick index, and system status. | All Users |
| 🚀 [**User Onboarding Guide**](https://github.com/NottKoneko/Tamed/wiki/User-Onboarding-Guide) | Account creation, role selection, and 6-digit pair code account linking. | New Users |
| 👑 [**Owner Guide**](https://github.com/NottKoneko/Tamed/wiki/Owner-Guide) | Daily task creation, calendar status logging (🟢/🟡/🔴), & reward approvals. | Owner Persona |
| 🦊 [**Pet Guide**](https://github.com/NottKoneko/Tamed/wiki/Pet-Guide) | Daily checklists, earning XP, mascot species customization, & reward store redemptions. | Pet Persona |
| 🎮 [**Gamification & Reward System**](https://github.com/NottKoneko/Tamed/wiki/Gamification-and-Reward-System) | Deep dive into XP formulas, rank titles, species currencies, store catalogs, & audio engine. | All Users / Designers |
| 🛡️ [**Security & Privacy**](https://github.com/NottKoneko/Tamed/wiki/Security-and-Privacy) | Cryptographic 6-digit codes, PIN modal lockouts, rate limiters, XSS sanitizer, & RLS policies. | Security / Admins |
| 🎨 [**Customization & Themes**](https://github.com/NottKoneko/Tamed/wiki/Customization-and-Themes) | Dynamic CSS variable token system, 4 environment modes, curated presets, & color pickers. | All Users |
| 🔬 [**Architecture & Database**](https://github.com/NottKoneko/Tamed/wiki/Architecture-and-Database) | Technical review, Zustand state map, Supabase SQL schema, RPC procedures, & RLS rules. | Developers |
| 🧹 [**Data Pruning & Retention**](https://github.com/NottKoneko/Tamed/wiki/Data-Pruning-and-Retention) | Automatic data pruning rules, storage cleanup, & privacy retention schedules. | Developers / Privacy |
| 💻 [**Development & Deployment**](https://github.com/NottKoneko/Tamed/wiki/Development-and-Deployment) | Local setup, Vite 6 workflow, Cloudflare Pages deployment, Oxlint analysis, & mock engine. | Developers |
| ❓ [**FAQ & Troubleshooting**](https://github.com/NottKoneko/Tamed/wiki/FAQ) | Frequently Asked Questions, offline demo mode, auto day-end reset, and security. | All Users |

---

## 🌟 Welcome to Tamed

**Tamed** (formerly *Puppy Schedule*) is a state-of-the-art, mobile-first web application created to transform daily routine logging, accountability, and relationship dynamics into an engaging, gamified experience. 

Built with **React 19**, **Vite 6**, **Zustand 5**, and powered by **Supabase PostgreSQL** with real-time sync, Tamed bridges the gap between daily discipline and playful rewards. Accessible instantly at **[tamed.pages.dev](https://tamed.pages.dev/)**, Tamed delivers a tailored experience for both **Master / Owner** and **Pet / Submissive** roles.

```
       ┌─────────────────────────────────────────────────────────────┐
       │   🌐 OFFICIAL WEB APP: https://tamed.pages.dev/              │
       ├─────────────────────────────────────────────────────────────┤
       │   👑 OWNER DASHBOARD           🦊 PET DASHBOARD              │
       │   • Calendar Status (G/Y/R)    • Interactive Mascot Avatar   │
       │   • Daily Routines & Tasks     • Level & XP Progress Bar     │
       │   • Reward Item Catalog        • Species Currency (Bones 🦴) │
       │   • Instant Praise Sender      • Store Redemptions & Requests│
       │   • 6-Digit Pair Code Auth     • Habit Checklists            │
       └──────────────────────────────┬──────────────────────────────┘
                                      │
                  ┌───────────────────┴───────────────────┐
                  │       ⚡ HYBRID ENGINE (ZUSTAND)       │
                  │   Realtime Supabase + Offline Demo Mode │
                  └───────────────────┬───────────────────┘
                                      │
                  ┌───────────────────┴───────────────────┐
                  │  🗄️ SUPABASE POSTGRES (RLS SECURITY)    │
                  │   Row-Level Security & Encrypted Auth   │
                  └───────────────────────────────────────┘
```

---

## ⚡ Core Feature Catalog

### 👑 Owner Persona Features
* **Daily Tasks & Routines:** Create and manage custom daily checklist items for your partner with configurable XP rewards.
* **Task Context Menu:** Override task completion or remove tasks using the 3-dots action menu.
* **Calendar Day Quality Logging:** Log historic discipline using Green 🟢, Yellow 🟡, and Red 🔴 status indicators with automatic points calculation and weekend multipliers.
* **Reward Store Administration:** Create store items with custom point costs and review proposed reward ideas from your Pet.
* **Redemption Approvals:** Review and fulfill reward redemption requests submitted by your Pet.
* **Praise Transmitter & Instant Nudges:** Send visual praise cards with confetti or 1-click instant check-in nudges (*"Drink Water 💧"*, *"Time to Stretch 🐾"*, *"Bedtime Check-in 🛌"*, *"Head Pats 💖"*).

### 🦊 Pet Persona Features
* **Daily Habit Checklists & XP Engine:** Complete routines for **+25 XP** per task, level up, and unlock milestone rewards.
* **Progressive Level System:** Earn levels according to the formula $XP(L \to L+1) = 100 + (L-1) \times 50$ and gain custom rank titles (Novice Pet 🐣 to Supreme Royalty 👑).
* **Auto Day-End Reset:** Checklist checkmarks automatically reset every night at midnight so every day starts fresh.
* **Custom Species Currencies:** Earn species-tailored currency based on your avatar persona:
  - 🐶 **Puppy:** Bones 🦴
  - 🐱 **Kitty:** Fish 🐟
  - 🦊 **Fox:** Berries 🫐
  - ✨ **Custom:** Stars ✨
* **Reward Store & Redemptions:** Spend earned points on rewards defined by your Owner or submit custom reward proposals.

---

## 🛡️ Security & Privacy Architecture

* **Cryptographic Keys:** Account UIDs (`Username#1234`) and 6-digit pair codes (`100000`–`999999`) are generated using `window.crypto.getRandomValues()` with rejection sampling to eliminate modulo bias.
* **PIN Lock & Lockout:** Sensitive actions are protected by a 4-digit security PIN lock (`PinModal.jsx`) backed by a 5-attempt sliding window rate limiter and a 15-minute brute-force lockout.
* **Rate Limiting:** Client-side sliding-window rate limiters prevent UI spam while database triggers limit display name updates to max 5 per day.
* **Input Sanitization:** User strings are sanitized using `sanitizer.js` to escape HTML characters (`<`, `>`, `&`, `"`, `'`, `/`) and prevent XSS script injection.
* **Database Isolation:** Supabase PostgreSQL Row-Level Security (RLS) policies isolate pairing data using `is_user_in_pairing(pairing_id)`.

---

## 🛠️ Local Development & Quick Setup

If you wish to run or develop Tamed locally:

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher

### 2. Clone & Install Dependencies
```bash
git clone https://github.com/NottKoneko/Tamed.git
cd Tamed
npm install
```

### 3. Start Local Development Server
```bash
npm run dev
```
Open `http://localhost:5173/` in your browser.

### 4. Production Build & Linting
```bash
# Build production bundle (outputs to dist/)
npm run build

# Preview production build locally
npm run preview

# Run oxlint static analysis
npm run lint
```

---

## 📄 License & Terms

Designed & Developed for **Tamed**.  
Licensed under the **Personal Use & Non-Redistribution License** (see [LICENSE](LICENSE)).

* **Allowed**: Clone, compile, self-host, and customize for personal, private, non-commercial use.
* **Prohibited**: Public redistribution, commercial hosting (SaaS), sub-licensing, or selling copies of this software.
