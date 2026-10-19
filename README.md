# FuelLedger AI ⛽⚡

> Offline-first ERP & intelligent AI copilot engineered for independent fuel and service stations. Powered by open-weight models (`gemma3:4b` via Ollama) with 100% data sovereignty.

![FuelLedger AI Banner](https://raw.githubusercontent.com/Harshvyavahare11/FuelLedger/main/public/fuelledger-preview.png)

---

## 🌟 Overview

Running an independent petrol/fuel station is a high-volume, thin-margin, operationally complex business. Independent station owners grapple with shift handovers, dispenser dip variations, EV charging slot tracking, and critical payment reconciliation mismatches between cash, POS cards, and UPI rails.

**FuelLedger AI** brings modern ledger automation and edge AI intelligence right to the station counter:
- **Zero Recurring Cloud AI Bills**: Local inference powered by open-weight models (Google Gemma 3 / Meta Llama 3 via Ollama).
- **100% Privacy & Data Sovereignty**: All sales logs, bank reconciliations, employee shifts, and inventory records remain strictly on-device.
- **Resilient Offline Architecture**: Operates without constant internet connectivity. Seamlessly falls back to an offline heuristic demo engine when Ollama is unavailable.

---

## 🚀 Key Features

- **⛽ Fuel Sales Management**: Record nozzle readings, pump shifts, and fuel volumes for Petrol, High-Speed Diesel (HSD), and CNG.
- **🔍 3-Way Payment Reconciliation**: Compare physical dispenser totals against Cash handovers, Card POS, and UPI settlement credits to automatically catch bank gateway drops or employee shortages.
- **📦 Smart Inventory & Dip Tracking**: Monitor fuel tanks, compute dip variance, track delivery receipts, and trigger automated low-stock and reorder alerts.
- **⚡ EV Charging Bays**: Unified logging for electric vehicle charging slots alongside conventional fuel dispensers.
- **👥 Employee & Shift Management**: Track pump attendants, cash collections per nozzle, and shift sign-offs.
- **🤖 On-Device AI Copilot**:
  - Conversational business queries (e.g. *"Show me this week's diesel revenue"*, *"Explain the UPI discrepancy"*).
  - Natural-language transaction intent parsing (`"Logged 45L diesel paid via UPI"` → instant transaction draft).
  - Demand forecasting & reorder quantity recommendations.
- **📊 Reports & Exports**: Shift-wise summaries and daily operational reports ready for statutory petroleum compliance audits.

---

## 🛠️ Tech Stack

- **Framework**: [React 19](https://react.dev/) + [Vite](https://vite.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Visualizations**: [Recharts](https://recharts.org/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Persistence**: LocalStorage & IndexedDB (Offline-first)
- **Local AI Engine**: [Ollama](https://ollama.com/) running `gemma3:4b` or `llama3.2:3b`

---

## ⚡ Quick Start

### 1. Clone & Install Dependencies

```bash
git clone https://github.com/Harshvyavahare11/FuelLedger.git
cd FuelLedger
npm install
```

### 2. (Optional) Run Local AI with Ollama

To enable live local AI inference:

1. Install [Ollama](https://ollama.com/).
2. Pull the Gemma 3 (4B) model:
   ```bash
   ollama pull gemma3:4b
   ```
3. Ensure Ollama is running (`http://localhost:11434`).
4. Set environment variables (optional, defaults to `localhost:11434` and `gemma3:4b`):
   ```bash
   # .env
   VITE_OLLAMA_URL=http://localhost:11434
   VITE_OLLAMA_MODEL=gemma3:4b
   ```

> **Note**: If Ollama is not installed or running, FuelLedger AI automatically operates in **Demo Mode**, answering common station questions using built-in domain responses.

### 3. Launch Development Server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 📁 Project Structure

```
fuelledger-ai/
├── src/
│   ├── components/         # Reusable UI cards, tables, charts, forms
│   │   ├── charts/         # Sales & inventory recharts
│   │   ├── forms/          # Fuel sale, delivery, EV charging forms
│   │   ├── layout/         # AppLayout, Sidebar, TopBar
│   │   └── ui/             # Buttons, badges, modals, empty states
│   ├── context/            # Global application state
│   ├── data/               # Seed operational data for demonstration
│   ├── pages/              # Dashboard, FuelSales, Inventory, Payments, EVCharging, Reports, AIAssistant
│   ├── services/
│   │   ├── aiService.js    # Local Ollama REST client & fallback demo heuristics
│   │   └── localStorageService.js # Local persistence layer
│   ├── utils/              # Formatting helpers (INR ₹, dates, fuel units)
│   ├── App.jsx             # Router configuration
│   └── main.jsx            # Entry point
├── package.json
└── vite.config.js
```

---

## 📜 License

This project is open-source under the [MIT License](LICENSE).
