# Surge iOS

This directory contains the Surge 5 rule template for the personal iPhone
configuration. It is independent from the existing Stash and Mihomo overrides.

## Architecture

- GitHub stores the Surge template, rule lists, validation script and generated
  credential-free distribution file.
- The private VPS Sub-Store keeps subscription URLs, proxy credentials and node
  conversion.
- Sub-Store injects the `[Proxy]` policies into this template and publishes the
  final private managed profile used by Surge.
- The GitHub Raw profile is a template. Do not import it directly before
  Sub-Store has injected proxy policies.

Sub-Store template Raw URLs:

```text
Default: https://raw.githubusercontent.com/arronnrock/clash-rules/main/dist/surge/surge_private_v1.conf
Global: https://raw.githubusercontent.com/arronnrock/clash-rules/main/dist/surge/surge_private_global_v1.conf
```

Rule Raw base URL:

```text
https://raw.githubusercontent.com/arronnrock/clash-rules/main/surge/rules/
```

## Routing

Both profiles evaluate these rules from top to bottom:

1. LAN traffic is direct.
2. OpenAI/ChatGPT and PayPal use `US`.
3. Remaining cellular traffic is direct.
4. WeChat, domestic services and China IPs are direct.
5. Explicit foreign services use `GLOBAL-PROXY`.

`surge_private_v1.conf` then sends unknown traffic to `DIRECT`. It is the normal,
direct-priority profile.

`surge_private_global_v1.conf` adds one Wi-Fi-only fallback after the domestic
and foreign rules: remaining Wi-Fi traffic uses `GLOBAL-PROXY`. It is a
temporary foreign-priority profile for inaccessible foreign services and
controlled A/B testing. Unknown domestic domains may be proxied in the global
profile, so it is not the default profile.

YouTube uses CMHK direct on cellular in both profiles, but uses
`GLOBAL-PROXY` on Wi-Fi. `GLOBAL-PROXY` defaults to `HK` and can be changed to
`JP`, `SG`, `TW`, `US` or `OTHER` without affecting OpenAI or PayPal.

## Node Groups

Node policies are not stored in this repository. Surge groups filter policies
injected by Sub-Store:

- `c87s1`, `c87s2`, `c87s3`: US
- `c87s4`: JP
- `c87s5`: excluded
- Hong Kong, Japan, Singapore, Taiwan and United States: regional groups
- United Kingdom, Canada, Korea, Thailand, Vietnam, Nigeria and other listed
  regions: `OTHER`

No regional group contains `DIRECT`.

## DNS

The template uses the system DNS by default. Xiaohongshu domains use AliDNS
`223.5.5.5` explicitly because previous testing showed unstable `xhscdn.com`
resolution. No encrypted DNS, MITM, Rewrite, QUIC override, MTU override or
global IPv6 change is enabled.

## Updating

1. Edit the files under `surge/`.
2. Run `node surge/scripts/build.mjs`.
3. Review the generated A and B profiles under `dist/surge/`.
4. Push the source and generated file together.
5. Update the private Sub-Store output and complete the test checklist.

The build script validates the routing invariants before updating `dist`.
GitHub Actions and the GitHub `workflow` permission are not required.

## Security

Never commit subscription URLs, tokens, proxy servers, ports, passwords, UUIDs
or generated proxy policies. This repository is public. The final usable managed
profile remains on the private Sub-Store service.

## iOS Limitation

Surge iOS does not provide reliable process-based routing for this design.
`PROCESS-NAME`, `PROCESS-PATH` and related rules are intentionally prohibited.
The configuration uses network type, domains, TLS SNI/HTTP Host matching and IP
rules only.
