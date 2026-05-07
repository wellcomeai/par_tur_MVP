from typing import Any

from app.core.logger import get_logger
from app.services.twogis_client import get_banya_api, normalize_item

logger = get_logger(__name__)

TOOL_DEFINITION = {
    "type": "function",
    "function": {
        "name": "compare_banyas",
        "description": "Сравнить несколько банных комплексов по ключевым параметрам",
        "parameters": {
            "type": "object",
            "properties": {
                "banya_ids": {
                    "type": "array",
                    "items": {"type": "string"},
                    "description": "Список из 2-5 бань для сравнения",
                },
            },
            "required": ["banya_ids"],
        },
    },
}


async def compare_banyas(banya_ids: list[str]) -> dict[str, Any]:
    logger.info("Tool compare_banyas: ids=%s", banya_ids)

    rows = []
    for banya_id in banya_ids[:5]:
        try:
            item = await get_banya_api(banya_id)
            if item:
                normalized = normalize_item(item)
                rows.append(
                    {
                        "name": normalized["name"],
                        "address": normalized["address"],
                        "rating": normalized["rating"],
                        "phone": normalized["phone"],
                        "schedule": normalized["schedule"],
                    }
                )
        except RuntimeError as e:
            logger.warning("compare_banyas error for %s: %s", banya_id, e)

    return {
        "columns": ["Название", "Адрес", "Рейтинг", "Телефон", "Расписание"],
        "rows": rows,
    }
