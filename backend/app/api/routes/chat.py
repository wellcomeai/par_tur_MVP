import json
from typing import Any

from fastapi import APIRouter
from pydantic import BaseModel
from sse_starlette.sse import EventSourceResponse

from app.agents.partour_agent import run_agent
from app.core.logger import get_logger

logger = get_logger(__name__)
router = APIRouter()


class Message(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    messages: list[Message]


@router.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok"}


@router.post("/chat")
async def chat(request: ChatRequest) -> EventSourceResponse:
    messages = [{"role": m.role, "content": m.content} for m in request.messages]
    logger.info("Chat request: %d messages", len(messages))

    async def event_generator() -> Any:
        async for event in run_agent(messages):
            yield {"data": json.dumps(event, ensure_ascii=False)}

    return EventSourceResponse(event_generator())
