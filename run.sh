#!/usr/bin/env bash

set -Eeuo pipefail

# Always resolve paths from the script location so it works from any directory.
SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$SCRIPT_DIR"

# Default local values (can be overridden with flags or env vars).
HOST="${HOST:-127.0.0.1}"
PORT="${PORT:-3050}"
SKIP_BUILD=0
# If enabled, automatically select the next available port when PORT is busy.
AUTO_PORT="${AUTO_PORT:-1}"

usage() {
  cat <<'EOF'
Usage: ./run.sh [options]

Options:
  -p, --port <port>   Port for local server (default: 3050)
  -h, --host <host>   Bind host (default: 127.0.0.1)
      --no-build      Skip js/config.js generation
      --strict-port   Fail if selected port is already in use
      --help          Show this help

Examples:
  ./run.sh
  ./run.sh --port 8000
  HOST=0.0.0.0 PORT=3050 ./run.sh
EOF
}

is_integer() {
  [[ "$1" =~ ^[0-9]+$ ]]
}

can_bind_port() {
  local host="$1"
  local port="$2"

  "$PYTHON_CMD" - "$host" "$port" <<'PY' >/dev/null 2>&1
import socket
import sys

host = sys.argv[1]
port = int(sys.argv[2])

sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
try:
    sock.bind((host, port))
except OSError:
    sys.exit(1)
finally:
    sock.close()

sys.exit(0)
PY
}

find_next_available_port() {
  local host="$1"
  local start_port="$2"
  local max_port=65535

  local candidate=$((start_port + 1))
  while [[ "$candidate" -le "$max_port" ]]; do
    if can_bind_port "$host" "$candidate"; then
      echo "$candidate"
      return 0
    fi
    candidate=$((candidate + 1))
  done

  return 1
}

# Convenience: allow one positional port argument (e.g. ./run.sh 8000).
if [[ $# -eq 1 ]] && is_integer "$1"; then
  PORT="$1"
  shift
fi

while [[ $# -gt 0 ]]; do
  case "$1" in
    -p|--port)
      [[ $# -ge 2 ]] || { echo "Error: missing value for $1"; exit 1; }
      PORT="$2"
      shift 2
      ;;
    -h|--host)
      [[ $# -ge 2 ]] || { echo "Error: missing value for $1"; exit 1; }
      HOST="$2"
      shift 2
      ;;
    --no-build)
      SKIP_BUILD=1
      shift
      ;;
    --strict-port)
      AUTO_PORT=0
      shift
      ;;
    --help)
      usage
      exit 0
      ;;
    *)
      echo "Error: unknown option '$1'"
      usage
      exit 1
      ;;
  esac
done

if ! is_integer "$PORT" || [[ "$PORT" -lt 1 || "$PORT" -gt 65535 ]]; then
  echo "Error: port must be an integer between 1 and 65535."
  exit 1
fi

if command -v python3 >/dev/null 2>&1; then
  PYTHON_CMD="python3"
elif command -v python >/dev/null 2>&1; then
  PYTHON_CMD="python"
else
  echo "Error: Python is required but was not found (python3/python)."
  exit 1
fi

if ! is_integer "$AUTO_PORT" || [[ "$AUTO_PORT" -lt 0 || "$AUTO_PORT" -gt 1 ]]; then
  echo "Error: AUTO_PORT must be 0 or 1."
  exit 1
fi

if [[ "$SKIP_BUILD" -eq 0 ]]; then
  if ! command -v node >/dev/null 2>&1; then
    echo "Error: Node.js is required to generate config.js."
    exit 1
  fi

  if [[ ! -f "$PROJECT_DIR/.env" ]]; then
    echo "Error: .env not found in $PROJECT_DIR"
    echo "Copy .env.example to .env and fill in your values."
    exit 1
  fi

  echo "Generating js/config.js from .env..."
  (cd "$PROJECT_DIR" && node build-config.js)
else
  if [[ ! -f "$PROJECT_DIR/js/config.js" ]]; then
    echo "Error: js/config.js not found. Run without --no-build first."
    exit 1
  fi
fi

# Prevent hard crash when the selected port is already in use.
if ! can_bind_port "$HOST" "$PORT"; then
  if [[ "$AUTO_PORT" -eq 1 ]]; then
    NEXT_PORT="$(find_next_available_port "$HOST" "$PORT" || true)"
    if [[ -z "${NEXT_PORT:-}" ]]; then
      echo "Error: port $PORT is busy and no free port was found up to 65535."
      exit 1
    fi
    echo "Warning: port $PORT is already in use."
    echo "Using next available port: $NEXT_PORT"
    PORT="$NEXT_PORT"
  else
    echo "Error: port $PORT is already in use."
    echo "Use a different port with --port <port> or enable auto-fallback (default)."
    exit 1
  fi
fi

echo
echo "Starting local server"
echo "- Root: $PROJECT_DIR"
echo "- URL:  http://$HOST:$PORT"
echo "Pages available:"
echo "- Landing:   http://$HOST:$PORT/index.html"
echo "- Thank-you: http://$HOST:$PORT/thank-you.html"
echo
echo "Press Ctrl+C to stop the server."

cd "$PROJECT_DIR"
exec "$PYTHON_CMD" -m http.server "$PORT" --bind "$HOST"
