"""Karpos ML — FastAPI service.

Routes
------
GET  /healthz                 liveness probe
POST /embed                   text -> embedding for RAG (Karpos IQ)
POST /vision/diagnose         image (b64) -> pest/disease classification
POST /forecast/yield          plot history -> harvest forecast
"""
from __future__ import annotations

from fastapi import FastAPI, Header, HTTPException
from pydantic import BaseModel, Field

from .config import settings
from .routes.embed import router as embed_router
from .routes.vision import router as vision_router
from .routes.forecast import router as forecast_router

app = FastAPI(
    title="Karpos ML",
    version="0.1.0",
    description="Karpos ML inference service — vision, forecasting, embeddings.",
)


@app.get("/healthz")
def healthz() -> dict[str, str]:
    return {"status": "ok", "service": "karpos-ml"}


def _check_auth(authorization: str | None) -> None:
    if not settings.api_key:
        return
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(401, "missing_bearer")
    token = authorization.removeprefix("Bearer ").strip()
    if token != settings.api_key:
        raise HTTPException(403, "invalid_api_key")


@app.middleware("http")
async def auth_middleware(request, call_next):
    if request.url.path != "/healthz":
        _check_auth(request.headers.get("authorization"))
    return await call_next(request)


app.include_router(embed_router, prefix="")
app.include_router(vision_router, prefix="/vision")
app.include_router(forecast_router, prefix="/forecast")
