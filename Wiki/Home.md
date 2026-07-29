<div align="center">
  <img src="../public/logo.png" alt="Tamed Logo" width="180" />
  <h1>Welcome to the Tamed Wiki</h1>
  <p><b>The Ultimate Gamified Routine Tracking, Positive Reinforcement & Reward Management App for Couples & Partners.</b></p>
</div>

[![Live Web Application](https://img.shields.io/badge/🚀_Live_App-tamed.pages.dev-8B5CF6?style=for-the-badge&logo=cloudflare&logoColor=white)](https://tamed.pages.dev/)
[![React Version](https://img.shields.io/badge/React-19.2.7-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Vite Version](https://img.shields.io/badge/Vite-6.2.0-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Zustand](https://img.shields.io/badge/Zustand-v5.0.14-443e38?style=for-the-badge&logo=react&logoColor=white)](https://github.com/pmndrs/zustand)
[![Supabase](https://img.shields.io/badge/Supabase-JS_v2.110-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![Deployment](https://img.shields.io/badge/Deploy-Cloudflare_Pages-F38020?style=for-the-badge&logo=cloudflare&logoColor=white)](https://tamed.pages.dev/)

---

> [!IMPORTANT]
> ### 🌐 Official Live Web Application
> **Access Tamed directly in your browser:** **[https://tamed.pages.dev/](https://tamed.pages.dev/)**  
> No installation or server setup required! Both partners can link accounts using a 6-digit pair code.

---

## 📚 Complete Wiki Documentation Index

Explore our comprehensive documentation suite:

| Wiki Page | Description | Target Audience |
| :--- | :--- | :--- |
| [**Home**](Home) | Documentation portal overview, system badges, and navigation index. | All Users |
| [**User Onboarding Guide**](User-Onboarding-Guide) | Account creation, role selection, and 6-digit pair code account linking. | New Users |
| [**Owner Guide**](Owner-Guide) | Daily task creation, calendar status logging, praise cards, & reward approvals. | Owner Persona |
| [**Pet Guide**](Pet-Guide) | Daily task checklists, earning XP, mascot species customization, and reward redemptions. | Pet Persona |
| [**Gamification & Reward System**](Gamification-and-Reward-System) | XP leveling math, rank titles, species currencies, store redemptions, & sound synthesizer. | All Users |
| [**Security & Privacy**](Security-and-Privacy) | Cryptographic 6-digit codes, PIN lockouts, rate limiters, XSS sanitizer, & RLS policies. | Security / Admins |
| [**Customization & Themes**](Customization-and-Themes) | Dynamic CSS variable token system, 4 environment modes, curated presets, & color pickers. | All Users |
| [**Architecture & Database**](Architecture-and-Database) | Technical architecture, Zustand store map, Supabase SQL schema, RPCs, & RLS policies. | Developers |
| [**Data Pruning & Retention**](Data-Pruning-and-Retention) | Automatic data pruning rules, storage cleanup, & privacy retention schedules. | Developers / Privacy |
| [**Development & Deployment**](Development-and-Deployment) | Local setup, Vite 6 workflow, Cloudflare Pages deployment, Oxlint analysis, & mock engine. | Developers |
| [**FAQ**](FAQ) | Frequently Asked Questions, troubleshooting, and offline demo mode. | All Users |

---

## 🌟 Application Overview

**Tamed** (formerly *Puppy Schedule*) is a mobile-first, real-time web application designed to transform routine tracking, accountability, and positive behavioral reinforcement into a fun, gamified experience for couples.

```
       ┌─────────────────────────────────────────────────────────────┐
       │   🌐 OFFICIAL WEB APP: https://tamed.pages.dev/              │
       ├─────────────────────────────────────────────────────────────┤
       │   👑 OWNER DASHBOARD           🦊 PET DASHBOARD              │
       │   • Calendar Status (G/Y/R)    • Interactive Mascot Avatar   │
       │   • Daily Routines & Tasks     • Level & XP Progress Bar     │
       │   • Reward Item Catalog        • Custom Species Currency 🦴   │
       │   • Instant Praise Sender      • Store Redemptions & Requests│
       │   • 6-Digit Pair Code Auth     • Habit Checklists            │
       └──────────────────────────────┬──────────────────────────────┘
                                      │
                  ┌───────────────────┴───────────────────┐
                  │       ⚡ HYBRID ENGINE (ZUSTAND)       │
                  │   Realtime Supabase + Offline Demo Mode │
                  └───────────────────────────────────────┘
```

---

## 🛠️ Technology Stack Summary

* **Frontend Framework:** React 19, Vite 6, Vanilla CSS (Design Tokens, Glassmorphism, Dynamic Theme Engine)
* **State Management:** Zustand 5 (Hybrid store with automatic local offline fallback)
* **Backend Database:** Supabase PostgreSQL with Row-Level Security (RLS) & Realtime Channels
* **Audio-Visual Effects:** Custom Synthesizer Web Audio API, Canvas Confetti
* **Hosting:** Cloudflare Pages (`tamed.pages.dev`)
