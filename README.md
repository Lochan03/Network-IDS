# Network Intrusion Detection System (Cyber-Pulse NIDS)

A real-time Network Intrusion Detection System with an XGBoost-powered backend and a React/TypeScript dashboard.

---

## Prerequisites

| Tool | Version |
|------|---------|
| Python | 3.10 + |
| Node.js | 18 + |
| npm | 9 + |

> **macOS / Linux** — no extra steps needed for PCAP replay mode.  
> **Live sniffing** (optional) requires `sudo` to open raw network sockets.

---

## Quick Start

```bash
# Clone and enter the repo
git clone <repo-url>
cd Network-IDS

# Run both backend and frontend (PCAP replay mode — no sudo needed)
./run_both.sh
```

The launcher script (`run_both.sh`) will:
1. Create a Python virtual environment in `backend/.venv` and install dependencies (first run only).
2. Install frontend npm dependencies (first run only).
3. Generate a small test PCAP file if none exists.
4. Start the WebSocket backend on **ws://localhost:8765**.
5. Start the Vite dev server — open **http://localhost:8080/dashboard** in your browser.

Press **Ctrl + C** to stop both processes.

---

## Run Modes

```bash
# Default — replay a test PCAP (no root required)
./run_both.sh

# Replay a specific PCAP file
./run_both.sh pcap /path/to/capture.pcap

# Live sniffing (requires sudo on macOS/Linux)
./run_both.sh live
```

---

## Project Structure

```
Network-IDS/
├── backend/
│   ├── packet_detection.py   # WebSocket server + XGBoost inference
│   ├── create_test_pcap.py   # Utility to generate a test PCAP
│   ├── requirements.txt
│   ├── nids_xgboost_model3.pkl
│   ├── nids_scaler3.pkl
│   └── nids_feature_columns3.pkl
├── frontend/
│   └── src/
│       └── pages/
│           └── Dashboard.tsx  # Live threat dashboard
└── run_both.sh               # One-command launcher
```

---

## Manual Setup (without `run_both.sh`)

```bash
# Backend
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

# Generate a test PCAP then start the backend
python create_test_pcap.py --out test_traffic.pcap
python packet_detection.py --pcap test_traffic.pcap --loop 10 --delay 0.05

# Frontend (separate terminal)
cd frontend
npm install
npm run dev
```
