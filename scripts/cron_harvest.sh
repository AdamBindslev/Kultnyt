#!/bin/bash
export PATH="$HOME/.local/bin:/usr/local/bin:/usr/bin:/bin:$PATH"

# Ensure Ollama is running
if ! curl -s http://localhost:11434/api/tags >/dev/null 2>&1; then
    echo "[$(date)] Starter Ollama i baggrunden..."
    open -a Ollama --args hidden 2>/dev/null || true
    sleep 4
fi

cd "/Users/familie/Desktop/ Kultnyt" || exit 1

echo "[$(date)] Starter automatisk Kultnyt høst..."
/usr/bin/python3 scripts/harvest.py --limit 4 --git-push >> harvest.log 2>&1
echo "[$(date)] Høst og git-push fuldført."
