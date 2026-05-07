from typing import Any

import httpx

from app.core.config import settings
from app.core.logger import get_logger

logger = get_logger(__name__)

TWOGIS_BASE_URL = "https://catalog.api.2gis.com/3.0/items"

# Search uses only stable fields to avoid breaking 2GIS results
_SEARCH_FIELDS = (
    "items.contact_groups,items.schedule,items.description,"
    "items.rating,items.reviews,items.point"
)
# Detail endpoint supports extended fields
_DETAIL_FIELDS = (
    "items.contact_groups,items.schedule,items.description,"
    "items.rating,items.reviews,items.point,items.photos,items.rubrics"
)


async def search_banyas_api(region: str, limit: int = 15) -> list[dict[str, Any]]:
    params = {
        "q": "баня банный комплекс сауна",
        "where": region,
        "page_size": limit,
        "fields": _SEARCH_FIELDS,
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
        "fields": _DETAIL_FIELDS,
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


def _extract_website(item: dict[str, Any]) -> str:
    for group in item.get("contact_groups", []):
        for contact in group.get("contacts", []):
            if contact.get("type") in ("website", "url"):
                return contact.get("value", "")
    return ""


def _extract_schedule(item: dict[str, Any]) -> str:
    schedule = item.get("schedule", {})
    if not schedule:
        return ""

    days_map = {
        "Mon": "Пн", "Tue": "Вт", "Wed": "Ср",
        "Thu": "Чт", "Fri": "Пт", "Sat": "Сб", "Sun": "Вс",
    }

    day_hours: dict[str, str] = {}
    for day_en, day_ru in days_map.items():
        day_data = schedule.get(day_en)
        if day_data and day_data.get("working_hours"):
            h = day_data["working_hours"][0]
            day_hours[day_ru] = f"{h.get('from', '')}–{h.get('to', '')}"

    if not day_hours:
        return "Уточните по телефону"

    # Detect "around the clock" (00:00–24:00 or 0:00–0:00)
    def is_full_day(h: str) -> bool:
        return h in ("00:00–24:00", "0:00–0:00", "00:00–00:00")

    all_vals = list(day_hours.values())
    # All days same hours
    if len(set(all_vals)) == 1:
        hrs = all_vals[0]
        if is_full_day(hrs):
            return "Круглосуточно, без выходных"
        return f"Ежедневно {hrs}"

    # Weekdays vs weekend
    weekdays = ["Пн", "Вт", "Ср", "Чт", "Пт"]
    weekend = ["Сб", "Вс"]
    wd_hours = {day_hours[d] for d in weekdays if d in day_hours}
    we_hours = {day_hours[d] for d in weekend if d in day_hours}
    if len(wd_hours) == 1 and len(we_hours) == 1:
        wd = next(iter(wd_hours))
        we = next(iter(we_hours))
        if wd == we:
            return f"Ежедневно {wd}" if not is_full_day(wd) else "Круглосуточно, без выходных"
        wd_str = "Круглосуточно" if is_full_day(wd) else wd
        we_str = "Круглосуточно" if is_full_day(we) else we
        return f"Пн–Пт {wd_str}, Сб–Вс {we_str}"

    parts = [f"{d} {h}" for d, h in day_hours.items()]
    return ", ".join(parts)


def _extract_photos(item: dict[str, Any]) -> list[str]:
    photos = item.get("photos", [])
    urls: list[str] = []
    for photo in photos:
        if not isinstance(photo, dict):
            continue
        url = photo.get("url") or photo.get("preview_url") or photo.get("image_url")
        if url:
            urls.append(url)
    return urls[:5]


def _extract_rubrics(item: dict[str, Any]) -> list[str]:
    return [r["name"] for r in item.get("rubrics", []) if r.get("name")]


def normalize_item(item: dict[str, Any]) -> dict[str, Any]:
    point = item.get("point", {})
    reviews = item.get("reviews", {})
    # 2GIS returns rating either as top-level float (items.rating) or inside reviews object
    rating = reviews.get("rating") or item.get("rating") or 0.0
    return {
        "id": item.get("id", ""),
        "name": item.get("name", "Неизвестно"),
        "address": item.get("full_name", item.get("address_name", "")),
        "rating": float(rating),
        "reviews_count": reviews.get("count", 0),
        "lat": point.get("lat", 0.0),
        "lon": point.get("lon", 0.0),
        "phone": _extract_phone(item),
        "website": _extract_website(item),
        "schedule": _extract_schedule(item),
        "description": item.get("description", ""),
        "photos": _extract_photos(item),
        "rubrics": _extract_rubrics(item),
    }
