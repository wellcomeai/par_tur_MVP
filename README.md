# 🔥 ПарТур Агент

**AI-агент для подбора банных комплексов по России**

Веб-сервис с чат-интерфейсом, где пользователь общается с ИИ-агентом, который:
- Ищет банные комплексы по любому региону России
- Строит маршруты ПарТура (несколько бань за день)
- Сравнивает варианты по рейтингу, адресу и расписанию
- Даёт персональные рекомендации

---

## Технологический стек

| Слой | Технологии |
|------|-----------|
| Backend | Python 3.11, FastAPI, httpx, SSE, Pydantic v2 |
| Frontend | React 18, TypeScript, Vite, Tailwind CSS, Zustand |
| AI | OpenRouter (DeepSeek Chat v3) |
| Данные | 2GIS Places API |
| Деплой | Render.com |

---

## Локальный запуск

### Требования

- Python 3.11+
- Node.js 18+
- Ключи API: [OpenRouter](https://openrouter.ai) и [2GIS](https://dev.2gis.ru)

### Backend

```bash
cd backend

# Создать виртуальное окружение
python -m venv .venv
source .venv/bin/activate  # Linux/Mac
# .venv\Scripts\activate   # Windows

# Установить зависимости
pip install -r requirements.txt

# Настроить переменные окружения
cp .env.example .env
# Отредактировать .env — заполнить OPENROUTER_API_KEY и TWOGIS_API_KEY

# Запустить сервер
uvicorn app.main:app --reload --port 8000
```

API будет доступно по адресу: `http://localhost:8000`

Проверка: `curl http://localhost:8000/api/health`

### Frontend

```bash
cd frontend

# Установить зависимости
npm install

# Запустить dev-сервер
npm run dev
```

Приложение откроется по адресу: `http://localhost:5173`

> Vite автоматически проксирует `/api` запросы на `http://localhost:8000`

---

## Настройка переменных окружения

### Backend (`backend/.env`)

Скопируйте пример и заполните ключи:

```bash
cp backend/.env.example backend/.env
```

| Переменная | Описание |
|-----------|---------|
| `OPENROUTER_API_KEY` | Ключ OpenRouter для доступа к DeepSeek |
| `TWOGIS_API_KEY` | Ключ 2GIS Places API для поиска бань |
| `FRONTEND_URL` | URL фронтенда (для CORS), по умолчанию `http://localhost:5173` |

Получить ключи:
- OpenRouter: https://openrouter.ai/keys
- 2GIS: https://dev.2gis.ru/

### Frontend (опционально)

Для деплоя создайте `frontend/.env.local`:

```env
VITE_API_URL=https://your-backend.onrender.com
```

---

## Деплой на Render.com

В корне репозитория есть файл `render.yaml` с конфигурацией для автодеплоя двух сервисов.

### Шаги:

1. Создайте аккаунт на [Render.com](https://render.com)
2. Нажмите **New → Blueprint** и укажите этот репозиторий
3. Render автоматически создаст два сервиса:
   - `partour-backend` — Python/FastAPI
   - `partour-frontend` — статический сайт
4. В настройках каждого сервиса установите переменные окружения:

**partour-backend:**
- `OPENROUTER_API_KEY` — ваш ключ
- `TWOGIS_API_KEY` — ваш ключ
- `FRONTEND_URL` — URL вашего фронтенд-сервиса на Render

**partour-frontend:**
- `VITE_API_URL` — URL вашего бэкенд-сервиса на Render

---

## Структура проекта

```
partour-agent/
├── backend/
│   ├── app/
│   │   ├── main.py                  # Точка входа FastAPI
│   │   ├── core/
│   │   │   ├── config.py            # Настройки из .env
│   │   │   └── logger.py            # Логгер
│   │   ├── api/routes/
│   │   │   └── chat.py              # POST /api/chat (SSE)
│   │   ├── agents/
│   │   │   ├── partour_agent.py     # Agentic loop
│   │   │   └── prompts.py           # System prompt
│   │   ├── tools/                   # Инструменты агента
│   │   └── services/
│   │       └── twogis_client.py     # 2GIS HTTP-клиент
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   └── src/
│       ├── components/Chat/         # Чат-интерфейс
│       ├── services/api.ts          # SSE-клиент
│       ├── store/chatStore.ts       # Zustand store
│       └── types/index.ts           # TypeScript типы
├── render.yaml                      # Конфигурация Render
└── README.md
```

---

## API

### `GET /api/health`
Проверка работоспособности сервера.

```json
{"status": "ok"}
```

### `POST /api/chat`
Отправить сообщение агенту. Ответ — SSE-поток.

**Request:**
```json
{
  "messages": [
    {"role": "user", "content": "Хочу ПарТур по Рязанской области"}
  ]
}
```

**SSE Events:**
```
data: {"type": "text_delta", "content": "Ищу бани..."}
data: {"type": "tool_use", "tool": "search_banyas", "input": {"region": "Рязань"}}
data: {"type": "tool_result", "data": [{...}]}
data: {"type": "done"}
```
