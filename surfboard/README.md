# Surfboard Android migration v1

This directory is an Android-only Surfboard profile. It does not replace or
modify the existing Mihomo, Stash or Surge configurations.

## Requirements and operating model

- Surfboard Android 2.34.2 or newer.
- Keep Surfboard **Bypass Configuration empty**. Application routing is done by
  `PROCESS-NAME` rules; excluding an app from the VPN prevents those rules from
  seeing it.
- Mainland cellular and unknown/mainland Wi-Fi use `PROXY` for non-mainland
  traffic. On overseas Wi-Fi, manually select `WIFI = DIRECT`.
- OpenAI always uses `AI-REGION` (US by default); PayPal always uses `US-AUTO`.
  On Android, SS/TCP candidates are preferred inside the US and default
  automatic paths before Hysteria2. This avoids a mainland mobile network's
  UDP/QUIC filtering turning an otherwise healthy profile into a total outage;
  Hysteria2 remains available for regional failover and manual selection.
  When the private collection has an SS node with UDP relay explicitly enabled,
  Android also chains Hysteria2 through that hidden SS underlay. This restores
  access to Hysteria2 servers when the local network blocks their direct UDP
  path, without changing the Hysteria2 exit node itself.
  Those rules precede `WIFI`, so the overseas setting cannot move them direct.
- Tiger, Futu and Longbridge use `ACCESS`: they are proxied on mainland
  cellular/mainland Wi-Fi and become direct when `WIFI = DIRECT` overseas.

Surfboard has a native subnet group but no equivalent of the Surge JavaScript
that classifies Wi-Fi from a public-IP country lookup. Keeping unknown Wi-Fi on
`PROXY` is the safe default.

## ChatGPT TLS/SSL protections

The profile disables IPv6, routes the entire official ChatGPT package through
`AI-REGION`, forces remote DNS with enhanced mode, duplicates critical OpenAI
domains inline for WebView/browser flows, and rejects QUIC only for ChatGPT so
it falls back to TCP/TLS. It does not use MITM, install a certificate, disable
application certificate checks, or pin changing OpenAI CDN addresses.

Changing `AI-REGION` changes country intentionally. Automatic checks only move
between nodes inside the selected country, preventing ordinary latency tests
from moving an active login among US, JP and SG.

## Nodes and private profile generation

Airport nodes, server addresses and credentials are never committed. The
Sub-Store script first requests collection `private` as `Surfboard`. The
currently deployed producer emits only three Shadowsocks nodes and omits the
Hysteria2 nodes, so the script falls back to Surge-compatible node lines after
checking every protocol/parameter and requiring US, HK, JP and SG coverage.
Surfboard 2.34.2+ accepts the resulting Hysteria2 syntax.

The served profile is self-contained: every public rule file in `rules/` is
compiled inline into `surfboard.conf`. Surfboard therefore performs one managed
profile request instead of fetching eight GitHub Raw resources during import.
This avoids the client behavior where one external-resource timeout rejects the
entire profile. The validator requires every rule-source entry to be present in
the complete profile. Managed `*.ts.net` traffic follows `ACCESS`, so mainland
cellular updates use the proxy after the initial import.

Generate a private profile without writing credentials into the repository:

```bash
ssh SUBSTORE_VPS 'curl -fsS http://127.0.0.1:3000/download/collection/private/Surge' \
  | node surfboard/scripts/render-private-profile.mjs \
  > /a/private/location/surfboard-v1.conf
```

Run repository validation with:

```bash
node surfboard/scripts/build-artifact.mjs
node surfboard/scripts/validate.mjs
python3 -m py_compile surfboard/scripts/macmini/render_surfboard.py \
  surfboard/scripts/macmini/serve_profiles.py
```

## Mac mini managed-profile gateway

The Mac mini HTTP gateway stays bound to loopback. A dedicated, restricted
reverse SSH tunnel exposes it only as a second loopback port on the VPS; Nginx
serves the exact `/surfboard-v1/PRIVATE_PATH_TOKEN` route over HTTPS. Tailscale
Funnel is not part of the production delivery path.

Every six hours, `refresh-surfboard.sh` reads the template from the explicitly
deployed Git commit and streams the private collection through the existing
forced-command read-only SSH key. It validates protocols, Hysteria2 parameters,
duplicate names and four-region coverage before atomically replacing the
last-good profile. A later GitHub push does not change production until its
exact commit is deployed; failed collection fetches or validation never replace
the served configuration.

The server prepends this private first line at response time:

```text
#!MANAGED-CONFIG https://PRIVATE-HOST/surfboard-v1/PRIVATE_PATH_TOKEN interval=21600 strict=false
```

Neither the host nor token is stored in GitHub. Do not expose the VPS frontend,
backend or management API, and do not modify the Sub-Store database for this
migration.

## Rule precedence

1. LAN, Tailscale and corporate routes: `DIRECT`.
2. ChatGPT/OpenAI: `AI-REGION`; PayPal: `US-AUTO`.
3. Tiger/Futu/Longbridge applications and domains: `ACCESS`.
4. WeChat, Android compatibility and mainland China: `DIRECT`.
5. Google Play, Telegram and other international services: `ACCESS`.
6. `FINAL,ACCESS`.

The historical WeChat image, Google Play, OEM connectivity, company DNS,
Telegram DNS and mainland direct fixes are preserved in Surfboard-native rule
files.
