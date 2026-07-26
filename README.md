# 🐾 Tamed (Puppy Schedule)

A polished, mobile-first web application designed for gamified behavior tracking, daily routines, and reward systems.

## ✨ Features

- **🛡️ Master / Owner Controls**: Daily calendar status logging (Green, Yellow, Red), points adjustment, reward store catalog management, daily routine creation, and praise transmitter.
- **🦊 Pet / Submissive Dashboard**: Interactive mascot avatar, level & XP progression bar, species custom currency (Bones 🦴, Fish 🐟, Berries 🫐, Stars ⭐), daily behavior codex routines, and reward store redemptions.
- **🎨 Scalable Aesthetic Themes**: Dynamic color personas (Puppy, Kitty, Fox, Custom Slate) with CSS variables.
- **🔊 Web Audio Synth & Particle Celebrations**: Playful chime sound effects and canvas confetti.
- **🗄️ Supabase Ready**: Includes full SQL schema (`supabase-schema.sql`) with Row-Level Security (RLS) policies and realtime subscription support.

---

## 🚀 Quick Start (Local Development)

```bash
# 1. Install dependencies
npm install

# 2. Run local development server
npm run dev
```

---

## 🗄️ Database Setup (Supabase)

1. Create a new project on [Supabase](https://supabase.com).
2. Go to **SQL Editor** -> click **New Query**.
3. Copy and paste the contents of `supabase-schema.sql` and run the script.
4. Go to **Project Settings** -> **API**.
5. Copy your **Project URL** and **Anon Public Key**.
6. Create a `.env` file in the root directory:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

---

## ☁️ Deploying to Cloudflare Pages

1. Push your repository to GitHub: `https://github.com/NottKoneko/Tamed.git`
2. Log into the [Cloudflare Dashboard](https://dash.cloudflare.com) -> **Workers & Pages**.
3. Click **Create Application** -> **Pages** -> **Connect to Git**.
4. Select repository: `NottKoneko/Tamed`.
5. Configure deployment settings:
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Build Output Directory**: `dist`
6. Under **Environment Variables**, add:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
7. Click **Save and Deploy**! 🎉
