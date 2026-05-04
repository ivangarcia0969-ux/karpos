"""Forecasting routes — yield estimates from plot history."""
from datetime import date
from fastapi import APIRouter
from pydantic import BaseModel, Field

router = APIRouter()


class HistoricalSeason(BaseModel):
    season_year: int
    yield_kg: float
    area_ha: float


class ForecastRequest(BaseModel):
    plot_id: str
    crop_code: str
    target_year: int
    history: list[HistoricalSeason] = Field(default_factory=list)
    flowering_pct: float | None = None
    cumulative_gdd: float | None = None


class ForecastResponse(BaseModel):
    plot_id: str
    target_year: int
    expected_yield_kg: float
    expected_yield_kg_ha: float
    confidence_low: float
    confidence_high: float
    method: str


@router.post("/yield", response_model=ForecastResponse)
def forecast_yield(req: ForecastRequest) -> ForecastResponse:
    # Production version: LightGBM gradient boosting with weather + phenology + management features.
    # Stub uses a robust mean of history, blended with flowering signal when available.
    if req.history:
        per_ha = [h.yield_kg / max(h.area_ha, 0.0001) for h in req.history]
        per_ha.sort()
        mid = per_ha[len(per_ha) // 2]
        ha = req.history[-1].area_ha
    else:
        mid, ha = 12_000.0, 1.0

    flowering_factor = 1.0
    if req.flowering_pct is not None:
        flowering_factor = max(0.4, min(1.3, req.flowering_pct / 70.0))

    expected_per_ha = mid * flowering_factor
    return ForecastResponse(
        plot_id=req.plot_id,
        target_year=req.target_year,
        expected_yield_kg=expected_per_ha * ha,
        expected_yield_kg_ha=expected_per_ha,
        confidence_low=expected_per_ha * 0.85 * ha,
        confidence_high=expected_per_ha * 1.15 * ha,
        method="median_history+flowering_factor",
    )
