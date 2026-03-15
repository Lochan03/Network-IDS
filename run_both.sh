#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
BACKEND_DIR="$ROOT_DIR/backend"
FRONTEND_DIR="$ROOT_DIR/frontend"

# ── Colour helpers ──────────────────────────────────────────────────────────
RED='\033[0;31m'; GREEN='\033[0;32m'; CYAN='\033[0;36m'
YELLOW='\033[1;33m'; BOLD='\033[1m'; RESET='\033[0m'

info()    { echo -e "${CYAN}[INFO]${RESET}  $*"; }
success() { echo -e "${GREEN}[OK]${RESET}    $*"; }
warn()    { echo -e "${YELLOW}[WARN]${RESET}  $*"; }
error()   { echo -e "${RED}[ERROR]${RESET} $*"; }

echo -e "${BOLD}"
echo "  ╔═══════════════════════════════════════════╗"
echo "  ║        Cyber-Pulse NIDS — Launcher        ║"
echo "  ╚═══════════════════════════════════════════╝"
echo -e "${RESET}"

# ── 1. Backend Python environment ──────────────────────────────────────────
if [ ! -x "$BACKEND_DIR/.venv/bin/python" ]; then
  info "Creating Python virtual environment in $BACKEND_DIR/.venv …"
  python3 -m venv "$BACKEND_DIR/.venv"
  "$BACKEND_DIR/.venv/bin/pip" install --upgrade pip setuptools wheel --quiet
  info "Installing backend Python dependencies (this may take a minute) …"
  # Note: asyncio & logging are stdlib — we skip their pip versions
  "$BACKEND_DIR/.venv/bin/pip" install --quiet \
    "scapy==2.5.0" "joblib==1.3.2" "websockets==12.0" \
    "numpy" "scikit-learn==1.4.0" "xgboost"
  success "Backend dependencies installed."
fi

# ── 2. Fix libomp on macOS (required by XGBoost on Apple Silicon) ─────────
XGBOOST_LIB="$BACKEND_DIR/.venv/lib/python3*/site-packages/xgboost/lib"
XGBOOST_DYLIB=$(ls $XGBOOST_LIB/libxgboost.dylib 2>/dev/null | head -1 || true)
if [[ -n "$XGBOOST_DYLIB" && ! -f "$(dirname "$XGBOOST_DYLIB")/libomp.dylib" ]]; then
  warn "libomp.dylib not found alongside libxgboost.dylib — XGBoost may fail."
  warn "Fix: install Homebrew then run:  brew install libomp"
fi

# ── 3. Frontend npm dependencies ───────────────────────────────────────────
if [ ! -d "$FRONTEND_DIR/node_modules" ]; then
  info "Installing frontend npm dependencies …"
  cd "$FRONTEND_DIR" && npm install --silent && cd "$ROOT_DIR"
  success "Frontend dependencies installed."
fi

# ── 4. Mode selection ──────────────────────────────────────────────────────
MODE="${1:-pcap}"   # default: pcap (no sudo needed)
PCAP_FILE="${2:-}"  # optional path to pcap

if [[ "$MODE" == "live" ]]; then
  info "Mode: LIVE sniffing (requires sudo for /dev/bpf* on macOS)"
  sudo -v || { error "Cannot obtain sudo credentials."; exit 1; }
  BACKEND_CMD="sudo '$BACKEND_DIR/.venv/bin/python' '$BACKEND_DIR/packet_detection.py'"
elif [[ "$MODE" == "pcap" ]]; then
  PCAP="${PCAP_FILE:-$BACKEND_DIR/test_traffic.pcap}"
  # Auto-generate a test pcap if none exists
  if [[ ! -f "$PCAP" ]]; then
    info "No PCAP file found — generating a test one with create_test_pcap.py …"
    "$BACKEND_DIR/.venv/bin/python" "$BACKEND_DIR/create_test_pcap.py" \
      --out "$BACKEND_DIR/test_traffic.pcap" 2>/dev/null || true
    if [[ ! -f "$BACKEND_DIR/test_traffic.pcap" ]]; then
      warn "Could not auto-generate test PCAP. Pass an existing file:"
      warn "  ./run_both.sh pcap /path/to/your.pcap"
      info "Starting backend anyway — it will wait for a pcap file."
    fi
    PCAP="$BACKEND_DIR/test_traffic.pcap"
  fi
  BACKEND_CMD="'$BACKEND_DIR/.venv/bin/python' '$BACKEND_DIR/packet_detection.py' --pcap '$PCAP' --loop 10 --delay 0.05"
else
  error "Unknown mode '$MODE'. Use:  ./run_both.sh [live|pcap] [pcap-file]"
  exit 1
fi

# ── 5. Start backend ───────────────────────────────────────────────────────
info "Starting backend (WebSocket on ws://localhost:8765) …"
eval "$BACKEND_CMD" > "$BACKEND_DIR/backend_run.log" 2>&1 &
BACKEND_PID=$!
success "Backend running (PID $BACKEND_PID)  →  logs: $BACKEND_DIR/backend_run.log"

cleanup() {
  echo ""
  info "Shutting down …"
  kill "$BACKEND_PID" 2>/dev/null || true
  [[ -n "${FRONTEND_PID:-}" ]] && kill "$FRONTEND_PID" 2>/dev/null || true
}
trap cleanup EXIT INT TERM

# Give the WebSocket server a moment to start
sleep 1.5

# ── 6. Start frontend ──────────────────────────────────────────────────────
info "Starting frontend dev server on http://localhost:8080 …"
echo ""
echo -e "${BOLD}  ┌─────────────────────────────────────────┐"
echo    "  │  Dashboard → http://localhost:8080/dashboard"
echo -e "  └─────────────────────────────────────────┘${RESET}"
echo ""

cd "$FRONTEND_DIR" && npm run dev

