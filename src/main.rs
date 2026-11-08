//! A lightweight hello-world web server using only the standard library.

use std::io::{BufRead, BufReader, Write};
use std::net::{TcpListener, TcpStream};
use std::thread;
use std::time::Duration;

const HOST: &str = "0.0.0.0";
const PORT: u16 = 8000;

/// How long a client has to finish sending its request line.
const READ_TIMEOUT: Duration = Duration::from_secs(5);

const INDEX_HTML: &str = include_str!("../static/index.html");
const STYLE_CSS: &str = include_str!("../static/style.css");
const NOT_FOUND_HTML: &str = include_str!("../static/404.html");
const PLAIN_TEXT: &str = "Hello, World!\n";

const HTML: &str = "text/html; charset=utf-8";
const CSS: &str = "text/css; charset=utf-8";
const TEXT: &str = "text/plain; charset=utf-8";

struct Response {
    status: u16,
    reason: &'static str,
    content_type: &'static str,
    extra_headers: &'static str,
    body: &'static str,
}

/// Picks the response for a request. Pure, so it can be tested directly.
fn route(method: &str, path: &str) -> Response {
    match method {
        "GET" | "HEAD" => match path {
            "/" | "/index.html" => Response {
                status: 200,
                reason: "OK",
                content_type: HTML,
                extra_headers: "X-Content-Type-Options: nosniff\r\n",
                body: INDEX_HTML,
            },
            "/style.css" => Response {
                status: 200,
                reason: "OK",
                content_type: CSS,
                extra_headers: "X-Content-Type-Options: nosniff\r\n",
                body: STYLE_CSS,
            },
            "/hello" => Response {
                status: 200,
                reason: "OK",
                content_type: TEXT,
                extra_headers: "",
                body: PLAIN_TEXT,
            },
            // 204 carries no representation, so it carries no Content-Type either.
            "/favicon.ico" => Response {
                status: 204,
                reason: "No Content",
                content_type: "",
                extra_headers: "",
                body: "",
            },
            _ => Response {
                status: 404,
                reason: "Not Found",
                content_type: HTML,
                extra_headers: "X-Content-Type-Options: nosniff\r\n",
                body: NOT_FOUND_HTML,
            },
        },
        _ => Response {
            status: 405,
            reason: "Method Not Allowed",
            content_type: TEXT,
            extra_headers: "Allow: GET, HEAD\r\n",
            body: "Method Not Allowed\n",
        },
    }
}

/// The path part of a request target, without its query string or fragment.
fn request_path(target: &str) -> &str {
    target.split(['?', '#']).next().unwrap_or("/")
}

fn send(stream: &mut TcpStream, res: &Response, head_only: bool) -> std::io::Result<()> {
    let mut head = format!("HTTP/1.1 {} {}\r\n", res.status, res.reason);
    if !res.content_type.is_empty() {
        head.push_str(&format!("Content-Type: {}\r\n", res.content_type));
    }
    head.push_str(&format!(
        "Content-Length: {}\r\n{}Connection: close\r\n\r\n",
        res.body.len(),
        res.extra_headers,
    ));
    stream.write_all(head.as_bytes())?;
    if !head_only && !res.body.is_empty() {
        stream.write_all(res.body.as_bytes())?;
    }
    stream.flush()
}

/// Reads one request, answers it, and logs the result — the port of
/// `HelloWorldHandler`, one thread per connection like `ThreadingHTTPServer`.
fn handle_connection(mut stream: TcpStream) -> std::io::Result<()> {
    let peer = stream
        .peer_addr()
        .map(|addr| addr.ip().to_string())
        .unwrap_or_else(|_| "unknown".to_string());
    stream.set_read_timeout(Some(READ_TIMEOUT))?;
    let _ = stream.set_nodelay(true);

    // Read raw bytes: a request target that is not valid UTF-8 still deserves a
    // response rather than a dropped connection.
    let mut raw = Vec::new();
    {
        let mut reader = BufReader::new(&stream);
        reader.read_until(b'\n', &mut raw)?;
    }
    let request_line = String::from_utf8_lossy(&raw);
    let request_line = request_line.trim();
    if request_line.is_empty() {
        return Ok(()); // client hung up without asking for anything
    }

    let mut parts = request_line.split_whitespace();
    let method = parts.next().unwrap_or("");
    let target = parts.next().unwrap_or("/");
    let path = request_path(target);

    let res = route(method, path);
    send(&mut stream, &res, method == "HEAD")?;
    println!("{peer} - \"{method} {path}\" {} {}", res.status, res.reason);
    Ok(())
}

