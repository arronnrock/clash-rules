#!/usr/bin/env python3
import re
import sys


MARKER = "# Sub-Store injects the private Surfboard proxy list here."
REGIONS = {
    "US": re.compile(r"(\bUS\b|USA|United\s*States|美国|美國|🇺🇸|洛杉矶|洛杉磯|圣何塞|聖何塞|西雅图|西雅圖|达拉斯|達拉斯|纽约|紐約|Los\s*Angeles|San\s*Jose|Seattle|Dallas|New\s*York|c87s[123]\b|US\d+)", re.I),
    "HK": re.compile(r"(\bHK\b|Hong\s*Kong|香港|🇭🇰|HKBN|HK\d+)", re.I),
    "JP": re.compile(r"(\bJP\b|Japan|日本|🇯🇵|东京|東京|大阪|埼玉|樱花|櫻花|biglobe|c87s4\b|JP\d+)", re.I),
    "SG": re.compile(r"(\bSG\b|Singapore|新加坡|狮城|獅城|🇸🇬|SG\d+)", re.I),
}
INFO_NODES = [
    re.compile(r"^🔄?\s*建议.*更新订阅", re.I), re.compile(r"^剩余流量"),
    re.compile(r"^剩余"), re.compile(r"^距离下次重置"), re.compile(r"^套餐到期"),
    re.compile(r"^苏菲家宽官网地址"), re.compile(r"^官网地址防失联发布页"),
    re.compile(r"^地址防失联发布页"), re.compile(r"^联通移动用中转"),
]
SUPPORTED = {"http", "https", "socks5", "socks5-tls", "ss", "vmess", "trojan", "wireguard", "hysteria2", "anytls", "tuic", "snell"}
HYSTERIA2_PARAMS = {"password", "download-bandwidth", "port-hopping", "port-hopping-interval", "skip-cert-verify", "sni", "server-cert-fingerprint-sha256", "salamander-password", "udp-relay", "underlying-proxy", "block-quic"}


def fail(message):
    raise SystemExit(message)


def has_udp_relay(fields):
    return any(field.strip().lower() == "udp-relay=true" for field in fields[3:])


def fields_from_line(line):
    separator = line.find("=")
    if separator <= 0:
        return []
    return [field.strip() for field in line[separator + 1:].split(",")]


def main():
    if len(sys.argv) != 3:
        fail("usage: render_surfboard.py TEMPLATE NODES")
    with open(sys.argv[1], encoding="utf-8") as handle:
        template = handle.read()
    with open(sys.argv[2], encoding="utf-8") as handle:
        raw_nodes = handle.read()
    if template.count(MARKER) != 1:
        fail("template must contain exactly one Surfboard proxy marker")

    raw_lines = raw_nodes.splitlines()
    has_udp_ss = any(
        fields and fields[0].lower() == "ss" and has_udp_relay(fields)
        for fields in (fields_from_line(raw_line.strip()) for raw_line in raw_lines)
    )

    nodes, names, protocols = [], [], {}
    for raw_line in raw_lines:
        line = raw_line.strip()
        if not line:
            continue
        separator = line.find("=")
        if separator <= 0:
            fail("Sub-Store returned a malformed proxy line")
        name = line[:separator].strip()
        if any(pattern.search(name) for pattern in INFO_NODES):
            continue
        fields = [field.strip() for field in line[separator + 1:].split(",")]
        protocol = fields[0].lower()
        if protocol not in SUPPORTED:
            fail("unsupported Surfboard proxy protocol: " + protocol)
        if protocol == "hysteria2":
            for field in fields[3:]:
                if "=" not in field:
                    continue
                key = field.split("=", 1)[0].strip()
                if key not in HYSTERIA2_PARAMS:
                    fail("unsupported Surfboard Hysteria2 parameter: " + key)
        # Surfboard policy filters can match only a proxy name, not its
        # protocol.  Tag the Android-only rendered names so its automatic
        # groups can prefer SS/TCP on restrictive mainland mobile networks
        # while retaining Hysteria2 for fallback and manual selection.
        has_underlying_proxy = any(field.split("=", 1)[0].strip() == "underlying-proxy" for field in fields[3:] if "=" in field)
        suffix = line[separator:]
        if protocol == "hysteria2" and has_udp_ss and not has_underlying_proxy:
            suffix += ", underlying-proxy=H2-UNDERLAY"
        marker = "H2" if protocol == "hysteria2" else "SS][UDP" if protocol == "ss" and has_udp_relay(fields) else protocol.upper()
        nodes.append("{} [{}]{}".format(name, marker, suffix))
        names.append(name)
        protocols[protocol] = protocols.get(protocol, 0) + 1

    if not nodes:
        fail("Sub-Store returned no usable Surfboard nodes")
    if len(names) != len(set(names)):
        fail("Sub-Store returned duplicate proxy names")
    counts = {region: sum(bool(pattern.search(name)) for name in names)
              for region, pattern in REGIONS.items()}
    missing = [region for region, count in counts.items() if count == 0]
    if missing:
        fail("no nodes matched required regions: " + ", ".join(missing))

    profile = template.replace(MARKER, "\n".join(nodes))
    for required in ("[General]", "[Proxy]", "[Proxy Group]", "[Rule]"):
        if required not in profile:
            fail("generated profile is missing " + required)
    sys.stdout.write(profile.rstrip("\n") + "\n")
    print("generated proxies={} protocols={} US={} HK={} JP={} SG={}".format(
        len(nodes), protocols, counts["US"], counts["HK"], counts["JP"], counts["SG"]
    ), file=sys.stderr)


if __name__ == "__main__":
    main()
