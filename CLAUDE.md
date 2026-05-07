# ПарТур Агент — CLAUDE.md

## Описание проекта

Веб-сервис с чат-интерфейсом для подбора банных комплексов по России.
- **Backend**: FastAPI + SSE стриминг + agentic loop (OpenRouter DeepSeek)
- **Frontend**: React 18 + TypeScript + Tailwind + Zustand
- **Данные**: 2GIS Places API для поиска бань
- **Деплой**: Render.com (render.yaml)

## Структура

```
backend/app/
  main.py              — FastAPI app, CORS
  core/config.py       — pydantic-settings (.env)
  core/logger.py       — логгер
  api/routes/chat.py   — POST /api/chat (SSE), GET /api/health
  agents/partour_agent.py — agentic loop: LLM + tools
  agents/prompts.py    — system prompt
  tools/               — search_banyas, get_banya_details, build_route, compare_banyas
  services/twogis_client.py — 2GIS HTTP-клиент

frontend/src/
  App.tsx              — корневой компонент, шапка
  main.tsx             — entry point
  components/Chat/     — ChatWindow, MessageList, MessageBubble, InputBar
  components/BanyaCard.tsx, RouteCard.tsx, CompareTable.tsx — UI-компоненты данных
  services/api.ts      — SSE fetch-клиент
  store/chatStore.ts   — Zustand store
  types/index.ts       — TypeScript типы
```

## Переменные окружения

Backend `.env` (скопировать из `.env.example`):
- `OPENROUTER_API_KEY` — ключ OpenRouter
- `TWOGIS_API_KEY` — ключ 2GIS Places API
- `FRONTEND_URL` — URL фронтенда для CORS

Frontend (опционально, `.env.local`):
- `VITE_API_URL` — URL бэкенда (пусто = тот же домен)

## Локальный запуск

```bash
# Backend
cd backend && pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000

# Frontend (в другом терминале)
cd frontend && npm install && npm run dev
```

## AI модель

Модель: `deepseek/deepseek-chat-v3-0324` через OpenRouter API
URL: `https://openrouter.ai/api/v1/chat/completions`
Заголовки: `HTTP-Referer: https://partour.app`, `X-Title: ПарТур Агент`

## Agentic loop

Файл: `backend/app/agents/partour_agent.py`
1. Принять messages → добавить system prompt
2. Отправить в OpenRouter с описанием tools
3. Если LLM вернул tool_calls → выполнить → добавить tool_result в messages
4. Повторять (max 6 итераций) до финального текста
5. Стримить через SSE

## SSE формат событий

```
{"type": "text_delta", "content": "..."}  — текст агента
{"type": "tool_use", "tool": "...", "input": {...}}  — вызов инструмента
{"type": "tool_result", "data": {...}}  — результат инструмента
{"type": "done"}  — завершение
```

## Инструменты агента

| Tool | Файл | Описание |
|------|------|---------|
| `search_banyas` | tools/search_banyas.py | Поиск бань по региону через 2GIS |
| `get_banya_details` | tools/get_banya_details.py | Детали конкретной бани |
| `build_route` | tools/build_route.py | Маршрут ПарТура |
| `compare_banyas` | tools/compare_banyas.py | Таблица сравнения |

## Важные детали реализации

- Все ключи только через `settings` из `app/core/config.py` — никаких хардкодов
- Async/await для всех I/O операций
- CORS настроен для `settings.FRONTEND_URL` и `http://localhost:5173`
- При ошибках 2GIS агент отвечает понятным текстом, не падает
- Frontend: пустой экран показывает 4 кнопки-подсказки
- Frontend: `VITE_API_URL` пустой = запросы идут на тот же домен (для деплоя)

## Деплой (Render.com)

Используй `render.yaml` в корне. Два сервиса:
- `partour-backend` (Python, rootDir: backend)
- `partour-frontend` (static, rootDir: frontend)

После деплоя установить envVars в дашборде Render.
