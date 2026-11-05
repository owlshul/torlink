#!/bin/bash
# Torlink Automatic Startup Updater

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$DIR"

# Ensure dependencies and global binary are installed
if [ ! -d "node_modules" ] || ! command -v torlnk &>/dev/null; then
    echo "Setting up Torlink..."
    npm install --ignore-scripts && npm run build && npm install -g .
fi

# If dist doesn't exist, build it
if [ ! -d "dist" ]; then
    npm run build && npm install -g .
fi
