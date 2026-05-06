"""Forecasting routes — yield estimates from plot history + GDD."""
from __future__ import annotations

import math
from datetime import date, timedelta
from typing import Literal

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
    area_ha: float | None = None


class ForecastResponse(BaseModel):
    plot_id: str
    target_year: int
    expected_yield_kg: float
    expected_yield_kg_ha: float
    confidence_low: float
    confidence_high: float
    method: str
    ci_pct: int = 90


class GddRequest(BaseModel):
    dates: list[str] = Field(..., description="ISO date list")
    tmin_c: list[float]
    tmax_c: list[float]
    base_temp_c: float = 10.0
    upper_temp_c: float | None = None
    method: Literal["triangle", "average"] = "triangle"


class GddDayResult(BaseModel):
    date: str
    tmin_c: float
    tmax_c: float
    gdd: float
    cumulative_gdd: float


class GddResponse(BaseModel):
    base_temp_c: float
    upper_temp_c: float | None
    method: str
    days: list[GddDayResult]
    total_gdd: float


def _gdd_triangle(tmin: float, tmax: float, base: float, upper: float | None) -> float:
    """Triangle single-sine GDD, clipped to [0, upper-base]."""
    tmax_c = min(tmax, upper) if upper else tmax
    tmin_c = max(tmin, base)
    if tmax_c <= base:
        return 0.0
    if tmin_c >= (upper or float("inf")):
        return (upper or tmax) - base
    avg = (tmin_c + tmax_c) / 2.0
    return max(0.0, avg - base)


def _gdd_average(tmin: float, tmax: float, base: float, upper: float | None) -> float:
    avg = (tmin + tmax) / 2.0
    if upper:
        avg = min(avg, upper)
    return max(0.0, avg - base)


@router.post("/gdd", response_model=GddResponse)
def compute_gdd(req: GddRequest) -> GddResponse:
    if not (len(req.dates) == len(req.tmin_c) == len(req.tmax_c)):
        from fastapi import HTTPException
        raise HTTPException(400, "dates, tmin_c and tmax_c must have equal length")

    calc = _gdd_triangle if req.method == "triangle" else _gdd_average
    cumulative = 0.0
    days: list[GddDayResult] = []
    for d, lo, hi in zip(req.dates, req.tmin_c, req.tmax_c):
        gdd = calc(lo, hi, req.base_temp_c, req.upper_temp_c)
        cumulative += gdd
        days.append(GddDayResult(date=d, tmin_c=lo, tmax_c=hi, gdd=round(gdd, 2), cumulative_gdd=round(cumulative, 2)))

    return GddResponse(
        base_temp_c=req.base_temp_c,
        upper_temp_c=req.upper_temp_c,
        method=req.method,
        days=days,
        total_gdd=round(cumulative, 2),
    )


@router.post("/yield", response_model=ForecastResponse)
def forecast_yield(req: ForecastRequest) -> ForecastResponse:
    if len(req.history) >= 4:
        result = _lgbm_forecast(req)
    elif req.history:
        result = _statistical_forecast(req)
    else:
        result = _default_forecast(req)
    return result


def _lgbm_forecast(req: ForecastRequest) -> ForecastResponse:
    """LightGBM forecast — trains on available seasons, predicts next."""
    try:
        import lightgbm as lgb
        import numpy as np

        X, y = [], []
        for i, h in enumerate(req.history):
            features = [
                h.season_year,
                h.area_ha,
                i,  # trend index
                req.flowering_pct if req.flowering_pct is not None else 80.0,
                req.cumulative_gdd if req.cumulative_gdd is not None else 1200.0,
            ]
            X.append(features)
            y.append(h.yield_kg / max(h.area_ha, 0.001))

        X_arr = np.array(X)
        y_arr = np.array(y)

        train = lgb.Dataset(X_arr, label=y_arr)
        params = {"objective": "regression", "num_leaves": 7, "learning_rate": 0.1, "verbose": -1}
        bst = lgb.train(params, train, num_boost_round=50)

        area = req.area_ha or req.history[-1].area_ha
        pred_feat = np.array([[
            req.target_year, area, len(req.history),
            req.flowering_pct if req.flowering_pct is not None else 80.0,
            req.cumulative_gdd if req.cumulative_gdd is not None else 1200.0,
        ]])
        per_ha = float(bst.predict(pred_feat)[0])
        std = float(np.std(y_arr)) * 0.6
        ci_margin = 1.645 * std  # 90% CI

        return ForecastResponse(
            plot_id=req.plot_id,
            target_year=req.target_year,
            expected_yield_kg=round(per_ha * area, 1),
            expected_yield_kg_ha=round(per_ha, 1),
            confidence_low=round(max(0, (per_ha - ci_margin) * area), 1),
            confidence_high=round((per_ha + ci_margin) * area, 1),
            method="lgbm_v1",
            ci_pct=90,
        )
    except ImportError:
        return _statistical_forecast(req)


def _statistical_forecast(req: ForecastRequest) -> ForecastResponse:
    per_ha_vals = [h.yield_kg / max(h.area_ha, 0.0001) for h in req.history]
    sorted_vals = sorted(per_ha_vals)
    median = sorted_vals[len(sorted_vals) // 2]

    flowering_factor = 1.0
    if req.flowering_pct is not None:
        flowering_factor = max(0.4, min(1.3, req.flowering_pct / 70.0))

    gdd_factor = 1.0
    if req.cumulative_gdd is not None:
        gdd_factor = max(0.8, min(1.2, req.cumulative_gdd / 1400.0))

    per_ha = median * flowering_factor * gdd_factor
    area = req.area_ha or req.history[-1].area_ha

    std = (max(per_ha_vals) - min(per_ha_vals)) / 2
    ci_margin = std * 1.2

    return ForecastResponse(
        plot_id=req.plot_id,
        target_year=req.target_year,
        expected_yield_kg=round(per_ha * area, 1),
        expected_yield_kg_ha=round(per_ha, 1),
        confidence_low=round(max(0, (per_ha - ci_margin) * area), 1),
        confidence_high=round((per_ha + ci_margin) * area, 1),
        method="median_history+phenology",
        ci_pct=90,
    )


def _default_forecast(req: ForecastRequest) -> ForecastResponse:
    default_per_ha = 12_000.0
    area = req.area_ha or 1.0
    return ForecastResponse(
        plot_id=req.plot_id,
        target_year=req.target_year,
        expected_yield_kg=default_per_ha * area,
        expected_yield_kg_ha=default_per_ha,
        confidence_low=default_per_ha * 0.7 * area,
        confidence_high=default_per_ha * 1.3 * area,
        method="default_baseline",
        ci_pct=90,
    )
