# 🧹 Data Pruning & Retention Policy

To ensure maximum performance, fast query response times, and compliance with data minimization best practices, **Tamed** enforces automated data retention and garbage collection rules across both Supabase PostgreSQL and client browser storage.

---

## 📊 Retention Schedule Matrix

| Data Surface | Table / Entity | Retention Period | Pruning Action | Purpose |
| :--- | :--- | :--- | :--- | :--- |
| **Instant Nudges** | `public.instant_nudges` / `reminders` | **14 Days** | Auto-purged after 14 days | Prevents real-time check-in message bloat |
| **Reward Proposals** | `public.reward_proposals` | **30 Days** | Non-pending (`approved` / `denied`) proposals purged after 30 days | Cleans historical request logs while preserving active store items |
| **Point Redemptions** | `public.redemptions` | **90 Days** | Completed (`approved`, `denied`, or `cancelled`) redemptions purged after 90 days | Cleans redemption log history while protecting active/pending items |
| **Calendar Entries** | `public.calendar_entries` | **60 Days** (Un-logged) | Un-logged `status: 'none'` placeholder entries purged after 60 days | Keeps active `green`, `yellow`, and `red` logs forever to preserve level streaks |
| **Rate Limit Logs** | `localStorage` (`tamed_rl_*`) | **24 Hours** | Stale rate limit timestamps garbage-collected on app startup | Cleans client browser storage |

---

## 🔒 Security & Data Minimization (GDPR)

1. **Automated Cleanup Execution**:
   - The Supabase stored procedure `prune_stale_data(p_pairing_id)` executes in the background whenever pairing data loads.
   - Offline Demo Mode mirrors identical pruning logic within `mockBackend.js`.

2. **Manual Account Erasure (Danger Zone)**:
   - Users can trigger total account and pairing data deletion under **Settings > Danger Zone**.
   - Requires 3-step password verification or security PIN confirmation. Permanently removes all profile records, pairing links, task checklists, and calendar logs.

---

## 🛠️ PostgreSQL Pruning Function Schema

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
