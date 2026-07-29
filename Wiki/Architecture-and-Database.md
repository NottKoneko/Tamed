# 🔬 Architecture & Database Schema Guide

This document provides an exhaustive technical analysis of the Tamed application architecture, Zustand state management store, PostgreSQL database schema, stored procedures (RPCs), and Row-Level Security (RLS) policies.

---

## 1. System Architecture Overview

Tamed uses a **Hybrid Architecture** supporting both real-time cloud synchronization via Supabase PostgreSQL and an offline-first browser demo mode:

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

### Enum Types:
* `user_role`: `'owner'`, `'pet'`
* `pet_species`: `'puppy'`, `'kitty'`, `'fox'`, `'custom'`
* `pairing_status`: `'pending'`, `'active'`
* `day_status`: `'green'`, `'yellow'`, `'red'`, `'none'`
* `proposal_status`: `'pending'`, `'approved'`, `'denied'`
* `redemption_status`: `'pending'`, `'approved'`, `'denied'`
* `praise_type`: `'headpat'`, `'treat'`, `'note'`

### Core Table Definitions:

1. **`profiles`**: Primary user profile table
   - Columns: `id` (UUID, PK), `uid` (TEXT UNIQUE), `pair_code` (TEXT UNIQUE), `role` (user_role), `username` (TEXT), `pet_species` (pet_species), `custom_species_name` (TEXT), `custom_species_icon` (TEXT), `pet_nickname` (TEXT), `custom_theme_primary` (TEXT), `custom_theme_accent` (TEXT), `custom_theme_mode` (TEXT), `avatar_url` (TEXT), `praise_terms` (TEXT), `timezone` (TEXT), `reminder_time` (TEXT), `show_xp_bar` (BOOLEAN), `pairing_pin` (TEXT), `failed_pin_attempts` (INT), `locked_until` (TIMESTAMPTZ), `name_changes_today` (INT), `last_name_change_date` (DATE), `points_balance` (INT), `xp` (INT), `level` (INT), `mood` (TEXT), `created_at`, `updated_at`.

2. **`pairings`**: Encapsulates partner linkages
   - Columns: `id` (UUID, PK), `owner_id` (UUID, FK), `pet_id` (UUID, FK), `status` (pairing_status), `point_value_green` (INT), `point_value_yellow` (INT), `point_value_red` (INT), `max_pending_proposals` (INT), `weekend_multiplier` (NUMERIC), `custom_currency_name` (TEXT), `custom_currency_singular` (TEXT), `custom_currency_icon` (TEXT), `custom_level_titles` (TEXT JSON), `created_at`, `updated_at`.

3. **`calendar_entries`**: Historic daily status records
   - Columns: `id` (UUID, PK), `pairing_id` (UUID, FK), `entry_date` (DATE), `status` (day_status), `points_awarded` (INT), `notes` (TEXT), `created_at`, `updated_at`. UNIQUE(`pairing_id`, `entry_date`).

4. **`reward_proposals`**: Pet store item requests
   - Columns: `id` (UUID, PK), `pairing_id` (UUID, FK), `requested_by` (UUID, FK), `title` (TEXT), `description` (TEXT), `assigned_points` (INT), `status` (proposal_status), `created_at`.

5. **`reward_items`**: Active store catalog items
   - Columns: `id` (UUID, PK), `pairing_id` (UUID, FK), `name` (TEXT), `description` (TEXT), `point_cost` (INT), `created_at`.

6. **`redemptions`**: Store purchases
   - Columns: `id` (UUID, PK), `pairing_id` (UUID, FK), `reward_id` (UUID, FK), `pet_id` (UUID, FK), `title` (TEXT), `points_spent` (INT), `status` (redemption_status), `created_at`.

7. **`daily_tasks`**: Daily checklist routines
   - Columns: `id` (UUID, PK), `pairing_id` (UUID, FK), `title` (TEXT), `xp_reward` (INT), `is_completed` (BOOLEAN), `task_date` (DATE), `created_at`.

8. **`praise_notes`**: Praise cards & head pats
   - Columns: `id` (UUID, PK), `pairing_id` (UUID, FK), `sender_id` (UUID, FK), `type` (praise_type), `message` (TEXT), `created_at`.

9. **`reminders`**: Instant nudges & scheduled check-ins
   - Columns: `id` (UUID, PK), `pairing_id` (UUID, FK), `created_by` (UUID, FK), `title` (TEXT), `message` (TEXT), `reminder_time` (TEXT), `repeat_option` (TEXT), `is_instant` (BOOLEAN), `is_active` (BOOLEAN), `created_at`.

---

## 3. Stored Procedures & Functions (RPCs)

* **`is_user_in_pairing(p_pairing_id UUID)`**: Security DEFINER function checking if `auth.uid()` matches `owner_id` or `pet_id` of the pairing.
* **`process_calendar_entry(p_pairing_id, p_date, p_status)`**: Atomic calendar status logging procedure that computes weekend multipliers, updates point balances, and records `points_awarded`.
* **`verify_security_pin(p_user_id, p_pin)`**: Validates 4-digit PIN, enforces 5-attempt rate limit, and applies a 15-minute lockout on consecutive failures.
* **`process_redemption(p_redemption_id, p_status)`**: Approves or denies redemptions, automatically refunding spent points upon denial.
* **`cancel_redemption(p_redemption_id)`**: Allows Pets to take back pending redemptions and refund points.
* **`prune_stale_data(p_pairing_id)`**: Background data pruning function clearing stale instant nudges (>14 days), completed proposals (>30 days), completed redemptions (>90 days), and unlogged placeholder calendar entries (>60 days).

---

## 4. Row-Level Security (RLS) Policies

All table queries enforce RLS policies restricting read/write access strictly to users in the active pairing via `is_user_in_pairing(pairing_id)`:
* **Profiles:** Users read and update their own profile or their paired partner's profile.
* **Daily Tasks:** Owners insert/delete daily tasks; Pets update `is_completed`.
* **Proposals & Redemptions:** Pets insert proposals/redemptions; Owners update status.
