#!/usr/bin/env python3
import re
import sys


MARKER = "# Sub-Store injects the private Surge proxy list here."
REGIONS = {
    "US": re.compile(r"(\bUS\b|USA|United\s*States|美国|美國|🇺🇸|洛杉矶|洛杉磯|圣何塞|聖何塞|西雅图|西雅圖|达拉斯|達拉斯|纽约|紐約|Los\s*Angeles|San\s*Jose|Seattle|Dallas|New\s*York|c87s[123]\b|US\d+)", re.I),
    "HK": re.compile(r"(\bHK\b|Hong\s*Kong|香港|🇭🇰|HKBN|HK\d+)", re.I),
    "JP": re.compile(r"(\bJP\b|Japan|日本|🇯🇵|东京|東京|大阪|埼玉|樱花|櫻花|biglobe|c87s4\b|JP\d+)", re.I),
    "SG": re.compile(r"(\bSG\b|Singapore|新加坡|狮城|獅城|🇸🇬|SG\d+)", re.I),
}
INFO_NODES = [
    re.compile(r"^🔄?\s*建议.*更新订阅", re.I),
    re.compile(r"^剩余流量"),
    re.compile(r"^剩余"),
    re.compile(r"^距离下次重置"),
    re.compile(r"^套餐到期"),
    re.compile(r"^苏菲家宽官网地址"),
    re.compile(r"^官网地址防失联发布页"),
    re.compile(r"^地址防失联发布页"),
    re.compile(r"^联通移动用中转"),
]


def fail(message):
    raise SystemExit(message)


def main():
    if len(sys.argv) != 3:
        fail("usage: render_surge.py TEMPLATE NODES")
    with open(sys.argv[1], encoding="utf-8") as handle:
        template = handle.read()
    with open(sys.argv[2], encoding="utf-8") as handle:
        raw_nodes = handle.read()
    if template.count(MARKER) != 1:
        fail("template must contain exactly one Surge proxy marker")

    nodes = []
    names = []
    for raw_line in raw_nodes.splitlines():
        line = raw_line.strip()
        if not line:
            continue
        separator = line.find("=")
        if separator <= 0:
            fail("Sub-Store returned a malformed Surge proxy line")
        name = line[:separator].strip()
        if any(pattern.search(name) for pattern in INFO_NODES):
            continue
        nodes.append(line)
        names.append(name)

    if not nodes:
        fail("Sub-Store returned no usable Surge nodes")
    if len(names) != len(set(names)):
        fail("Sub-Store returned duplicate Surge node names")
    counts = {
        region: sum(bool(pattern.search(name)) for name in names)
        for region, pattern in REGIONS.items()
    }
    missing = [region for region, count in counts.items() if count == 0]
    if missing:
        fail("no nodes matched required regions: " + ", ".join(missing))

    profile = template.replace(MARKER, "\n".join(nodes))
    for required in ("[General]", "[Proxy]", "[Proxy Group]", "[Rule]"):
        if required not in profile:
            fail("generated profile is missing " + required)
    sys.stdout.write(profile.rstrip("\n") + "\n")
    print(
        "generated proxies={} US={} HK={} JP={} SG={}".format(
            len(nodes), counts["US"], counts["HK"], counts["JP"], counts["SG"]
        ),
        file=sys.stderr,
    )


if __name__ == "__main__":
    main()
