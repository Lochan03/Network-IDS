# Run Commands

## Prerequisites

### 1. Install Node.js (via nvm)
```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
export NVM_DIR="$HOME/.nvm" && \. "$NVM_DIR/nvm.sh"
nvm install --lts
```

### 2. Fix XGBoost libomp (macOS — one-time fix)
```bash
install_name_tool -add_rpath @loader_path \
  backend/.venv/lib/python3*/site-packages/xgboost/lib/libxgboost.dylib
```

### 3. Install backend Python dependencies (if not already)
```bash
python3 -m venv backend/.venv
backend/.venv/bin/pip install --quiet \
  "scapy==2.5.0" "joblib==1.3.2" "websockets==12.0" \
  "numpy" "scikit-learn==1.4.0" "xgboost"
```

### 4. Install frontend dependencies (if not already)
```bash
export NVM_DIR="$HOME/.nvm" && \. "$NVM_DIR/nvm.sh"
cd frontend && npm install && cd ..
```

---

## Start the Project

### Terminal 1 — Backend (WebSocket server)
```bash
python packet_detection.py --pcap test_traffic.pcap --loop 10 --delay 0.05
```

### Terminal 2 — Frontend (Vite dev server)
```bash
export NVM_DIR="$HOME/.nvm" && \. "$NVM_DIR/nvm.sh"
cd frontend
npm run dev
```

---

## Access
- **Dashboard** → http://localhost:8080/dashboard
- **Backend WebSocket** → ws://localhost:8765

---

## Live Sniffing Mode (requires sudo)
```bash
sudo backend/.venv/bin/python backend/packet_detection.py
```
