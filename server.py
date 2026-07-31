#!/usr/bin/env python3
"""A fancy hello-world web server using only the standard library.

Serves a single, styled HTML page with a little live server-side info
(hostname, Python version, current time, and a request counter). No
third-party dependencies are required.
"""

import os
import platform
import socket
import threading
from datetime import datetime, timezone
from html import escape
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

HOST = os.environ.get("HOST", "0.0.0.0")
PORT = int(os.environ.get("PORT", "8000"))

# Shared request counter, guarded by a lock because ThreadingHTTPServer
# dispatches each request on its own thread.
_visits_lock = threading.Lock()
_visits = 0

PAGE_TEMPLATE = """\
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Hello, World!</title>
<style>
  :root {{
    --bg-start: #6a11cb;
    --bg-end: #2575fc;
    --card: rgba(255, 255, 255, 0.14);
    --card-border: rgba(255, 255, 255, 0.28);
    --text: #ffffff;
    --muted: rgba(255, 255, 255, 0.78);
    --accent: #ffd166;
  }}
  * {{ box-sizing: border-box; }}
  html, body {{
    margin: 0;
    min-height: 100%;
  }}
  body {{
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
      Helvetica, Arial, sans-serif;
    color: var(--text);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem;
    background: linear-gradient(135deg, var(--bg-start), var(--bg-end))
      fixed;
  }}
  .card {{
    background: var(--card);
    border: 1px solid var(--card-border);
    backdrop-filter: blur(14px);
    -webkit-backdrop-filter: blur(14px);
    border-radius: 24px;
    padding: 3rem;
    max-width: 36rem;
    width: 100%;
    box-shadow: 0 24px 60px rgba(0, 0, 0, 0.28);
    text-align: center;
    animation: rise 0.7s cubic-bezier(0.16, 1, 0.3, 1);
  }}
  @keyframes rise {{
    from {{ opacity: 0; transform: translateY(24px) scale(0.98); }}
    to   {{ opacity: 1; transform: translateY(0)   scale(1);    }}
  }}
  .wave {{
    display: inline-block;
    font-size: 3.5rem;
    transform-origin: 70% 70%;
    animation: wave 2.4s ease-in-out infinite;
  }}
  @keyframes wave {{
    0%, 60%, 100% {{ transform: rotate(0deg); }}
    10%, 30%      {{ transform: rotate(14deg); }}
    20%           {{ transform: rotate(-8deg); }}
    40%           {{ transform: rotate(-4deg); }}
  }}
  h1 {{
    font-size: clamp(2.2rem, 6vw, 3.4rem);
    margin: 0.5rem 0 1rem;
    letter-spacing: -0.02em;
    background: linear-gradient(90deg, #fff, var(--accent));
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
  }}
  .subtitle {{
    color: var(--muted);
    font-size: 1.05rem;
    margin: 0 0 2rem;
  }}
  .info {{
    display: grid;
    gap: 0.75rem;
    text-align: left;
    margin-top: 1.5rem;
  }}
  .info dt {{
    color: var(--muted);
    font-size: 0.78rem;
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }}
  .info dd {{
    margin: 0 0 0.4rem;
    font-variant-numeric: tabular-nums;
    font-size: 1rem;
  }}
  .footer {{
    margin-top: 2rem;
    color: var(--muted);
    font-size: 0.82rem;
  }}
  .pill {{
    display: inline-block;
    margin-top: 1rem;
    padding: 0.3rem 0.9rem;
    border: 1px solid var(--card-border);
    border-radius: 999px;
    font-size: 0.78rem;
    color: var(--accent);
  }}
</style>
</head>
<body>
  <main class="card">
    <div class="wave" aria-hidden="true">&#128075;</div>
    <h1>Hello, World!</h1>
    <p class="subtitle">A fancy hello from a Python server, running in Docker Compose.</p>
    <dl class="info">
      <dt>Hostname</dt>
      <dd>{hostname}</dd>
      <dt>Server time (UTC)</dt>
      <dd>{server_time}</dd>
      <dt>Python</dt>
      <dd>{python_version}</dd>
      <dt>Platform</dt>
      <dd>{platform}</dd>
      <dt>This is visit</dt>
      <dd>#{visits}</dd>
    </dl>
    <span class="pill">Powered by the Python standard library</span>
    <p class="footer">Served by <code>http.server.ThreadingHTTPServer</code></p>
  </main>
</body>
</html>
"""


def render_page() -> bytes:
    global _visits
    with _visits_lock:
        _visits += 1
        visits = _visits
    page = PAGE_TEMPLATE.format(
        hostname=escape(socket.gethostname()),
        server_time=escape(datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S")),
        python_version=escape(platform.python_version()),
        platform=escape(platform.platform()),
        visits=visits,
    )
    return page.encode("utf-8")


class HelloWorldHandler(BaseHTTPRequestHandler):
    def _respond(self) -> None:
        body = render_page()
        self.send_response(200)
        self.send_header("Content-Type", "text/html; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self) -> None:
        self._respond()

    def log_message(self, fmt: str, *args) -> None:  # quieter default logging
        print(f"{self.address_string()} - {fmt % args}")


def main() -> None:
    with ThreadingHTTPServer((HOST, PORT), HelloWorldHandler) as httpd:
        print(f"Serving hello-world on http://{HOST}:{PORT}")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nShutting down.")
            httpd.shutdown()


if __name__ == "__main__":
    main()
