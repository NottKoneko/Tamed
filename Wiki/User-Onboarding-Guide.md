# 🚀 User Onboarding & Account Pairing Guide

Welcome to Tamed! This guide walks you through account creation, selecting your role persona, customizing your profile, and linking accounts with your partner using a 6-digit pair code.

---

## 1. Creating Your Account & Signing In

1. Open **[tamed.pages.dev](https://tamed.pages.dev/)** in your desktop or mobile browser.
2. **Supabase Cloud Mode (Default & Recommended):**
   - Click **Sign Up** to create a new account with your Email & Password.
   - Or click **Sign In** if you already have an existing account.
3. **Demo / Offline Mode:**
   - If Supabase environment credentials are not present or if you select Demo Mode, you can proceed directly without an email address to test out all features locally using browser local storage!

---

## 2. Setting Up Your Persona Profile

Upon logging in for the first time, the application routes you to the **Onboarding** screen:

```
┌─────────────────────────────────────────────────────────────┐
│                    ONBOARDING FLOW                          │
│                                                             │
│   Step 1: Select Role  ──►  👑 Master / Owner               │
│                            🦊 Pet / Submissive              │
│                                                             │
│   Step 2: Profile      ──►  Username & Nickname             │
│                            Mascot Species (Puppy/Kitty/Fox) │
│                            Praise Terms & Theme Colors      │
│                                                             │
│   Step 3: Pair Code    ──►  Owner generates 6-digit PIN     │
│                            Pet enters PIN & Links Account   │
└─────────────────────────────────────────────────────────────┘
```

### Role Breakdown:
* **👑 Master / Owner:** You create and manage daily task routines, log daily calendar status (Green 🟢, Yellow 🟡, Red 🔴), review reward proposals, approve point redemptions, and send praise notes or instant nudges.
* **🦊 Pet / Submissive:** You complete daily checklists to earn XP (+25 XP per task), advance levels, collect species currency (Bones 🦴, Fish 🐟, Berries 🫐, Stars ✨), and redeem custom rewards from the store.

### Customization Options:
* **Username & Nickname:** The public identifier and display name your partner sees.
* **Species Persona (Pet):** Choose from Puppy 🐶, Kitty 🐱, Fox 🦊, or Custom ✨.
* **Praise Terms:** Custom endearing terms used by your partner (e.g., *"Good girl!"*, *"Good boy!"*).
* **Theme Customizer:** Select primary and accent colors or choose from 6 curated theme presets.

---

## 3. Account Pairing via 6-Digit Code

To sync routines, calendar status logs, and store redemptions in real time, both partners must link accounts:

```
┌─────────────────────────┐               ┌─────────────────────────┐
│     👑 OWNER ACCOUNT    │               │      🦊 PET ACCOUNT     │
│                         │               │                         │
│ 1. View 6-Digit Code    ├──────────────►│ 2. Enter Pair Code      │
│    (e.g., "789123")     │  Share Code   │    in Onboarding        │
│ └────────────┬────────────┘               └────────────┬────────────┘
             │                                         │
             └───────────────────┬─────────────────────┘
                                 │
                     ┌───────────▼───────────┐
                     │   ✨ ACCOUNTS PAIRED   │
                     │  Real-Time Sync Active │
                     └───────────────────────┘
```

1. **Owner:** Copy your unique 6-digit **Pair Code** shown on your screen (generated cryptographically via `crypto.getRandomValues()`).
2. **Pet:** Paste or type your Owner's 6-digit Pair Code into the onboarding form.
3. Click **Link Accounts**. Your dashboards will immediately link and begin syncing in real-time!

---

## 4. Unlinking & Repairing Accounts

If you ever need to disconnect or re-pair with a different account:
1. Navigate to **Settings > Pair Configuration**.
2. Tap **Unlink Accounts**.
3. (Optional) Enter your 4-digit Security PIN if PIN protection is enabled.
4. Confirm unlinking. Both accounts return to the un-paired state and can be linked to a new code at any time.
