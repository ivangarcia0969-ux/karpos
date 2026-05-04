from fastapi import APIRouter
from pydantic import BaseModel, Field
from functools import lru_cache

from ..config import settings

router = APIRouter()


class EmbedRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=8000)


class EmbedResponse(BaseModel):
    model: str
    embedding: list[float]
    dim: int


@lru_cache(maxsize=1)
def _get_model():
    from sentence_transformers import SentenceTransformer
    return SentenceTransformer(settings.embedding_model)


@router.post("/embed", response_model=EmbedResponse)
def embed(req: EmbedRequest) -> EmbedResponse:
    model = _get_model()
    vec = model.encode(req.text, normalize_embeddings=True).tolist()
    return EmbedResponse(model=settings.embedding_model, embedding=vec, dim=len(vec))
