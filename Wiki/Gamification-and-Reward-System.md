# 🎮 Gamification & Reward System Guide

Tamed transforms daily habit building and accountability into an engaging, gamified experience. This document details the mathematical formulas, leveling curves, species currency systems, praise note mechanics, and audio synthesis engine.

---

## 1. XP Progression & Leveling Mathematics

Every completed daily routine checklist item awards **+25 XP**.

### Level Step Formula:
The XP required to pass from Level $L$ to Level $L+1$ increases linearly:
$$XP_{\text{required}}(L \to L+1) = 100 + (L-1) \times 50$$

| Level Transition | XP Required for Step | Cumulative XP Total | Rank Tier Title (Default) |
| :--- | :--- | :--- | :--- |
| **Level 1 $\to$ 2** | 100 XP | 100 XP | Novice Pet 🐣 |
| **Level 2 $\to$ 3** | 150 XP | 250 XP | Good Pet 🌟 |
| **Level 3 $\to$ 4** | 200 XP | 450 XP | Pampered Prince(ss) 💖 |
| **Level 4 $\to$ 5** | 250 XP | 700 XP | Pampered Prince(ss) 💖 |
| **Level 5 $\to$ 6** | 300 XP | 1,000 XP | Pampered Prince(ss) 💖 |
| **Level 6 $\to$ 7** | 350 XP | 1,350 XP | Royal Paw 🐾 |
| **Level 10+** | 550+ XP | 3,250+ XP | Supreme Royalty 👑 |

### Custom Level Titles Override:
Owners can supply a custom JSON mapping in the database (`pairings.custom_level_titles`) to redefine rank names at specific levels (e.g. `{"1": "Apprentice", "5": "Master Pet", "10": "Empress"}`).

---

## 2. Species Currencies & Points Balance

Points are awarded when the Owner logs calendar quality status. Points are denominated according to the Pet's chosen species persona:

```
┌─────────────────────────────────────────────────────────────┐
│                    SPECIES CURRENCY MAP                     │
│                                                             │
│   🐶 Puppy Persona  ──►  Bones 🦴                           │
│   🐱 Kitty Persona  ──►  Fish 🐟                            │
│   🦊 Fox Persona    ──►  Berries 🫐                         │
│   ✨ Custom Persona ──►  Stars ✨ (or Custom Icon)          │
└─────────────────────────────────────────────────────────────┘
```

### Calendar Points & Weekend Multiplier:
- **Green Day 🟢:** Configured base points $\times$ weekend multiplier (1.0x, 1.5x, 2.0x on Sat/Sun).
- **Yellow Day 🟡:** Configured partial points (default: 0).
- **Red Day 🔴:** Configured penalty points (default: 0).

---

## 3. Reward Store & Proposals

1. **Active Store Catalog:** Items added by the Owner with titles, descriptions, and point costs.
2. **Redemption Flow:**
   - Pet selects an item $\to$ Points immediately reserved.
   - Status transitions to `pending` $\to$ Owner reviews.
   - Upon Owner approval/fulfillment $\to$ Item marked complete.
   - If denied or canceled $\to$ Points immediately refunded to Pet balance.
3. **Reward Proposals:** Pet can submit custom reward ideas. Owner reviews pending proposals to approve them directly into the live store catalog.

---

## 4. Audio Synthesis & Confetti Engine

* **Synthesizer Web Audio API (`audio.js`):** Pure browser sound synthesis without external audio files. Generates pleasant chimes for task completions, level ups, praise notes, and tab navigation clicks.
* **Canvas Confetti (`confetti.js`):** Triggers celebratory particle explosions on level advancement and praise card receipt.
