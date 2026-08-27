#!/usr/bin/env python3
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
import hmac
import os
from urllib.parse import parse_qs, urlsplit


BASE = os.path.expanduser("~/Library/Application Support/SurgeProfileGateway")
PUBLIC_HOST_FILE = os.path.join(BASE, "public-host")
ROUTES = {
    "/surge-v2.conf": ("surge-v2.conf", "token"),
    "/surfboard-v1.conf": ("surfboard-v1.conf", "surfboard-token"),
}


class Handler(BaseHTTPRequestHandler):
    def log_message(self, fmt, *args):
        # Request URLs contain access tokens and must never be logged.
        return

    def do_HEAD(self):
        self.respond(False)

    def do_GET(self):
        self.respond(True)

    def respond(self, include_body):
        parsed = urlsplit(self.path)
        route = ROUTES.get(parsed.path)
        if route is None:
            self.send_error(404)
            return
        profile_name, token_name = route
        supplied = parse_qs(parsed.query).get("token", [""])[0]
        try:
            with open(os.path.join(BASE, token_name), encoding="ascii") as handle:
                expected = handle.read().strip()
            with open(PUBLIC_HOST_FILE, encoding="ascii") as handle:
                public_host = handle.read().strip()
        except OSError:
            self.send_error(503)
            return
        if not expected or not public_host or not hmac.compare_digest(supplied, expected):
            self.send_error(404)
            return
        try:
            with open(os.path.join(BASE, profile_name), "rb") as handle:
                profile = handle.read()
        except OSError:
            self.send_error(503)
            return

        managed_url = "https://{}{}?token={}".format(public_host, parsed.path, expected)
        directive = "#!MANAGED-CONFIG {} interval=21600 strict=false\n".format(managed_url)
        body = directive.encode("utf-8") + profile
        self.send_response(200)
        self.send_header("Content-Type", "text/plain; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self.send_header("profile-update-interval", "6")
        self.end_headers()
        if include_body:
            self.wfile.write(body)


if __name__ == "__main__":
    server = ThreadingHTTPServer(("127.0.0.1", 13002), Handler)
    print("Managed profile gateway listening on 127.0.0.1:13002", flush=True)
    server.serve_forever()
