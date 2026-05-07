import json
from collections.abc import AsyncGenerator
from typing import Any

import httpx

from app.agents.prompts import SYSTEM_PROMPT
from app.core.config import settings
from app.core.logger import get_logger
from app.tools.build_route import TOOL_DEFINITION as BUILD_ROUTE_DEF
from app.tools.build_route import build_route
from app.tools.compare_banyas import TOOL_DEFINITION as COMPARE_DEF
from app.tools.compare_banyas import compare_banyas
from app.tools.get_banya_details import TOOL_DEFINITION as DETAILS_DEF
from app.tools.get_banya_details import get_banya_details
from app.tools.search_banyas import TOOL_DEFINITION as SEARCH_DEF
from app.tools.search_banyas import search_banyas

logger = get_logger(__name__)

OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"
MODEL = "deepseek/deepseek-chat-v3-0324"
MAX_ITERATIONS = 6

TOOLS = [SEARCH_DEF, DETAILS_DEF, BUILD_ROUTE_DEF, COMPARE_DEF]

TOOL_HANDLERS: dict[str, Any] = {
    "search_banyas": search_banyas,
    "get_banya_details": get_banya_details,
    "build_route": build_route,
    "compare_banyas": compare_banyas,
}


async def _call_openrouter(messages: list[dict], stream: bool = False) -> httpx.Response:
    headers = {
        "Authorization": f"Bearer {settings.OPENROUTER_API_KEY}",
        "HTTP-Referer": "https://partour.app",
        "X-Title": "ПарТур Агент",
        "Content-Type": "application/json",
    }
    payload = {
        "model": MODEL,
        "messages": messages,
        "tools": TOOLS,
        "tool_choice": "auto",
        "stream": stream,
    }

    client = httpx.AsyncClient(timeout=60.0)
    if stream:
        return await client.send(
            client.build_request("POST", OPENROUTER_URL, headers=headers, json=payload),
            stream=True,
        )
    response = await client.post(OPENROUTER_URL, headers=headers, json=payload)
    response.raise_for_status()
    return response


async def run_agent(
    user_messages: list[dict[str, str]],
) -> AsyncGenerator[dict[str, Any], None]:
    messages: list[dict[str, Any]] = [
        {"role": "system", "content": SYSTEM_PROMPT},
        *user_messages,
    ]

    for iteration in range(MAX_ITERATIONS):
        logger.info("Agent iteration %d", iteration + 1)

        try:
            response = await _call_openrouter(messages, stream=False)
        except httpx.HTTPStatusError as e:
            logger.error("OpenRouter HTTP error: %s", e)
            yield {"type": "text_delta", "content": "Извините, произошла ошибка при обращении к AI. Попробуйте позже."}
            yield {"type": "done"}
            return
        except httpx.RequestError as e:
            logger.error("OpenRouter request error: %s", e)
            yield {"type": "text_delta", "content": "Не удалось подключиться к AI-сервису. Проверьте соединение."}
            yield {"type": "done"}
            return

        data = response.json()
        choice = data.get("choices", [{}])[0]
        message = choice.get("message", {})
        finish_reason = choice.get("finish_reason", "")

        tool_calls = message.get("tool_calls", [])

        if tool_calls:
            messages.append({"role": "assistant", "content": message.get("content") or "", "tool_calls": tool_calls})

            for tool_call in tool_calls:
                tool_name = tool_call["function"]["name"]
                tool_input_raw = tool_call["function"].get("arguments", "{}")

                try:
                    tool_input = json.loads(tool_input_raw)
                except json.JSONDecodeError:
                    tool_input = {}

                logger.info("Executing tool: %s with %s", tool_name, tool_input)
                yield {"type": "tool_use", "tool": tool_name, "input": tool_input}

                handler = TOOL_HANDLERS.get(tool_name)
                if handler is None:
                    tool_result: Any = {"error": f"Инструмент '{tool_name}' не найден"}
                else:
                    try:
                        tool_result = await handler(**tool_input)
                    except Exception as e:
                        logger.error("Tool %s error: %s", tool_name, e)
                        tool_result = {"error": str(e)}

                yield {"type": "tool_result", "data": tool_result}

                messages.append(
                    {
                        "role": "tool",
                        "tool_call_id": tool_call["id"],
                        "content": json.dumps(tool_result, ensure_ascii=False),
                    }
                )

            continue

        content = message.get("content", "")
        if content:
            yield {"type": "text_delta", "content": content}

        yield {"type": "done"}
        return

    logger.warning("Agent reached max iterations")
    yield {"type": "text_delta", "content": "Достигнут лимит итераций. Попробуйте переформулировать запрос."}
    yield {"type": "done"}
