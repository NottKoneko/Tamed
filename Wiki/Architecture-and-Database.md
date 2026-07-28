# 🔬 Architecture & Database Schema Guide

This document provides a technical review of the Tamed application architecture, Zustand state store, Supabase database schema, and security policies.

---

## 1. System Architecture Overview

Tamed uses a **Hybrid Architecture** that supports both full real-time cloud sync via Supabase and an offline-first demo mode.

```
┌─────────────────────────────────────────────────────────────┐
│                    REACT 19 FRONTEND (VITE 6)               │
│   • Home, Rewards, Schedule, Settings, Auth & Onboarding    │
└──────────────────────────────┬──────────────────────────────┘
                               │
               ┌───────────────▼───────────────┐
               │    ZUSTAND 5 STATE STORE      │
               │   (useAppStore.js Dispatch)   │
               └───────────────┬───────────────┘
                               │
         ┌─────────────────────┴─────────────────────┐
         │                                           │
┌────────▼────────┐                         ┌────────▼────────┐
│ SUPABASE BACKEND│                         │   MOCK BACKEND  │
│ PostgreSQL + RLS│                         │ In-Memory Demo  │
└─────────────────┘                         └─────────────────┘
```

---

## 2. Database Schema (PostgreSQL)

### Key Tables:

1. **`profiles`**: Stores user metadata (`id`, `uid`, `pair_code`, `role`, `username`, `points_balance`, `xp`, `level`, `pet_species`, `custom_theme_primary`).
2. **`pairings`**: Encapsulates pair linkages (`id`, `owner_id`, `pet_id`, `custom_currency_name`, `created_at`).
3. **`calendar_entries`**: Daily status records (`id`, `pairing_id`, `entry_date`, `status`, `notes`).
4. **`daily_tasks`**: Daily task routines (`id`, `pairing_id`, `title`, `xp_reward`, `is_completed`, `task_date`).
5. **`reward_items`**: Active store catalog items (`id`, `pairing_id`, `title`, `cost`, `description`, `icon`).
6. **`redemptions`**: Store purchases (`id`, `pairing_id`, `reward_id`, `status`, `created_at`).
7. **`praise_notes`**: Praise cards & head pats (`id`, `pairing_id`, `sender_id`, `message`, `note_type`).
8. **`reminders`**: Scheduled check-ins and instant nudges (`id`, `pairing_id`, `title`, `message`, `is_instant`, `reminder_time`).

---

## 3. Row-Level Security (RLS) Policies

* All table queries are scoped to active pairings using helper function `is_user_in_pairing(pairing_id)`.
* **Profiles:** Users can read and edit their own profiles or their paired partner's profile.
* **Daily Tasks:** Only Owners can insert or delete daily tasks; Pets can update task completion (`is_completed`).
* **Redemptions:** Pets can insert redemption requests; Owners can update status (`fulfilled`).

---

## 4. Cryptographic Security

* All user UIDs (`username#1234`) and 6-digit pair codes (`100000`–`999999`) are generated using the Web Crypto API (`window.crypto.getRandomValues`) with rejection sampling to prevent predictability and modulo bias.
