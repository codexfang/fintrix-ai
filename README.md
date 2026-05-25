# Fintrix AI

Fintrix AI is a high-fidelity financial intelligence dashboard that analyzes financial news headlines and predicts their market impact across major sectors (Tech, Banking, Energy, Healthcare, Consumer). It acts as a simplified Bloomberg-style "Market Impact Terminal" for retail traders and analysts.

## Core Features

- **Lightweight NLP Engine**: Keyword-based and phrase-matching scoring logic matching headlines against an 819-event database.
- **Dynamic Numeric Multiplier**: Multiplies and scales sector shifts proportionally when basis points (e.g. `25bps`, `50 basis points`) or percentages (e.g. `2.5%`) are found in the headline.
- **Grouped Performance Charts**: High-fidelity dual-bar charts comparing two headlines side-by-side.
- **Delta Spreads**: Computes exact percentage performance difference between two headlines.
- **Persistent Search History**: Caches analyzed headlines locally in the browser's `localStorage`.
- **Theme Flexibility**: Bloomberg-style dark terminal mode or clean corporate light mode.
- **PDF Report Export**: Hidden elements automatically disappear when printed, formatting the dashboard into a professional "Fintrix AI Market Report".

## Tech Stack

- **Frontend Core**: React 19 & TypeScript
- **Bundler & Dev Server**: Vite
- **Data Visualization**: Chart.js & `react-chartjs-2`
- **Iconography**: Lucide React
- **Styling**: Vanilla CSS 

## License

MIT