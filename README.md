# hello-world

Hello :)

A tiny web server written in Rust — the standard library and nothing else, no
dependencies of any kind. It serves a small animated *Hello, World!* page.

Ported from the original single-file Python `server.py` (still in this repo's
history).

## Run

```sh
cargo run --release
```

Then open <http://localhost:8000>.

The server binds `0.0.0.0:8000` and handles each connection on its own thread,
like the Python `ThreadingHTTPServer` it replaces.

## Routes

| Path           | Response                                    |
| -------------- | ------------------------------------------- |
| `/` or `/index.html` | the page (`text/html`)                |
| `/style.css`   | the stylesheet (`text/css`)                 |
| `/hello`       | `Hello, World!` (`text/plain`)              |
| `/favicon.ico` | `204 No Content`                            |
| anything else  | `404`, and only `GET`/`HEAD` are allowed    |

## Check

```sh
cargo test     # routing, the plain-text greeting, and one request over a real socket
```

The page is embedded in the binary with `include_str!`, so the built server is
one self-contained file.
