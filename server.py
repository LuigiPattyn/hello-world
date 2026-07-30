#!/usr/bin/env python3
"""A lightweight hello-world web server using only the standard library."""

from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

HOST = "0.0.0.0"
PORT = 8000


class HelloWorldHandler(BaseHTTPRequestHandler):
    def _respond(self) -> None:
        body = b"Hello, World!\n"
        self.send_response(200)
        self.send_header("Content-Type", "text/plain; charset=utf-8")
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
