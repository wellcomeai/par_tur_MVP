from typing import Any

import httpx

from app.core.config import settings
from app.core.logger import get_logger

logger = get_logger(__name__)

TWOGIS_BASE_URL = "https://catalog.api.2gis.com/3.0/items"


async def search_banyas_api(region: str, limit: int = 10) -> list[dict[str, Any]]:
    params = {
        "q": "баня банный комплекс сауна",
        "where": region,
        "page_size": limit,
        "fields": "items.contact_groups,items.schedule,items.description,items.rating,items.point",
        "key": settings.TWOGIS_API_KEY,
    }

    logger.info("2GIS search: region=%s limit=%d", region, limit)

    async with httpx.AsyncClient(timeout=15.0) as client:
        try:
            response = await client.get(TWOGIS_BASE_URL, params=params)
            response.raise_for_status()
            data = response.json()
        except httpx.HTTPStatusError as e:
            logger.error("2GIS HTTP error: %s", e)
            raise RuntimeError(f"2GIS API вернул ошибку {e.response.status_code}") from e
        except httpx.RequestError as e:
            logger.error("2GIS request error: %s", e)
            raise RuntimeError("Не удалось подключиться к 2GIS API") from e

    items = data.get("result", {}).get("items", [])
    logger.info("2GIS returned %d items for region=%s", len(items), region)
    return items


async def get_banya_api(banya_id: str) -> dict[str, Any] | None:
    params = {
        "id": banya_id,
        "fields": "items.contact_groups,items.schedule,items.description,items.rating,items.point,items.reviews",
        "key": settings.TWOGIS_API_KEY,
    }

    logger.info("2GIS detail: id=%s", banya_id)

    async with httpx.AsyncClient(timeout=15.0) as client:
        try:
            response = await client.get(TWOGIS_BASE_URL, params=params)
            response.raise_for_status()
            data = response.json()
        except httpx.HTTPStatusError as e:
            logger.error("2GIS HTTP error for id=%s: %s", banya_id, e)
            raise RuntimeError(f"2GIS API вернул ошибку {e.response.status_code}") from e
        except httpx.RequestError as e:
            logger.error("2GIS request error: %s", e)
            raise RuntimeError("Не удалось подключиться к 2GIS API") from e

    items = data.get("result", {}).get("items", [])
    return items[0] if items else None


def _extract_phone(item: dict[str, Any]) -> str:
    for group in item.get("contact_groups", []):
        for contact in group.get("contacts", []):
            if contact.get("type") == "phone":
                return contact.get("value", "")
    return ""


def _extract_schedule(item: dict[str, Any]) -> str:
    schedule = item.get("schedule", {})
    if not schedule:
        return ""
    working_hours = []
    days_map = {
        "Mon": "Пн", "Tue": "Вт", "Wed": "Ср",
        "Thu": "Чт", "Fri": "Пт", "Sat": "Сб", "Sun": "Вс",
    }
    for day_en, day_ru in days_map.items():
        day_data = schedule.get(day_en)
        if day_data and day_data.get("working_hours"):
            hours = day_data["working_hours"]
            if hours:
                h = hours[0]
                working_hours.append(f"{day_ru} {h.get('from', '')}–{h.get('to', '')}")
    return ", ".join(working_hours) if working_hours else "Уточните по телефону"


def normalize_item(item: dict[str, Any]) -> dict[str, Any]:
    point = item.get("point", {})
    return {
        "id": item.get("id", ""),
        "name": item.get("name", "Неизвестно"),
        "address": item.get("full_name", item.get("address_name", "")),
        "rating": item.get("reviews", {}).get("rating", 0.0),
        "lat": point.get("lat", 0.0),
        "lon": point.get("lon", 0.0),
        "phone": _extract_phone(item),
        "schedule": _extract_schedule(item),
    }
