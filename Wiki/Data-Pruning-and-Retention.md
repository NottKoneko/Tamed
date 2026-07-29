# 🧹 Data Pruning & Retention Policy

To maintain high application performance, fast page load times, and clean database tables, **Tamed** enforces automated data pruning policies. This document details how stale data is cleaned across both Supabase PostgreSQL and local browser storage.

---

## 📊 Summary of Retention Rules

| Data Surface | Table / Entity | Retention Period | Pruning Action | Purpose |
| :--- | :--- | :--- | :--- | :--- |
| **Instant Nudges** | `public.instant_nudges` | **14 Days** | Auto-purged after 14 days (or capped at 50 most recent per pairing) | Prevents real-time check-in message bloat |
| **Reward Proposals** | `public.reward_proposals` | **30 Days** | Non-pending (`approved` or `denied`) proposals purged after 30 days | Cleans up historical requests while preserving active store items |
| **Point Redemptions** | `public.redemptions` | **90 Days** | Completed (`approved`, `denied`, or `cancelled`) redemptions purged after 90 days | Cleans redemption log history while protecting pending approvals |
| **Calendar Entries** | `public.calendar_entries` | **60 Days** (Un-logged) | Un-logged `status: 'none'` placeholder entries purged after 60 days | Keeps active `green`, `yellow`, and `red` logs forever to preserve level streaks |
| **Rate Limit Logs** | `localStorage` (`tamed_rl_*`) | **24 Hours** | Stale rate limit timestamps garbage-collected on app startup | Cleans client browser storage |

---

## 🔒 Security & Privacy Benefits

1. **Data Minimization (GDPR Compliance)**:
   - Data is retained only as long as necessary for routine tracking and positive reinforcement.
   - Full account & data erasure can also be triggered manually in **Settings > Danger Zone** (with 3-step password verification).

2. **Automated Cleanup Execution**:
   - Supabase stored procedure `prune_stale_data(p_pairing_id)` runs automatically in the background whenever pairing data is loaded.
   - Demo / Offline mode mirrors identical cleanup logic inside the mock backend engine.

---

## 🛠️ PostgreSQL Function Schema

```sql
CREATE OR REPLACE FUNCTION prune_stale_data(p_pairing_id UUID)
RETURNS VOID AS $func$
BEGIN
  -- 1. Prune instant nudges older than 14 days
  DELETE FROM public.instant_nudges
  WHERE pairing_id = p_pairing_id 
    AND created_at < NOW() - INTERVAL '14 days';

  -- 2. Prune completed reward proposals older than 30 days
  DELETE FROM public.reward_proposals
  WHERE pairing_id = p_pairing_id 
    AND status != 'pending' 
    AND created_at < NOW() - INTERVAL '30 days';

  -- 3. Prune completed redemptions older than 90 days
  DELETE FROM public.redemptions
  WHERE pairing_id = p_pairing_id 
    AND status != 'pending' 
    AND created_at < NOW() - INTERVAL '90 days';

  -- 4. Prune un-logged placeholder calendar entries older than 60 days
  DELETE FROM public.calendar_entries
  WHERE pairing_id = p_pairing_id 
    AND status = 'none' 
    AND entry_date < CURRENT_DATE - INTERVAL '60 days';
END;
$func$ LANGUAGE plpgsql SET search_path = public, pg_temp;
```
