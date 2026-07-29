# ❓ Frequently Asked Questions (FAQ)

### Q: Do I need to install or host anything to use Tamed?
**No.** Tamed is live and accessible directly in your web browser at **[tamed.pages.dev](https://tamed.pages.dev/)**. Both partners can open the link on mobile or desktop, sign up, and start using the app immediately.

---

### Q: How do daily tasks reset every day?
Task checkmarks automatically reset every night at midnight local time (`00:00`). When you open or refocus the app on a new calendar day, task completion statuses from yesterday reset to unchecked so you can log your fresh daily routine.

---

### Q: Can I use Tamed offline or in Demo Mode?
**Yes.** If Supabase credentials are not present or if you select Demo Mode on onboarding, Tamed uses an in-memory mock engine that runs entirely in your local browser storage.

---

### Q: How do I change our custom currency (e.g. from Bones to Fish)?
Under **Settings > Persona & Customization**, you can update your species avatar (Puppy 🐶, Kitty 🐱, Fox 🦊, or Custom ✨). Changing your species automatically updates your store currency icon and name. Owners can also set custom currency names in settings.

---

### Q: What should I do if my 6-digit pairing code doesn't connect?
1. Ensure the Owner account has completed profile setup and has a valid 6-digit pair code displayed in **Settings**.
2. Verify that the Pet account enters the exact 6-digit pair code without spaces.
3. If needed, tap **Unlink Accounts** under Settings to reset and pair again.

---

### Q: How does the 4-digit Security PIN lock work?
You can enable a 4-digit Security PIN under **Settings > Security & PIN Lock**. Once set, sensitive operations (such as unlinking accounts, deleting profiles, or overriding point balances) require PIN entry (`PinModal.jsx`). Failing the PIN 5 consecutive times triggers a 15-minute lockout to prevent brute-force attacks.

---

### Q: How is XP and leveling calculated?
Completing daily tasks grants **+25 XP**. The XP needed to pass from level $L$ to $L+1$ increases progressively according to:
$$XP_{\text{needed}}(L \to L+1) = 100 + (L-1) \times 50$$
Leveling up unlocks higher rank titles (Novice Pet 🐣 $\to$ Supreme Royalty 👑) and triggers canvas confetti and Web Audio API synthesizer fanfare!

---

### Q: Why is there a daily limit on display name changes?
To prevent database strain and spamming, display name updates are capped at **5 changes per day**. This is enforced both by client-side rate limiters and database triggers (`enforce_display_name_rate_limit`).

---

### Q: Is my data secure?
Yes. Tamed enforces PostgreSQL **Row-Level Security (RLS)** in Supabase so only you and your paired partner can access your calendar logs, daily tasks, and praise cards. Cryptographically secure random number generators (`window.crypto.getRandomValues`) generate all pairing keys.

---

### Q: Can I mute sound effects?
Yes. Tap the speaker icon 🔔 / 🔕 in the top navigation bar or toggle sound under **Settings > Preferences** to mute or enable synthesized Web Audio API sound effects.

---

### Q: Can I clone or self-host this repository?
**Yes, for personal use.** Under the [Personal Use & Non-Redistribution License](LICENSE), anyone is free to clone, self-host, and modify the source code for their own private, personal use. Public redistribution, sub-licensing, or hosting as a commercial SaaS product is strictly prohibited.
