#!/usr/bin/env bash
set -e

# Render устанавливает Node.js в /opt/render/project/nodes/
for dir in /opt/render/project/nodes/node-*/bin; do
  [ -d "$dir" ] && export PATH="$dir:$PATH"
done

echo "Node: $(node --version 2>/dev/null || echo 'НЕ НАЙДЕН')"
echo "npm:  $(npm --version 2>/dev/null || echo 'НЕ НАЙДЕН')"

echo "=== npm install ==="
cd frontend
npm install 2>&1
echo "=== npm run build ==="
npm run build 2>&1
cd ..

echo "=== pip install ==="
pip install -r backend/requirements.txt

echo "=== Готово ==="
