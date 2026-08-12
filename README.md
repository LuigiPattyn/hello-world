# Luce

A small, beautiful candle storefront for Luce — hand-poured candles with an Ibiza-inspired, sun-drenched aesthetic.

## Run locally

```bash
python3 server.py
```

Open http://localhost:8000.

## Deploy to Cloud Run

```bash
gcloud run deploy --source .
```

Or build locally with Docker:

```bash
docker build -t luce-site . && docker run -p 8080:8080 luce-site
```
