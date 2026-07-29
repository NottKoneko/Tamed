# 👑 Owner Persona Guide

As the **Master / Owner**, you set daily routine expectations, log calendar status, review reward proposals, approve store redemptions, and provide positive reinforcement to your Pet.

---

## 1. Daily Tasks & Routine Management

The **Daily Tasks** module on the Home screen lets you build and maintain daily habit checklists for your Pet:

* **Creating Tasks:** Click **+ Add Task**, enter the title (e.g., *"Drink 2L Fresh Water 💧"*), and assign the XP reward (default: +25 XP).
* **Task Context Menu (3-Dots):** Tap the 3-dots menu on any task item to access administrative actions:
  - **Override Task Status:** Manually mark a task as completed or incomplete.
  - **Delete Task:** Remove the routine permanently from the checklist.
* **Auto Day-End Reset:** Checklist checkmarks automatically reset every night at midnight (`00:00`), ensuring your Pet begins every morning with a clean daily checklist.

---

## 2. Calendar Status Logging

The interactive calendar allows you to evaluate historic discipline and routine quality:

| Status Indicator | Definition & Impact | Points Awarded |
| :--- | :--- | :--- |
| 🟢 **Green Day** | Exemplary behavior and complete routine execution. | Configured Base Points $\times$ Weekend Multiplier |
| 🟡 **Yellow Day** | Partial routine completion or minor slip-ups. | Partial Points (Default: 0) |
| 🔴 **Red Day** | Missed routines or discipline reset. | Zero Points (Default: 0) |

* **Auto-Evaluation:** Completing all daily checklist tasks automatically evaluates today's calendar status to **Green 🟢**.
* **Weekend Multiplier:** Green days logged on Saturdays or Sundays apply your configured weekend point multiplier (1.0x, 1.5x, or 2.0x).
* **Historical Point Preservation:** Logging calendar status records snapshot `points_awarded` values into PostgreSQL so historical records remain immutable even if pairing point rules change later.

---

## 3. Reward Store Administration & Approvals

Under the **Rewards Hub** (`rewards` tab):

* **Adding Store Items:** Create reward catalog items with title, description, and point cost (e.g., *"30 Min Back Massage 💆" - 100 pts*).
* **Reviewing Pet Proposals:** When your Pet submits a custom reward proposal, review it under **Pending Proposals**. Click **Approve** to add it to the live store or **Reject** to dismiss it.
* **Fulfilling Redemptions:** When your Pet redeems a reward, it enters your **Redemption Queue**. Once you deliver the real-world reward, mark it as **Fulfilled**.

---

## 4. Praise Transmitter & Instant Nudges

Deliver instant encouragement and check-in reminders:

* **Praise Cards:** Send custom heart-stamped praise notes. When received, your Pet's screen lights up with visual confetti and audio synthesized sound effects.
* **1-Click Instant Nudges:** Send pre-set check-in alerts:
  - 💧 *Drink Water*
  - 🐾 *Time to Stretch*
  - 🛌 *Bedtime Check-in*
  - 💖 *Head Pats*
