# 🐾 TAMED (Puppy Schedule)

> **The Ultimate Gamified Routine Tracking, Behavioral Positive Reinforcement & Reward Management Ecosystem for Couples & Partners.**

[![Live Web Application](https://img.shields.io/badge/🚀_Live_App-tamed.pages.dev-8B5CF6?style=for-the-badge&logo=cloudflare&logoColor=white)](https://tamed.pages.dev/)
[![Official Wiki](https://img.shields.io/badge/📖_Documentation-GitHub_Wiki-2ea44f?style=for-the-badge&logo=github&logoColor=white)](https://github.com/NottKoneko/Tamed/wiki)
[![React Version](https://img.shields.io/badge/React-19.2.7-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Vite Version](https://img.shields.io/badge/Vite-6.4.3-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-JS_v2.110-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![Deployment](https://img.shields.io/badge/Deploy-Cloudflare_Pages-F38020?style=for-the-badge&logo=cloudflare&logoColor=white)](https://tamed.pages.dev/)

---

> [!IMPORTANT]
> ### 🌐 Official Live Web Application
> **Access Tamed directly in your browser:** **[https://tamed.pages.dev/](https://tamed.pages.dev/)**  
> Using **[tamed.pages.dev](https://tamed.pages.dev/)** is the **preferred and primary way to use the application**. No local installation, code build, or server setup is required! Both partners can link accounts in seconds using a 6-digit pair code.

---

## 📖 Official Documentation & Wiki Portal

Comprehensive user guides, persona breakdowns, developer manuals, and database schemas are maintained in our **[Official GitHub Wiki](https://github.com/NottKoneko/Tamed/wiki)**:

| Wiki Document | Description | Target Audience |
| :--- | :--- | :--- |
| 📖 [**Wiki Home**](https://github.com/NottKoneko/Tamed/wiki/Home) | Main Documentation Portal, quick index, and system status. | All Users |
| 🚀 [**User Onboarding Guide**](https://github.com/NottKoneko/Tamed/wiki/User-Onboarding-Guide) | Account creation, role selection, and 6-digit pair code account linking. | New Users |
| 👑 [**Owner Guide**](https://github.com/NottKoneko/Tamed/wiki/Owner-Guide) | Behavior Codex task creation, calendar status logging (🟢/🟡/🔴), & reward approvals. | Owner Persona |
| 🦊 [**Pet Guide**](https://github.com/NottKoneko/Tamed/wiki/Pet-Guide) | Daily checklists, earning XP, mascot species customization, & reward store redemptions. | Pet Persona |
| 🔬 [**Architecture & Database**](https://github.com/NottKoneko/Tamed/wiki/Architecture-and-Database) | Technical review, Zustand state map, Supabase SQL schema, & RLS policies. | Developers |
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
       │   • Daily Behavior Codex       • Level & XP Bar              │
       │   • Reward Item Catalog        • Custom Currency (Bones 🦴)  │
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
* **Behavior Codex (Daily Tasks):** Create and manage custom daily checklist items for your partner with custom XP reward values.
* **Calendar Day Quality Logging:** Track routine discipline using Green 🟢, Yellow 🟡, and Red 🔴 status indicators.
* **Reward Store & Proposal Approvals:** Review reward ideas submitted by your Pet, approve them to the active store catalog, and fulfill redemptions.
* **Praise Transmitter & Instant Nudges:** Send visual praise cards with confetti or 1-click instant check-in nudges (*"Drink Water 💧"*, *"Time to Stretch 🐾"*).

### 🦊 Pet Persona Features
* **Daily Habit Checklists & XP Engine:** Complete routines for **+25 XP** per task, level up, and unlock milestone rewards.
* **Auto Day-End Reset:** Checklist checkmarks automatically reset every night at midnight so every day starts fresh.
* **Custom Species Currencies:** Earn species-tailored currency based on your avatar persona:
  - 🐶 **Puppy:** Bones 🦴
  - 🐱 **Kitty:** Fish 🐟
  - 🦊 **Fox:** Berries 🫐
  - ✨ **Custom:** Stars ✨
* **Reward Store & Redemptions:** Spend earned points on rewards defined by your Owner or propose new reward ideas.

---

## 🛠️ Local Development & Quick Setup

If you wish to run or develop Tamed locally:

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/NottKoneko/Tamed.git
cd Tamed
npm install
```

### 2. Start Local Development Server
```bash
npm run dev
```
Open `http://localhost:5173/` in your browser.

### 3. Production Build & Linting
```bash
# Build production bundle (outputs to dist/)
npm run build

# Preview production build locally
npm run preview

# Run oxlint static analysis
npm run lint
```

---

## 📄 License & Credits

Designed & Developed for **Tamed Ecosystem**.  
Licensed under the [MIT License](LICENSE).
