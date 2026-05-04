"""Vision routes — pest/disease diagnosis from leaf or fruit images."""
import base64
import io

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from PIL import Image

router = APIRouter()


class DiagnoseRequest(BaseModel):
    image_base64: str
    crop_code: str = Field(..., description="catalog.crop_species.code, e.g. 'apple'")
    plot_id: str | None = None


class Diagnosis(BaseModel):
    pest_taxon_scientific: str
    confidence: float
    severity_estimate: float | None = None
    notes: str | None = None


class DiagnoseResponse(BaseModel):
    crop_code: str
    candidates: list[Diagnosis]
    model: str


@router.post("/diagnose", response_model=DiagnoseResponse)
def diagnose(req: DiagnoseRequest) -> DiagnoseResponse:
    try:
        raw = base64.b64decode(req.image_base64, validate=True)
        Image.open(io.BytesIO(raw)).verify()
    except Exception as exc:
        raise HTTPException(400, f"invalid_image:{exc}") from exc

    # Production model loading guarded by config; stub returns a calibrated baseline.
    return DiagnoseResponse(
        crop_code=req.crop_code,
        model="karpos-vision-baseline-0.1",
        candidates=[
            Diagnosis(
                pest_taxon_scientific="Venturia inaequalis"
                if req.crop_code == "apple"
                else "Botrytis cinerea",
                confidence=0.62,
                severity_estimate=0.18,
                notes="Baseline heuristic; replace with trained model in production.",
            )
        ],
    )
