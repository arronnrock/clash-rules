#!/usr/bin/env python3
import argparse
import ipaddress
from pathlib import Path
import re


TOKEN = re.compile(r"^[A-Za-z0-9_-]{24,128}$")
PATH_TOKEN = re.compile(r"^[0-9a-f]{64}$")


def read(path, label, pattern=None):
    value = Path(path).read_text(encoding="utf-8").strip()
    if not value or (pattern and not pattern.fullmatch(value)):
        raise SystemExit("invalid " + label)
    return value


def absolute_file(value, label):
    path = Path(value)
    if not path.is_absolute() or not path.is_file():
        raise SystemExit("invalid " + label)
    return str(path)


def location(external_prefix, internal_profile, path_token, internal_token, host):
    external = "https://{}/{}/{}".format(host, external_prefix, path_token)
    internal_route = "/{}?token={}".format(internal_profile, internal_token)
    internal_url = "https://{}/{}".format(host, internal_route.lstrip("/"))
    return """  location = /{external_prefix}/{path_token} {{
    proxy_pass http://127.0.0.1:23132{internal_route};
    proxy_http_version 1.1;
    proxy_set_header Connection "";
    proxy_set_header Host 127.0.0.1;
    proxy_set_header Accept-Encoding "";
    proxy_connect_timeout 5s;
    proxy_read_timeout 30s;
    proxy_hide_header Content-Length;
    sub_filter_once on;
    sub_filter_types text/plain;
    sub_filter '{internal_url}' '{external}';
  }}
""".format(
        external_prefix=external_prefix,
        path_token=path_token,
        internal_route=internal_route,
        internal_url=internal_url,
        external=external,
    )


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--host-file", required=True)
    parser.add_argument("--certificate", required=True)
    parser.add_argument("--certificate-key", required=True)
    parser.add_argument("--surge-token-file", required=True)
    parser.add_argument("--surge-path-token-file", required=True)
    parser.add_argument("--surfboard-token-file", required=True)
    parser.add_argument("--surfboard-path-token-file", required=True)
    args = parser.parse_args()

    host = read(args.host_file, "public host")
    try:
        ipaddress.ip_address(host)
    except ValueError:
        raise SystemExit("public host must be an IP address")
    certificate = absolute_file(args.certificate, "certificate")
    certificate_key = absolute_file(args.certificate_key, "certificate key")
    surge_token = read(args.surge_token_file, "Surge token", TOKEN)
    surge_path = read(args.surge_path_token_file, "Surge path token", PATH_TOKEN)
    surfboard_token = read(args.surfboard_token_file, "Surfboard token", TOKEN)
    surfboard_path = read(args.surfboard_path_token_file, "Surfboard path token", PATH_TOKEN)

    print("server {")
    print("  listen 443 ssl http2;")
    print("  server_name {};".format(host))
    print("  ssl_certificate {};".format(certificate))
    print("  ssl_certificate_key {};".format(certificate_key))
    if Path("/etc/letsencrypt/options-ssl-nginx.conf").is_file():
        print("  include /etc/letsencrypt/options-ssl-nginx.conf;")
    if Path("/etc/letsencrypt/ssl-dhparams.pem").is_file():
        print("  ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;")
    print("  access_log off;")
    print("  add_header Cache-Control no-store always;")
    print()
    print(location("surge-v2", "surge-v2.conf", surge_path, surge_token, host), end="")
    print(location("surfboard-v1", "surfboard-v1.conf", surfboard_path, surfboard_token, host), end="")
    print("  location / {")
    print("    return 404;")
    print("  }")
    print("}")


if __name__ == "__main__":
    main()
