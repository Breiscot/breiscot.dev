#!/usr/bin/env bash
# Starts (or restarts) the local preview server.
# One repo, one domain — all three sites are sub-paths of it:
#   http://127.0.0.1:8765/               -> breiscot.dev (main)
#   http://127.0.0.1:8765/breiscot.art/  -> drawings
#   http://127.0.0.1:8765/breiscot.me/   -> about
set -u

BASE="$(cd "$(dirname "$0")" && pwd)"
PORT=8765
LOG=/tmp/breiscot-http.log

# already running? (must answer 200 — a stale server can 404 after a folder move)
code=$(curl -s -o /dev/null -w '%{http_code}' --max-time 1 "http://127.0.0.1:$PORT/" 2>/dev/null)
if [ "$code" = "200" ]; then
  echo "port $PORT: already running"
else
  # kill anything stale or half-dead on that port
  fuser -k "$PORT/tcp" 2>/dev/null
  sleep 0.3
  cd "$BASE" || exit 1
  setsid nohup python3 -m http.server "$PORT" --bind 127.0.0.1 \
    > "$LOG" 2>&1 < /dev/null &
  echo "port $PORT: started"
  sleep 1
fi

echo ""
echo "Open in your browser:"
echo "  http://127.0.0.1:8765/               (breiscot.dev)"
echo "  http://127.0.0.1:8765/breiscot.art/  (breiscot.art)"
echo "  http://127.0.0.1:8765/breiscot.me/   (breiscot.me)"
