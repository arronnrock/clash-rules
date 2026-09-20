#!/usr/bin/env python3
"""Check managed update freshness without contacting private infrastructure."""
from email.message import Message
import importlib.util
from io import BytesIO
from pathlib import Path
import tempfile
from unittest.mock import patch


source = Path(__file__).resolve().parent / "serve_profiles.py"
spec = importlib.util.spec_from_file_location("serve_profiles", source)
gateway = importlib.util.module_from_spec(spec)
spec.loader.exec_module(gateway)


def request(route, *, head=False, health=False):
    handler = object.__new__(gateway.Handler)
    handler.path = route
    handler.headers = Message()
    if health:
        handler.headers["X-Proxy-Config-Health"] = "1"
    handler.wfile = BytesIO()
    status = []
    headers = {}
    handler.send_error = lambda code, *args: status.append(code)
    handler.send_response = lambda code: status.append(code)
    handler.send_header = lambda key, value: headers.__setitem__(key, value)
    handler.end_headers = lambda: None
    handler.respond(not head)
    return status, headers, handler.wfile.getvalue()


with tempfile.TemporaryDirectory(prefix="gateway-update-test-") as temporary:
    gateway.BASE = temporary
    root = Path(temporary)
    (root / "token").write_text("test-token")
    (root / "surge-v2.conf").write_text("[Proxy]\nTest = direct\n")
    (root / "surge-vps-path-managed-url.txt").write_text("https://example.invalid/surge")

    with patch.object(gateway, "refresh_surge", return_value=True) as refresh:
        assert request("/surge-v2.conf?token=test-token", head=True)[0] == [200]
        assert refresh.call_count == 0
        status, headers, body = request("/surge-v2.conf?token=test-token")
        assert status == [200]
        assert body.startswith(b"#!MANAGED-CONFIG https://example.invalid/surge interval=10800 strict=false\n")
        assert headers["profile-update-interval"] == "1"
        assert refresh.call_count == 1
        assert request("/surge-v2.conf?token=test-token", health=True)[0] == [200]
        assert refresh.call_count == 1
        assert request("/removed-profile.conf?token=test-token")[0] == [404]
        assert request("/surge-v2.conf?token=bad")[0] == [404]
        assert refresh.call_count == 1

    with patch.object(gateway, "refresh_surge", return_value=False):
        assert request("/surge-v2.conf?token=test-token")[0] == [503]
        assert (root / "surge-v2.conf").read_text() == "[Proxy]\nTest = direct\n"

print("Managed profile refresh behavior validated")
