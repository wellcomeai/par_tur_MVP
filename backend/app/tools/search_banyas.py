from typing import Any

from app.core.logger import get_logger
from app.services.twogis_client import normalize_item, search_banyas_api

logger = get_logger(__name__)

TOOL_DEFINITION = {
    "type": "function",
    "function": {
        "name": "search_banyas",
        "description": "Поиск банных комплексов по региону или городу России через 2GIS",
        "parameters": {
            "type": "object",
            "properties": {
                "region": {
                    "type": "string",
                    "description": "Название города или области, например 'Рязань' или 'Краснодар'",
                },
                "limit": {
                    "type": "integer",
                    "description": "Количество результатов (по умолчанию 10)",
                    "default": 10,
                },
            },
            "required": ["region"],
        },
    },
}


async def search_banyas(region: str, limit: int = 10) -> list[dict[str, Any]]:
    logger.info("Tool search_banyas: region=%s limit=%d", region, limit)
    try:
        raw_items = await search_banyas_api(region, limit)
        return [normalize_item(item) for item in raw_items]
    except RuntimeError as e:
        logger.error("search_banyas error: %s", e)
        return [{"error": str(e)}]
