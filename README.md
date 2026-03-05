# KainKlinikal 🥗

AI-powered Filipino nutrition advisor using Llama 3.2 3B Instruct via OpenRouter.

## Prerequisites

You need Node.js installed on your computer.

### Install Node.js (First Time Only)

1. Go to [https://nodejs.org](https://nodejs.org)
2. Download the **LTS version** (recommended)
3. Run the installer and follow the steps
4. Restart your computer after installation

To verify installation, open Command Prompt and type:
```cmd
node --version
npm --version
```

## How to Run the Program

### Step 1: Open Command Prompt in Project Folder

**Option A: From File Explorer**
1. Open the folder: `C:\Users\63908\Desktop\Data Workspace\kainklinikal`
2. Type `cmd` in the address bar at the top
3. Press Enter

**Option B: From Start Menu**
1. Press `Win + R`
2. Type `cmd` and press Enter
3. Navigate to project:
```cmd
cd "C:\Users\63908\Desktop\Data Workspace\kainklinikal"
```

### Step 2: Install Dependencies (First Time Only)
```cmd
npm install
```
Wait for it to finish (may take 1-2 minutes).

### Step 3: Run the Development Server
```cmd
npm run dev
```

### Step 4: Open in Browser
You'll see something like:
```
  VITE v5.4.0  ready in 500 ms

  ➜  Local:   http://localhost:5173/
```

Open your browser and go to: **http://localhost:5173/**

### To Stop the Server
Press `Ctrl + C` in the Command Prompt

### Deploy to Vercel
See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions.

**Quick steps:**
1. Push to GitHub
2. Import to Vercel
3. Add environment variable: `OPENROUTER_API_KEY`
4. Deploy!

## Environment Variables

### Local (.env.local)
```
VITE_OPENROUTER_API_KEY=your-key-here
```

### Vercel (Dashboard → Settings → Environment Variables)
```
OPENROUTER_API_KEY=your-key-here
```

## Tech Stack
- React + Vite
- Llama 3.2 3B Instruct (via OpenRouter)
- Vercel Serverless Functions

## Security
- ✅ Production: API key hidden on server
- ⚠️ Development: API key in browser (local only)


---

## Troubleshooting

### "npm is not recognized"
- You need to install Node.js first (see Prerequisites above)
- Restart your computer after installing Node.js

### Port already in use
If you see "Port 5173 is already in use", try:
```cmd
npm run dev -- --port 3000
```

### API Key Error
Make sure `.env.local` exists with your OpenRouter API key:
```
VITE_OPENROUTER_API_KEY=sk-or-v1-your-key-here
```

---

## For Vercel Deployment

See the deployment section below for deploying to production.
