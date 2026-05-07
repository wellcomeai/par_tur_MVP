#!/usr/bin/env bash
set -e

# Render устанавливает Node.js в /opt/render/project/nodes/ — добавим в PATH
for dir in /opt/render/project/nodes/node-*/bin; do
  [ -d "$dir" ] && export PATH="$dir:$PATH"
done

echo "=== Диагностика ==="
echo "Node: $(node --version 2>/dev/null || echo 'НЕ НАЙДЕН')"
echo "npm:  $(npm --version 2>/dev/null || echo 'НЕ НАЙДЕН')"
echo "pwd:  $(pwd)"
echo "ls:   $(ls)"

echo "=== Сборка фронтенда ==="
cd frontend
npm install
npm run build
cd ..

echo "=== Python зависимости ==="
pip install -r backend/requirements.txt

echo "=== Готово ==="
