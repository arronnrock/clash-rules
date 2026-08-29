#!/usr/bin/env python3
import os
from pathlib import Path
import subprocess
import sys
import tempfile


REQUIRED = (
    "surge/surge.conf",
    "surge/scripts/macmini/render_surge.py",
    "surge/scripts/macmini/refresh-surge.sh",
    "surfboard/surfboard.conf",
    "surfboard/scripts/macmini/render_surfboard.py",
    "surfboard/scripts/macmini/refresh-surfboard.sh",
    "surfboard/scripts/macmini/serve_profiles.py",
    "ops/macmini/health-check.sh",
    "ops/macmini/update-runtime.sh",
)
SYNTHETIC_NODES = """美国 US1 = hysteria2, 192.0.2.1, 443, password=test, sni=example.com, skip-cert-verify=true
香港 HK1 = hysteria2, 192.0.2.2, 443, password=test, sni=example.com, skip-cert-verify=true
日本 JP1 = hysteria2, 192.0.2.3, 443, password=test, sni=example.com, skip-cert-verify=true
新加坡 SG1 = ss, 192.0.2.4, 443, encrypt-method=aes-128-gcm, password=test, udp-relay=true
"""


def fail(message):
    raise SystemExit(message)


def run(command, **kwargs):
    return subprocess.run(command, check=True, text=True, **kwargs)


def main():
    root = Path(sys.argv[1] if len(sys.argv) == 2 else ".").resolve()
    for relative in REQUIRED:
        if not (root / relative).is_file():
            fail("missing runtime source file: " + relative)

    templates = {
        "Surge": (root / "surge/surge.conf", "# Sub-Store injects the private Surge proxy list here."),
        "Surfboard": (root / "surfboard/surfboard.conf", "# Sub-Store injects the private Surfboard proxy list here."),
    }
    for name, (path, marker) in templates.items():
        content = path.read_text(encoding="utf-8")
        if content.count(marker) != 1:
            fail("{} template must contain exactly one proxy marker".format(name))
        for section in ("[General]", "[Proxy]", "[Proxy Group]", "[Rule]"):
            if section not in content:
                fail("{} template is missing {}".format(name, section))
        if "#!MANAGED-CONFIG" in content:
            fail(name + " public template contains a private managed URL")

    python_files = [
        root / "surge/scripts/macmini/render_surge.py",
        root / "surfboard/scripts/macmini/render_surfboard.py",
        root / "surfboard/scripts/macmini/serve_profiles.py",
        root / "ops/macmini/validate-runtime.py",
    ]
    shell_files = [
        root / "surge/scripts/macmini/refresh-surge.sh",
        root / "surfboard/scripts/macmini/refresh-surfboard.sh",
        root / "ops/macmini/health-check.sh",
        root / "ops/macmini/update-runtime.sh",
    ]

    with tempfile.TemporaryDirectory(prefix="proxy-config-validate-") as temporary:
        temp = Path(temporary)
        env = dict(os.environ)
        env["PYTHONPYCACHEPREFIX"] = str(temp / "pycache")
        run([sys.executable, "-m", "py_compile"] + [str(path) for path in python_files], env=env)
        for path in shell_files:
            run(["/bin/zsh", "-n", str(path)])

        nodes = temp / "nodes.conf"
        nodes.write_text(SYNTHETIC_NODES, encoding="utf-8")
        render_jobs = (
            (
                root / "surge/scripts/macmini/render_surge.py",
                root / "surge/surge.conf",
                temp / "surge-rendered.conf",
            ),
            (
                root / "surfboard/scripts/macmini/render_surfboard.py",
                root / "surfboard/surfboard.conf",
                temp / "surfboard-rendered.conf",
            ),
        )
        for renderer, template, output in render_jobs:
            with output.open("w", encoding="utf-8") as handle:
                run([sys.executable, str(renderer), str(template), str(nodes)], stdout=handle)
            rendered = output.read_text(encoding="utf-8")
            for region in ("US", "HK", "JP", "SG"):
                if region not in rendered:
                    fail("rendered profile lost required region " + region)
            if rendered.count("192.0.2.") != 4:
                fail("renderer did not inject all synthetic nodes")

    print("Mac mini runtime source validated")


if __name__ == "__main__":
    main()
