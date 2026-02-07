# 🎵 Tiny Desk Guest Manager

A personal app to manage your +1 invites to NPR Tiny Desk concerts. Runs on your phone and desktop.

## Features

- **Guest list** with fair rotation queue (least-attended guests get priority)
- **One-tap blast** to eligible guests only via text or email
- **RSVP recording** — tap names in order as people respond
- **Auto-slot assignment** — first 2 confirmed, 3rd is alternate
- **Reminder center** — pre-written day-before and morning-of messages with copy/text/email buttons
- **Attendance tracking** — after each concert, guests move to back of the queue

---

## Deploy to Your Phone & Desktop (10 minutes)

### Step 1: Create a GitHub account (skip if you have one)
1. Go to [github.com](https://github.com) and sign up (free)

### Step 2: Create a new repository
1. Click the **+** in the top right → **New repository**
2. Name it `tinydesk` (or whatever you like)
3. Keep it **Public** (required for free Vercel hosting)
4. Click **Create repository**

### Step 3: Upload the project files
1. On your new repo page, click **"uploading an existing file"**
2. Drag and drop ALL the files/folders from this project:
   - `package.json`
   - `vite.config.js`
   - `index.html`
   - `.gitignore`
   - `public/` folder (with manifest.json, icons)
   - `src/` folder (with main.jsx, App.jsx)
3. Click **Commit changes**

### Step 4: Deploy on Vercel (free)
1. Go to [vercel.com](https://vercel.com) → **Sign Up** with your GitHub account
2. Click **Add New → Project**
3. Find and select your `tinydesk` repository
4. Framework: it should auto-detect **Vite**
5. Click **Deploy**
6. Wait ~60 seconds. You'll get a URL like `tinydesk-abc123.vercel.app`

### Step 5: Add to your phone
1. Open the Vercel URL in Safari (iPhone) or Chrome (Android)
2. **iPhone:** Tap the Share button → **Add to Home Screen**
3. **Android:** Tap the three-dot menu → **Add to Home Screen**
4. It now lives on your home screen like a real app!

### Step 6: Add to desktop (optional)
1. Open the URL in Chrome
2. Click the install icon in the address bar (or three-dot menu → **Install app**)

---

## How to Use

### Your workflow:
1. **Add guests** to the Guest List tab (name + phone and/or email)
2. **Add a concert** when you learn about one
3. **Blast** → opens pre-filled text/email to eligible guests only
4. **Record RSVPs** as people text you back (tap their name in order)
5. **Send reminders** the day before and morning of
6. **Complete** the concert → attendance updates, queue rotates

### The queue system:
- Everyone starts at 0 attended
- After attending, a guest goes to the bottom
- Guests with more attendance than others are marked "Must wait" and excluded from blasts
- Once everyone has attended equally, the slate resets and everyone is eligible again

---

## Customization

- **App icon:** Replace `public/icon-192.png` and `public/icon-512.png` with any image you want
- **App name:** Edit `public/manifest.json` to change the home screen name
- **Colors:** Edit the `P` object in `src/App.jsx`

---

## Technical Details

- Built with React + Vite
- All data stored in localStorage (your browser, your device)
- No backend, no accounts, no monthly costs
- Works offline after first load (PWA)
- Mobile-responsive design
