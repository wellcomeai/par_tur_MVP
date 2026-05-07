from typing import Any

from app.core.logger import get_logger
from app.services.twogis_client import get_banya_api, normalize_item

logger = get_logger(__name__)

TOOL_DEFINITION = {
    "type": "function",
    "function": {
        "name": "get_banya_details",
        "description": "Получить детальную информацию о конкретной бане по её ID из 2GIS",
        "parameters": {
            "type": "object",
            "properties": {
                "banya_id": {
                    "type": "string",
                    "description": "ID бани из результатов search_banyas",
                },
            },
            "required": ["banya_id"],
        },
    },
}


async def get_banya_details(banya_id: str) -> dict[str, Any]:
    logger.info("Tool get_banya_details: id=%s", banya_id)
    try:
        item = await get_banya_api(banya_id)
        if item is None:
            return {"error": f"Баня с ID {banya_id} не найдена"}
        return normalize_item(item)
    except RuntimeError as e:
        logger.error("get_banya_details error: %s", e)
        return {"error": str(e)}
