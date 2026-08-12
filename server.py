#!/usr/bin/env python3
"""A lightweight, dependency-free static file server for the Luce storefront."""

import mimetypes
import os
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

HOST = "0.0.0.0"
PORT = int(os.environ.get("PORT", "8000"))
SITE_DIR = os.path.join(os.path.dirname(__file__), "site")

# Ensure common MIME types are registered even when the OS database is missing.
mimetypes.add_type("text/css", ".css")
mimetypes.add_type("application/javascript", ".js")
mimetypes.add_type("application/json", ".json")
mimetypes.add_type("image/jpeg", ".jpg")
mimetypes.add_type("image/jpeg", ".jpeg")
mimetypes.add_type("image/png", ".png")
mimetypes.add_type("image/svg+xml", ".svg")
mimetypes.add_type("image/webp", ".webp")


class StaticHandler(BaseHTTPRequestHandler):
    def _send(self, status: int, body: bytes, content_type: str) -> None:
        self.send_response(status)
        self.send_header("Content-Type", content_type)
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def _not_found(self) -> None:
        body = b"Not found"
        self._send(404, body, "text/plain; charset=utf-8")

    def _map_path(self, path: str) -> str:
        """Map a URL path to a filesystem path under site/."""
        if path == "/":
            return os.path.join(SITE_DIR, "index.html")

        # Sanitize path traversal attempts.
        clean = os.path.normpath(path).lstrip("/")
        if clean.startswith("..") or "/.." in clean:
            return ""
        return os.path.join(SITE_DIR, clean)

    def do_GET(self) -> None:
        file_path = self._map_path(self.path)
        if not file_path or not os.path.exists(file_path) or not os.path.isfile(file_path):
            self._not_found()
            return

        content_type, _ = mimetypes.guess_type(file_path)
        if content_type is None:
            content_type = "application/octet-stream"

        try:
            with open(file_path, "rb") as f:
                body = f.read()
            self._send(200, body, content_type)
        except OSError:
            self._not_found()

    def log_message(self, fmt: str, *args) -> None:  # quieter default logging
        print(f"{self.address_string()} - {fmt % args}")


def main() -> None:
    with ThreadingHTTPServer((HOST, PORT), StaticHandler) as httpd:
        print(f"Serving Luce on http://{HOST}:{PORT}")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nShutting down.")
            httpd.shutdown()


if __name__ == "__main__":
    main()
