#!/usr/bin/env python3
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
import hmac
import os
import signal
import subprocess
from urllib.parse import parse_qs, urlsplit


BASE = os.path.expanduser("~/Library/Application Support/SurgeProfileGateway")
PUBLIC_HOST_FILE = os.path.join(BASE, "public-host")
ROUTES = {
    "/surge-v2.conf": ("surge-v2.conf", "token"),
    "/surfboard-v1.conf": ("surfboard-v1.conf", "surfboard-token"),
}
MANAGED_URL_FILES = {
    "/surge-v2.conf": "surge-vps-path-managed-url.txt",
    "/surfboard-v1.conf": "surfboard-vps-path-managed-url.txt",
}


def refresh_surge():
    """Fetch current private nodes before returning a Surge managed update."""
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
        route = ROUTES.get(parsed.path)
        if route is None:
            self.send_error(404)
            return
        profile_name, token_name = route
        supplied = parse_qs(parsed.query).get("token", [""])[0]
        try:
            with open(os.path.join(BASE, token_name), encoding="ascii") as handle:
                expected = handle.read().strip()
        except OSError:
            self.send_error(503)
            return
        if not expected or not hmac.compare_digest(supplied, expected):
            self.send_error(404)
            return
        # iOS manual and automatic updates use GET. Fetch nodes first so a
        # successful download cannot silently serve the six-hour-old snapshot.
        # Health checks use a header to inspect the last-good file without
        # triggering another upstream fetch during a deployment.
        if include_body and parsed.path == "/surge-v2.conf" and self.headers.get("X-Proxy-Config-Health") != "1":
            try:
                refreshed = refresh_surge()
            except (OSError, subprocess.SubprocessError):
                refreshed = False
            if not refreshed:
                self.send_error(503, "Surge node refresh failed; previous profile retained")
                return
        try:
            with open(os.path.join(BASE, profile_name), "rb") as handle:
                profile = handle.read()
        except OSError:
            self.send_error(503)
            return

        # The VPS path URL is the canonical client update address.  Returning it
        # even when a profile is fetched through a legacy Funnel URL lets a
        # successful final legacy refresh self-migrate the client to the fixed
        # VPS endpoint.  Keep the old host/token form as a local-only fallback
        # for an installation that has not yet provisioned the VPS paths.
        managed_url_file = MANAGED_URL_FILES[parsed.path]
        try:
            with open(os.path.join(BASE, managed_url_file), encoding="ascii") as handle:
                managed_url = handle.read().strip()
        except OSError:
            try:
                with open(PUBLIC_HOST_FILE, encoding="ascii") as handle:
                    public_host = handle.read().strip()
            except OSError:
                self.send_error(503)
                return
            managed_url = "https://{}{}?token={}".format(public_host, parsed.path, expected)
        if not managed_url.startswith("https://"):
            self.send_error(503)
            return
        interval = 3600 if parsed.path == "/surge-v2.conf" else 21600
        directive = "#!MANAGED-CONFIG {} interval={} strict=false\n".format(managed_url, interval)
        body = directive.encode("utf-8") + profile
        self.send_response(200)
        self.send_header("Content-Type", "text/plain; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self.send_header("profile-update-interval", "1" if parsed.path == "/surge-v2.conf" else "6")
        self.end_headers()
        if include_body:
            self.wfile.write(body)


if __name__ == "__main__":
    server = ThreadingHTTPServer(("127.0.0.1", 13002), Handler)
    print("Managed profile gateway listening on 127.0.0.1:13002", flush=True)
    server.serve_forever()
