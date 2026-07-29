# ❓ Frequently Asked Questions (FAQ)

### Q: Do I need to install or host anything to use Tamed?
**No.** Tamed is live and accessible directly in your web browser at **[tamed.pages.dev](https://tamed.pages.dev/)**. Both partners can open the link on mobile or desktop, sign up, and start using the app immediately.

---

### Q: How do daily tasks reset every day?
Task checkmarks automatically reset every night at midnight local time (`00:00`). When you open or refocus the app on a new calendar day, task completion statuses from yesterday reset to unchecked so you can log your fresh daily routine.

---

### Q: Can I use Tamed offline or in Demo Mode?
**Yes.** If Supabase is not configured or if you select Demo Mode, Tamed uses an in-memory mock engine that runs entirely in your local browser storage.

---

### Q: How do I change our custom currency (e.g. from Bones to Fish)?
Under **Settings > Persona & Customization**, you can update your species avatar (Puppy 🐶, Kitty 🐱, Fox 🦊, or Custom ✨). Changing your species automatically updates your store currency icon and name. Owners can also set custom currency names in settings.

---

### Q: What should I do if my pairing code doesn't connect?
1. Ensure the Owner account has completed profile setup and has a valid 6-digit pair code displayed in **Settings**.
2. Verify that the Pet account enters the exact 6-digit pair code without spaces.
3. If needed, tap **Unlink Accounts** under Settings to reset and pair again.

---

### Q: Is my data secure?
Yes. Tamed enforces PostgreSQL **Row-Level Security (RLS)** in Supabase so only you and your paired partner can access your calendar logs, daily tasks, and praise cards. Cryptographically secure random number generators (`window.crypto.getRandomValues`) generate all pairing keys.

---

### Q: Can I clone or self-host this repository?
**Yes, for personal use.** Under the [Personal Use & Non-Redistribution License](LICENSE), anyone is free to clone, self-host, and modify the source code for their own private, personal use. Public redistribution, sub-licensing, or hosting as a commercial SaaS product is strictly prohibited.
