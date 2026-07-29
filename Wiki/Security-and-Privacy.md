# 🛡️ Security & Privacy Architecture

Security, privacy, and data isolation are core principles of Tamed. This document outlines cryptographic key generation, PIN modal lockouts, client & database rate limiters, input sanitization against XSS, PostgreSQL Row-Level Security (RLS), and account erasure policies.

---

## 1. Cryptographic Key Generation

All user UIDs (`Username#1234`) and 6-digit pair codes (`100000`–`999999`) are generated using standard Web Crypto API calls (`window.crypto.getRandomValues`) with rejection sampling:

```javascript
// cryptoUtils.js - Rejection Sampling to eliminate modulo bias
export const getSecureRandomInt = (maxExclusive) => {
  const uint32Max = 0x100000000;
  const limit = uint32Max - (uint32Max % maxExclusive);
  const randomBuffer = new Uint32Array(1);
  let value;

  do {
    globalThis.crypto.getRandomValues(randomBuffer);
    value = randomBuffer[0];
  } while (value >= limit);

  return value % maxExclusive;
};
```

This guarantees true randomness and eliminates modulo bias, preventing pairing key predictability or brute-force enumeration.

---

## 2. 4-Digit Security PIN Lockout System

Users can optionally configure a 4-digit Security PIN under **Settings > Security & PIN Lock**.

```
┌─────────────────────────────────────────────────────────────┐
│                 PIN VERIFICATION & LOCKOUT                  │
│                                                             │
│   User enters 4-digit PIN in PinModal.jsx                    │
│                            │                                │
│          ┌─────────────────┴─────────────────┐              │
│          ▼                                   ▼              │
│   PIN Correct?                        PIN Incorrect?        │
│   • Reset failed attempts             • Increment counter   │
│   • Allow sensitive action            • Attempt < 5? Warn   │
│                                       • Attempt >= 5?       │
│                                         Trigger 15-Min      │
│                                         Lockout             │
└─────────────────────────────────────────────────────────────┘
```

* **Sensitive Operations Protected:** Account unlinking, point balance manual overrides, profile deletion.
* **Rate Limiting & Lockout:** Stored procedure `verify_security_pin` tracks failed attempts. Reaching 5 consecutive failed attempts locks out PIN actions for **15 minutes**.

---

## 3. Multi-Layer Rate Limiting

1. **Client-Side Sliding Window (`rateLimiter.js`):**
   - Tracks action attempts within sliding time windows (stored in `localStorage` under `tamed_rl_*`).
   - Prevents rapid double-submits on pairing lookups, praise notes, and PIN modal submissions.
2. **Database Trigger Rate Limiter (`enforce_display_name_rate_limit`):**
   - Restricts username and nickname changes to a maximum of **5 updates per day**.
   - Enforced directly in PostgreSQL BEFORE UPDATE ON `public.profiles`.

---

## 4. Input Sanitization & XSS Defense

All raw text input fields (task titles, praise note messages, reward descriptions, custom currency names) pass through `sanitizer.js` before state commitment or database insertion:

```javascript
export const sanitizeText = (str) => {
  if (typeof str !== 'string') return '';
  return str
    .trim()
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};
```

This eliminates HTML script injection (XSS) and DOM tampering.

---

## 5. Row-Level Security (RLS) & Account Erasure

* **RLS Isolation:** Every PostgreSQL table query is scoped to active pairings via helper function `is_user_in_pairing(pairing_id)`. Users cannot view or modify data outside their own active pairing.
* **Manual Account Erasure:** Under **Settings > Danger Zone**, users can permanently destroy their profile, pairing linkages, task history, and calendar entries using a 3-step confirmation process.
