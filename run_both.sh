#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
BACKEND_DIR="$ROOT_DIR/backend"
FRONTEND_DIR="$ROOT_DIR/frontend"

# Ensure backend venv exists
if [ ! -x "$BACKEND_DIR/.venv/bin/python" ]; then
  echo "Creating Python venv in $BACKEND_DIR/.venv..."
  python3 -m venv "$BACKEND_DIR/.venv"
  "$BACKEND_DIR/.venv/bin/python" -m pip install --upgrade pip setuptools wheel
  echo "Installing backend Python dependencies (may take a while)..."
  # Install third-party dependencies only (skip stdlib entries like asyncio/logging)
  "$BACKEND_DIR/.venv/bin/pip" install scapy==2.5.0 joblib==1.3.2 websockets==12.0 numpy==1.26.4 scikit-learn==1.4.0 xgboost
fi

# Request sudo once so packet capture can open /dev/bpf* on macOS
echo "The backend needs root to capture packets. You will be prompted for your password (sudo)."
sudo -v || { echo "Cannot obtain sudo credentials. Exiting."; exit 1; }

# Start backend in background (logs -> backend/backend_run.log)
echo "Starting backend (packet_detection.py) in background..."
sudo "$BACKEND_DIR/.venv/bin/python" "$BACKEND_DIR/packet_detection.py" > "$BACKEND_DIR/backend_run.log" 2>&1 &
BACKEND_PID=$!
echo "Backend started (PID $BACKEND_PID). Logs: $BACKEND_DIR/backend_run.log"

# Start frontend in foreground so you can see Vite output
echo "Starting frontend dev server (foreground)..."
cd "$FRONTEND_DIR"
npm run dev
