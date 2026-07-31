# hello-world

A fancy hello-world web page served by a small, dependency-free Python
server and run with Docker Compose.

## Run

```bash
docker compose up --build
```

Then open <http://localhost:8000>.

The page shows a friendly animated greeting plus a little live server-side
info — hostname, current UTC time, Python version, platform, and a running
visit counter.

## Run without Docker

```bash
python3 server.py
```

Then open <http://localhost:8000>. The server uses only the Python standard
library, so no virtual environment or dependencies are needed.

## Configuration

The server reads two environment variables:

| Variable | Default   | Description                |
| -------- | --------- | -------------------------- |
| `HOST`   | `0.0.0.0` | Address to bind on.        |
| `PORT`   | `8000`    | TCP port to listen on.     |
