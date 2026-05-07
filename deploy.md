# Деплой на Render: FastAPI + React в одном сервисе

## Архитектура

Один Python Web Service на Render:
- FastAPI отдаёт React-сборку как статику (`frontend/dist`)
- FastAPI обслуживает `/api/*` эндпоинты
- Не нужны два сервиса, один URL для всего

---

## Настройки сервиса в Render

| Поле | Значение |
|------|---------|
| **Environment** | Python |
| **Build Command** | `bash build.sh` |
| **Start Command** | `cd backend && uvicorn app.main:app --host 0.0.0.0 --port $PORT` |
| **Root Directory** | *(пусто — корень репозитория)* |

---

## Ключевые файлы

### `build.sh` (в корне репозитория)

```bash
#!/usr/bin/env bash
set -e

# Render устанавливает Node.js в /opt/render/project/nodes/
# .node-version задаёт версию, но в PATH нужно добавить вручную
for dir in /opt/render/project/nodes/node-*/bin; do
  [ -d "$dir" ] && export PATH="$dir:$PATH"
done

echo "Node: $(node --version)"
echo "npm:  $(npm --version)"

echo "=== npm install ==="
cd frontend
npm install 2>&1
echo "=== npm run build ==="
npm run build 2>&1
cd ..

echo "=== pip install ==="
pip install -r backend/requirements.txt
```

### `.node-version` (в корне репозитория)

```
20
```

### `.python-version` (в корне репозитория)

```
3.11
```

### `frontend/package.json` — скрипт build

```json
"scripts": {
  "build": "vite build"
}
```

> **Важно:** не использовать `tsc && vite build` — `tsc` делает typecheck и падает на любую TS-ошибку. Vite сам транспилирует TypeScript через esbuild без typecheck.

### `backend/app/main.py` — раздача статики

```python
from pathlib import Path
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

STATIC_DIR = Path(__file__).parent.parent.parent / "frontend" / "dist"

if STATIC_DIR.exists():
    app.mount("/assets", StaticFiles(directory=STATIC_DIR / "assets"), name="assets")

    @app.get("/{full_path:path}", include_in_schema=False)
    async def serve_frontend(full_path: str) -> FileResponse:
        file = STATIC_DIR / full_path
        if file.is_file():
            return FileResponse(file)
        return FileResponse(STATIC_DIR / "index.html")
```

---

## Переменные окружения в Render Dashboard

Установить в **Environment → Environment Variables**:

| Переменная | Где получить |
|-----------|-------------|
| `OPENROUTER_API_KEY` | openrouter.ai/keys |
| `TWOGIS_API_KEY` | dev.2gis.ru |

`FRONTEND_URL` и `VITE_API_URL` оставить пустыми — фронт и бэк на одном домене.

---

## Частые ошибки и решения

### `npm: не найден` / `Exited with status 2` сразу после Node detection

**Причина:** Render добавляет Node.js в PATH асинхронно при старте build-команды. Когда команда уже запустилась, npm ещё не в PATH.

**Решение:** в `build.sh` явно добавить Render-путь к Node.js:
```bash
for dir in /opt/render/project/nodes/node-*/bin; do
  [ -d "$dir" ] && export PATH="$dir:$PATH"
done
```

### `Could not open requirements file: requirements.txt`

**Причина:** Render запускает команды из корня репо, а `requirements.txt` лежит в `backend/`.

**Решение:** использовать `bash build.sh` и внутри скрипта делать `pip install -r backend/requirements.txt`.

### Сборка падает без вывода ошибки

**Причина:** stderr не пробрасывается в лог.

**Решение:** добавить `2>&1` к командам в `build.sh`:
```bash
npm install 2>&1
npm run build 2>&1
```

### TypeScript build завершается с кодом 2

**Причина:** `tsc` с флагами `noUnusedLocals`, `noUnusedParameters` или `strict: true` падает на любую мелкую TS-ошибку.

**Решение:** убрать `tsc` из npm build-скрипта, использовать только `vite build`. В `tsconfig.json` убрать `strict: true`.

---

## Порядок первого деплоя

1. Создать **Web Service** → выбрать репозиторий
2. Environment: **Python**
3. Branch: нужная ветка
4. Build Command: `bash build.sh`
5. Start Command: `cd backend && uvicorn app.main:app --host 0.0.0.0 --port $PORT`
6. Добавить переменные окружения
7. **Deploy**
