from typing import Any

from app.core.logger import get_logger
from app.services.twogis_client import get_banya_api, normalize_item

logger = get_logger(__name__)

TOOL_DEFINITION = {
    "type": "function",
    "function": {
        "name": "build_route",
        "description": "Построить маршрут ПарТура — последовательность посещения нескольких бань за день",
        "parameters": {
            "type": "object",
            "properties": {
                "banya_ids": {
                    "type": "array",
                    "items": {"type": "string"},
                    "description": "Список ID бань для маршрута",
                },
                "region": {
                    "type": "string",
                    "description": "Регион для контекста маршрута",
                },
            },
            "required": ["banya_ids", "region"],
        },
    },
}

TIPS = [
    "Начните день здесь — отличное место для разогрева",
    "Идеально для середины дня — попробуйте фирменный пар",
    "Завершите ПарТур здесь — расслабляющая атмосфера",
    "Отличный выбор для активного отдыха",
    "Рекомендуем провести здесь не менее часа",
]


async def build_route(banya_ids: list[str], region: str) -> dict[str, Any]:
    logger.info("Tool build_route: ids=%s region=%s", banya_ids, region)

    route_items = []
    for idx, banya_id in enumerate(banya_ids):
        try:
            item = await get_banya_api(banya_id)
            if item:
                normalized = normalize_item(item)
                tip = TIPS[idx % len(TIPS)]
                route_items.append(
                    {
                        "order": idx + 1,
                        "name": normalized["name"],
                        "address": normalized["address"],
                        "tip": tip,
                    }
                )
        except RuntimeError as e:
            logger.warning("Could not fetch banya %s: %s", banya_id, e)
            route_items.append(
                {
                    "order": idx + 1,
                    "name": f"Баня #{banya_id}",
                    "address": "Адрес уточняется",
                    "tip": TIPS[idx % len(TIPS)],
                }
            )

    total = len(route_items)
    estimated = f"{total * 2}–{total * 3} часа"

    return {
        "route": route_items,
        "total_banyas": total,
        "estimated_duration": estimated,
        "region": region,
    }
