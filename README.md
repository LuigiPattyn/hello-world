# hello-world

A tiny "Hello, World!" web server running on port 8080, packaged with Docker.

## Files

| File                | Purpose                                      |
|---------------------|----------------------------------------------|
| `app.py`            | Flask app that returns "Hello, World!" on `/`|
| `requirements.txt`  | Python dependencies (Flask)                  |
| `Dockerfile`        | Builds the image (python:3.12-slim base)     |
| `docker-compose.yml`| Runs the container with port 8080 mapped     |

## Run with Docker Compose (recommended)

```bash
docker compose up --build
```

Then visit http://localhost:8080

To stop it:

```bash
docker compose down
```

## Run with plain Docker

Build the image:

```bash
docker build -t hello-world .
```

Run the container:

```bash
docker run -p 8080:8080 hello-world
```

Then visit http://localhost:8080

## Run locally without Docker

```bash
pip install -r requirements.txt
python app.py
```

Then visit http://localhost:8080
