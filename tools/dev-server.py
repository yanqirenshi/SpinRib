#!/usr/bin/env python3
"""Tiny dev server for SpinRib examples.

Identical to `python -m http.server` except it sends Cache-Control: no-store
on every response. Without this, browsers aggressively cache ES modules
(including transitive relative imports) which makes hot-iterating on
src/styles.js etc. painful.

Usage:
    python tools/dev-server.py [port]
"""

import sys
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer


class NoCacheHandler(SimpleHTTPRequestHandler):
    def end_headers(self) -> None:
        self.send_header("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        super().end_headers()


def main() -> None:
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8000
    with ThreadingHTTPServer(("127.0.0.1", port), NoCacheHandler) as httpd:
        print(f"SpinRib dev server (no-cache) on http://127.0.0.1:{port}/")
        httpd.serve_forever()


if __name__ == "__main__":
    main()
