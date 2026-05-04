FROM python:3.11-slim AS base
ENV PYTHONUNBUFFERED=1 PIP_NO_CACHE_DIR=1
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends build-essential libgomp1 && rm -rf /var/lib/apt/lists/*

FROM base AS build
COPY apps/ml/pyproject.toml /app/
RUN pip install --upgrade pip && pip install . --target /install

FROM base AS runtime
COPY --from=build /install /usr/local/lib/python3.11/site-packages
COPY apps/ml/app /app/app
ENV PORT=8000
EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
