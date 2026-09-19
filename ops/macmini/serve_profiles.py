#!/usr/bin/env python3
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
import hmac
import os
import signal
import subprocess
from urllib.parse import parse_qs, urlsplit


BASE = os.path.expanduser("~/Library/Application Support/SurgeProfileGateway")
PUBLIC_HOST_FILE = os.path.join(BASE, "public-host")
ROUTE = "/surge-v2.conf"
PROFILE_NAME = "surge-v2.conf"
TOKEN_NAME = "token"
MANAGED_URL_FILE = "surge-vps-path-managed-url.txt"


def refresh_surge():
    """Fetch current private nodes before returning a managed update."""
    job = os.path.join(BASE, "bin", "refresh-profile.sh")
    process = subprocess.Popen(
        ["/bin/zsh", job], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL,
        start_new_session=True,
    )
    try:
        return process.wait(timeout=20) == 0
    except subprocess.TimeoutExpired:
        os.killpg(process.pid, signal.SIGTERM)
        process.wait(timeout=5)
        return False


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
        if parsed.path != ROUTE:
            self.send_error(404)
            return
        supplied = parse_qs(parsed.query).get("token", [""])[0]
        try:
            with open(os.path.join(BASE, TOKEN_NAME), encoding="ascii") as handle:
                expected = handle.read().strip()
        except OSError:
            self.send_error(503)
            return
        if not expected or not hmac.compare_digest(supplied, expected):
            self.send_error(404)
            return
        # Manual and automatic client updates use GET. Fetch current nodes first
        # so a successful download cannot silently serve an old snapshot.
        if include_body and self.headers.get("X-Proxy-Config-Health") != "1":
            try:
                refreshed = refresh_surge()
            except (OSError, subprocess.SubprocessError):
                refreshed = False
            if not refreshed:
                self.send_error(503, "Surge node refresh failed; previous profile retained")
                return
        try:
            with open(os.path.join(BASE, PROFILE_NAME), "rb") as handle:
                profile = handle.read()
        except OSError:
            self.send_error(503)
            return

        try:
            with open(os.path.join(BASE, MANAGED_URL_FILE), encoding="ascii") as handle:
                managed_url = handle.read().strip()
        except OSError:
            try:
                with open(PUBLIC_HOST_FILE, encoding="ascii") as handle:
                    public_host = handle.read().strip()
            except OSError:
                self.send_error(503)
                return
            managed_url = "https://{}{}?token={}".format(public_host, ROUTE, expected)
        if not managed_url.startswith("https://"):
            self.send_error(503)
            return
        directive = "#!MANAGED-CONFIG {} interval=3600 strict=false\n".format(managed_url)
        body = directive.encode("utf-8") + profile
        self.send_response(200)
        self.send_header("Content-Type", "text/plain; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self.send_header("profile-update-interval", "1")
        self.end_headers()
        if include_body:
            self.wfile.write(body)


if __name__ == "__main__":
    server = ThreadingHTTPServer(("127.0.0.1", 13002), Handler)
    print("Managed profile gateway listening on 127.0.0.1:13002", flush=True)
    server.serve_forever()
