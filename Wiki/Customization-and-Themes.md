# 🎨 Customization & Theme Engine Guide

Tamed features a dynamic, full-page CSS token theme engine that allows users to customize colors, environment modes, mascot species, currency icons, and rank titles.

---

## 1. Dynamic CSS Token Engine

The theme engine (`theme.js`) dynamically updates CSS variables on the root element (`document.documentElement`) in response to user settings changes:

```javascript
// Dynamic CSS Token Variables
--color-primary: #8b5cf6;
--color-accent: #ec4899;
--gradient-hero: linear-gradient(135deg, var(--color-primary) 0%, var(--color-accent) 100%);
--color-background: #0f0d1a;
--color-surface: rgba(30, 27, 46, 0.85);
--color-text-main: #eef0f6;
--color-text-muted: #9da5b8;
--shadow-glow: 0 0 32px rgba(139, 92, 246, 0.3);
```

---

## 2. Environment Modes

Tamed supports 4 distinct environment viewing modes:

| Mode ID | Name | Background | Surface | Description |
| :--- | :--- | :--- | :--- | :--- |
| `dark` | **🌙 Midnight Dark** | `#0f0d1a` | `rgba(30, 27, 46, 0.85)` | Rich dark mode with vibrant glowing gradients. |
| `dark2` | **🖤 Obsidian Black** | `#050507` | `rgba(16, 16, 20, 0.88)` | Ultra-dark obsidian black for OLED displays. |
| `light` | **☀️ Clean Light** | `#f8fafc` | `#ffffff` | Crisp, high-contrast light mode. |
| `soft` | **🌸 Soft Cream** | `#fdf8f0` | `#fffdf9` | Warm pastel cream aesthetic. |

---

## 3. Curated Theme Presets

Users can choose from 6 hand-crafted theme presets under **Settings > Themes & Presets**:

1. 🌿 **Creamy Moss:** Soft Cream 🍦 $\times$ Sage Green 🌿 (`#4a7c59`, `#87a96b`)
2. 👑 **Midnight Royal:** Midnight Dark 🌙 $\times$ Royal Violet 💜 (`#8b5cf6`, `#ec4899`)
3. 🔥 **Obsidian Ember:** Obsidian Black 🖤 $\times$ Amber Glow 🌅 (`#ea580c`, `#f59e0b`)
4. 🌸 **Blush Rose:** Clean Light ☀️ $\times$ Rose Pink 💖 (`#ec4899`, `#a855f7`)
5. 🌊 **Ocean Breeze:** Clean Light ☀️ $\times$ Deep Cyan 💙 (`#3b82f6`, `#06b6d4`)
6. 🍵 **Matcha Latte:** Soft Cream 🍦 $\times$ Forest Matcha 🍃 (`#2d6a4f`, `#74c69d`)

---

## 4. Custom Color Pickers & Species Customization

* **Custom Color Pickers:** Users can set custom primary and accent HEX values using interactive color pickers.
* **Species Persona Customizer:** Change mascot species persona (Puppy 🐶, Kitty 🐱, Fox 🦊, Custom ✨), custom species name, custom currency icon, praise terms, and profile avatar URL.
