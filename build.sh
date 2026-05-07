#!/usr/bin/env bash
set -e

echo "=== Установка Node.js через nvm ==="
export NVM_DIR="$HOME/.nvm"
if [ ! -d "$NVM_DIR" ]; then
  curl -fsSL https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
fi
source "$NVM_DIR/nvm.sh"
nvm install 20
nvm use 20

echo "=== Сборка фронтенда ==="
cd frontend
npm install
npm run build
cd ..

echo "=== Установка Python-зависимостей ==="
cd backend
pip install -r requirements.txt
cd ..

echo "=== Сборка завершена ==="