fn main() {
    let address = format!("{HOST}:{PORT}");
    let listener = match TcpListener::bind(&address) {
        Ok(listener) => listener,
        Err(err) => {
            eprintln!("could not listen on {address}: {err}");
            std::process::exit(1);
        }
    };

    println!("Serving hello-world on http://{address}");
    for stream in listener.incoming() {
        match stream {
            Ok(stream) => {
                thread::spawn(move || {
                    if let Err(err) = handle_connection(stream) {
                        eprintln!("error: {err}");
                    }
                });
            }
            Err(err) => eprintln!("error: {err}"),
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::io::Read;

    #[test]
    fn root_serves_the_html_page() {
        let res = route("GET", "/");
        assert_eq!(res.status, 200);
        assert_eq!(res.content_type, HTML);
        assert!(res.body.contains("class=\"hero\""));
    }

    #[test]
    fn stylesheet_is_served_as_css() {
        let res = route("GET", "/style.css");
        assert_eq!(res.status, 200);
        assert_eq!(res.content_type, CSS);
    }

    #[test]
    fn hello_keeps_the_original_plain_text_greeting() {
        let res = route("GET", "/hello");
        assert_eq!(res.status, 200);
        assert_eq!(res.content_type, TEXT);
        assert_eq!(res.body, "Hello, World!\n");
    }

    #[test]
    fn query_strings_and_fragments_are_ignored() {
        assert_eq!(request_path("/style.css?v=2"), "/style.css");
        assert_eq!(request_path("/hello#top"), "/hello");
        assert_eq!(request_path("/"), "/");
    }

    #[test]
    fn unknown_paths_are_not_found() {
        let res = route("GET", "/nope");
        assert_eq!(res.status, 404);
        assert_eq!(res.reason, "Not Found");
    }

    #[test]
    fn non_get_methods_are_refused() {
        let res = route("POST", "/");
        assert_eq!(res.status, 405);
        assert!(res.extra_headers.contains("GET, HEAD"));
    }

    /// Runs one raw request through `handle_connection` over a real socket and
    /// returns everything the server wrote back.
    fn request(raw: &[u8]) -> String {
        let listener = TcpListener::bind("127.0.0.1:0").expect("bind an ephemeral port");
        let address = listener.local_addr().expect("local address");
        let server = thread::spawn(move || {
            if let Ok((stream, _)) = listener.accept() {
                let _ = handle_connection(stream);
            }
        });

        let mut client = TcpStream::connect(address).expect("connect to the test server");
        client.write_all(raw).expect("send the request");
        let mut response = String::new();
        client
            .read_to_string(&mut response)
            .expect("read the response");
        server.join().expect("the server thread");
        response
    }

    #[test]
    fn serves_the_page_over_a_real_socket() {
        let raw = request(b"GET / HTTP/1.1\r\nHost: localhost\r\nConnection: close\r\n\r\n");

        assert!(raw.starts_with("HTTP/1.1 200 OK"), "got: {raw}");
        assert!(raw.contains("Content-Type: text/html; charset=utf-8"));
        assert!(raw.contains("<!DOCTYPE html>"));
    }

    #[test]
    fn head_asks_for_the_same_headers_without_a_body() {
        let raw = request(b"HEAD / HTTP/1.1\r\nHost: localhost\r\nConnection: close\r\n\r\n");

        assert!(raw.starts_with("HTTP/1.1 200 OK"), "got: {raw}");
        assert!(raw.contains("Content-Type: text/html; charset=utf-8"));
        assert!(raw.ends_with("\r\n\r\n"), "expected no body, got: {raw}");
        assert!(!raw.contains("<!DOCTYPE html>"));
    }

    #[test]
    fn a_request_that_is_not_utf8_still_gets_a_response() {
        let raw =
            request(b"GET /\xff\xfe HTTP/1.1\r\nHost: localhost\r\nConnection: close\r\n\r\n");

        assert!(raw.starts_with("HTTP/1.1 404 Not Found"), "got: {raw}");
    }

    #[test]
    fn favicon_is_answered_with_no_content() {
        let res = route("GET", "/favicon.ico");
        assert_eq!(res.status, 204);
        assert!(
            res.content_type.is_empty(),
            "a 204 has no representation to describe"
        );
    }
}
