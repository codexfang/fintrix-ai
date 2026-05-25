# Fintrix AI 🚀

Fintrix AI is a high-fidelity financial intelligence dashboard that analyzes financial news headlines and predicts their market impact across major sectors (Tech, Banking, Energy, Healthcare, Consumer). It acts as a simplified Bloomberg-style "Market Impact Terminal" for retail traders and analysts.

## 🧠 Features

- **Lightweight NLP Classification Engine**: A custom keyword and phrase matching logic scoring headlines against an 800+ event database.
- **Dynamic Numeric Multiplier**: Scales sector outputs proportionally when specific percentages (e.g. `+5%`) or basis points (e.g. `50bps`) are parsed.
- **Grouped Visualization Profile**: Integrates standard bar charts using Chart.js to render predicted percentage movements per sector.
- **Headline Comparison Mode**: Enables side-by-side analysis, calculating delta spreads, and grouped visualization outputs.
- **Persistent Local History**: Saves your previous searches in `localStorage` for rapid reloading.
- **Aesthetic Flexibility**: Toggles between a clean corporate Light mode (clean grid layout, soft shadows) and a sleek Dark Terminal mode.
- **High-Fidelity PDF Export**: A custom print stylesheet formats the terminal results into a clean market analyst report layout when printed or saved as PDF.

---

## 🧱 Project Directory Structure

```text
/src
  /components
    Header.tsx                # Terminal header, live UTC clock, theme switcher
    InputPanel.tsx            # Controls, preset panels, search history list
    ResultsDashboard.tsx      # Radial confidence meter, bar charts, historical analogues
    ComparisonDashboard.tsx   # Dual column metrics, delta spreadsheet, grouped bar chart
  /engine
    marketEngine.ts           # NLP classification, scaling arithmetic, and results compiling
  /data
    generateDataset.cjs       # Node dataset generator script (synthesizes 800+ event entries)
    marketEvents.json         # Compiled event patterns dataset mapping to sector weights
  App.tsx                     # Main layout coordinator and simulation loaders
  main.tsx                    # React rendering entry
  index.css                   # Design tokens, custom grid patterns, and print rules
index.html                    # SEO headers, viewport scaling, fonts import
vite.config.ts                # Base path configurations for static GitHub Pages builds
```

---

## ⚡ Setup & Development

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Local Development Server
```bash
npm run dev
```

### 3. Compile Production Static Bundle
```bash
npm run build
```

---

## 🌐 Deployment to GitHub Pages

Fintrix AI is fully configured for static deployment. The `vite.config.ts` includes `base: '/fintrix-ai/'`.

### Deploy command using `gh-pages`
1. Install package: `npm install -D gh-pages`
2. Add scripts to `package.json`:
   ```json
   "predeploy": "npm run build",
   "deploy": "gh-pages -d dist"
   ```
3. Run deploy:
   ```bash
   npm run deploy
   ```
This will automatically push the built static assets in the `/dist` directory to the `gh-pages` branch on GitHub, rendering it live at `https://codexfang.github.io/fintrix-ai/`.
