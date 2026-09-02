# Surge Mac / iOS migration v2

This directory contains the first shared Surge core profile migrated from the
repository's Mihomo and Stash overrides. The migration is additive: files under
`overrides/` and `rule-providers/` are not changed or removed.

The new entry point is `surge/surge.conf`. The older
`surge_private_v1.conf` / `surge_private_global_v1.conf` A/B profiles remain in
the repository for comparison, but are not part of the v2 architecture.

## Version requirement

The profile targets Surge Mac 6.9+ and Surge iOS 5.22+. Those versions provide
the `engine-started` event used by `scripts/network-region.js`. The policy and
rule syntax is otherwise shared by Mac and iOS.

## Migration audit

### Source inventory

The public repository does not contain a standalone Mihomo main YAML, a
`proxy-providers` block, airport subscriptions, proxy credentials, or the
private Sub-Store database. Its effective Mihomo/Stash configuration is built
from these sources:

- `overrides/mihomo_private_v11.js`: latest private Mihomo override and primary
  source for DNS, groups and routing.
- `overrides/mihomo_private_stash_v9.js`: latest Stash override; adds Stash
  network selection and the Tencent image IP fix.
- `overrides/mihomo_android_cn.js`: Android/OEM compatibility source.
- `overrides/mihomo_public_v7.js`: public fallback/reference override.
- `rule-providers/*.yaml`: OpenAI, Apple AI/media, Gemini, Google, PayPal,
  Telegram, WhatsApp, YouTube and NSFW domain sources.
- `surge/substore/inject-private-proxies.js` and `dist/surge/*.json`: earlier
  Sub-Store node-injection design. They reveal the collection name `private`,
  but not the private Sub-Store host or credentials.

There is no literal `proxy-provider` in the current repository. The Mihomo
overrides use `include-all: true`; therefore the upstream Mihomo configuration
or Sub-Store output supplies the actual proxies before the override builds
groups.

### Current groups and node naming

`mihomo_private_v11.js` defines `PROXY`, `US`, `JP`, `HK`, `SG`, `TW` and
`OTHER`. `PROXY` defaults to HK. US/JP are manual select groups; HK/SG/TW use
`url-test`; `OTHER` is manual. Stash v9 replaces `PROXY` with `NETWORK` and an
SSID/cellular policy.

Observed regional names include English codes, English/Chinese region names,
flags and city names. The historical opaque mappings are:

- `c87s1`, `c87s2`, `c87s3` -> US
- `c87s4` -> JP
- `c87s5` -> intentionally unmatched

The v2 filters retain those mappings and add traditional-Chinese aliases. They
only use region identifiers, flags and unambiguous city names. Generic line
attributes such as `家宽`, `家寬` and `BGP` are deliberately excluded because
they occur in US, HK, Taiwan, Canada and other regions.

A read-only production check on 2026-08-26 generated 50 Surge proxy lines from
the existing `private` collection: US 14, HK 6, JP 9, SG 4 and 17 nodes outside
the requested four-region scope. The sources produced 3 Shadowsocks and 47
Hysteria 2 lines with no duplicate names. One subscription-information entry
named `建议每日更新订阅` was also represented as a proxy; the Surge-only
injection script removes it without changing the shared `private` collection.

### Keep

- US/HK/JP/SG regional selection and both automatic and manual control.
- OpenAI/ChatGPT/Sora, Apple AI and necessary AI dependencies on one manually
  selected region. The default is US; JP and SG remain manual alternatives.
- A stable US automatic egress for the US-region PayPal account.
- HK as the first region of the generic international fallback.
- Mainland domains, China IPs, LAN/private ranges and corporate traffic as
  `DIRECT`.
- `szridge.com` split DNS via `10.0.0.1` and `10.0.0.200`.
- WeChat/WeCom/Tencent CDN domains plus `43.154.95.0/24` as `DIRECT`.
- Xiaohongshu AliDNS mapping.
- Google connectivity, Google Play and Android/OEM compatibility rules.
- OpenAI auth/static/upload dependencies on the same `AI-REGION` decision. No
  MITM, rewrite, certificate bypass or QUIC override is introduced.
- Tiger, Futu/moomoo and Longbridge traffic as one rule category whose result
  depends on the access network, not a separate business policy group.

### Merge

- Mihomo `PROXY`, Stash `NETWORK` and the old Surge `GLOBAL-PROXY` become
  `PROXY` plus the script-controlled `WIFI` group.
- Repeated inline service domains and YAML providers become Surge rule
  categories for stable AI, PayPal-US, securities-by-Wi-Fi, WeChat direct,
  compatibility direct, China direct and ordinary international Wi-Fi.
- Repeated private CIDRs are covered by Surge's built-in `LAN` rule set plus a
  small corporate list.

### Remove from the new architecture

Nothing is deleted from the old Mihomo/Stash files. These groups are simply not
recreated in `surge.conf`:

- `TW` and `OTHER`: outside the requested four-region scope.
- `NETWORK`, `GLOBAL-PROXY` and the old `FINAL` select group: replaced by
  `PROXY`, `WIFI`, and the final rule.
- Separate business select groups for OpenAI, Google, Apple AI and Telegram are
  unnecessary. One `AI-REGION` selector exists only because the required
  region must be changed explicitly rather than by automatic cross-country
  fallback. PayPal points to `US-AUTO`; other categories point directly to
  `WIFI` or `DIRECT`.
- Two Surge A/B profiles: superseded by one shared core and one runtime `WIFI`
  decision. Legacy files remain for audit history.

### Surge-native replacements

| Mihomo / Stash | Surge v2 |
| --- | --- |
| Upstream proxies + `include-all` | Sub-Store injects a Surge node list into `[Proxy]`; groups use `include-all-proxies` |
| Group `filter` / `exclude-filter` | `policy-regex-filter` |
| `url-test` | Surge `url-test` |
| Priority/failure handling | Surge `fallback` inside `US-AUTO` and for generic `PROXY-AUTO` |
| Stash `ssid-policy` | event script changing the `WIFI` select group |
| `nameserver-policy` | `[Host]` per-domain `server:` mappings |
| `GEOSITE,cn` + explicit domains | local China rules plus `GEOIP,CN` |
| `MATCH` | `FINAL,WIFI` |

### Redesigned items

- `US-AUTO` uses ordered fallback, a 300-second result interval and first-use
  evaluation. It may change US nodes after a network transition but cannot
  leave the US region.
- `AI-REGION` is a manual region selector: US is the default; JP and SG remain
  available when the user intentionally changes region. It never changes
  country automatically during an OpenAI session.
- HK/JP/SG automatic groups use latency testing with 100 ms damping. Failed
  nodes are excluded from the winning candidates.
- The Sub-Store injection refuses to publish a new profile if any of US, HK,
  JP or SG has no matching node. It never fills an empty region with another
  country, so a provider naming or availability failure cannot silently change
  the requested exit region.
- `PROXY-AUTO` prefers HK, then SG, JP and US, providing a regional fallback
  for ordinary international traffic without removing manual control.
- Every region exposes a separate `*-MANUAL` group. The parent region defaults
  to `*-AUTO`, and users may switch either the parent or manual node at any
  time.
- On iOS, AI, PayPal and LAN rules are evaluated before
  `SUBNET,TYPE:CELLULAR,DIRECT`; all other cellular traffic is direct.
- Securities rules are below that cellular catch-all: CMHK cellular therefore
  stays direct. On mainland Wi-Fi they resolve through `WIFI = PROXY`; on HK,
  MO and every other overseas Wi-Fi they resolve through `WIFI = DIRECT`.
- On Wi-Fi and on Mac, unmatched traffic uses `WIFI`. A DIRECT public-country
  check sets it to `PROXY` only in CN and to `DIRECT` in HK, MO, and all other
  countries.

## Directory layout

```text
surge/
├── surge.conf
├── rules/
│   ├── ai-stable.list
│   ├── china-direct-v2.list
│   ├── compat-direct.list
│   ├── international-wifi.list
│   ├── lan-corporate-direct.list
│   ├── paypal-us.list
│   ├── securities-wifi.list
│   └── wechat-direct-v2.list
├── substore/
│   ├── inject-private-proxies-v2.js
│   └── substore-surge-v2.json
├── scripts/
│   ├── audit-private-nodes.mjs
│   ├── network-region.js
│   ├── render-private-profile.mjs
│   ├── update-active-profile.mjs
│   └── validate-v2.mjs
└── README.md
```

Legacy Surge files are intentionally still present beside this v2 layout.

## Node source: Sub-Store complete-profile injection

No airport node, subscription URL, Sub-Store host or access token is hard-coded
in `surge.conf`. The public file is a template and is not the URL that should be
imported directly into Surge.

The v2 path is:

```text
existing private collection
        ↓ produceArtifact(platform: Surge)
Surge [Proxy] node lines
        ↓ inject into public surge.conf template
private complete profile (surge_v2)
        ↓ one private Sub-Store share/download URL
Surge Mac + Surge iOS
```

Repository-side setup is already provided:

- `substore/substore-surge-v2.json` is the ready file-artifact definition;
- its remote source is the public `surge/surge.conf` template;
- its only processor is the embedded v2 injection script;
- the script produces collection `private` with target platform `Surge`, removes
  subscription-information pseudo nodes, rejects duplicate names, requires at
  least one US/HK/JP/SG node, injects the remaining policies into `[Proxy]`, and
  returns a 24-hour profile update header.

After these files are published, import the JSON artifact definition into the
existing Sub-Store. If that Sub-Store version does not expose object import,
create one remote File named `surge_v2`, use the Raw `surge/surge.conf` URL,
add one Script Operator, and paste `inject-private-proxies-v2.js`. The result
must contain actual node lines between `[Proxy]` and `[Proxy Group]`.

Finally, copy the private `surge_v2` artifact share/download URL into Surge Mac
and Surge iOS. Do not put that URL in GitHub. Both clients will then receive the
same complete profile, and later airport changes require only updating the
existing `private` collection.

To repeat the regional audit without saving proxy credentials to disk, stream
the private Surge collection over an encrypted administrative connection:

```bash
ssh SUBSTORE_VPS 'curl -fsS http://127.0.0.1:3000/download/collection/private/Surge' \
  | node surge/scripts/audit-private-nodes.mjs
```

The audit prints only aggregate region/protocol counts. It does not print or
write proxy server addresses, ports, UUIDs or passwords.

For a temporary MacBook-only profile before the managed-profile gateway is
online, stream the same output into the renderer and save it only under the
repository-ignored `.private/` directory:

```bash
mkdir -p .private
ssh SUBSTORE_VPS 'curl -fsS http://127.0.0.1:3000/download/collection/private/Surge' \
  | node surge/scripts/render-private-profile.mjs \
  > .private/surge-v2-private.conf
chmod 600 .private/surge-v2-private.conf
```

The rendered file contains live proxy credentials. Never attach it to an
issue, copy it into `surge/`, or override the `.private/` Git ignore rule.

### Surge Mac automatic node refresh

Surge Mac normalizes an imported local profile and may add device-local
settings. Do not periodically overwrite that active profile with the public
template. Instead, stream the current `private` collection through
`scripts/update-active-profile.mjs`; it replaces only the active profile's
`[Proxy]` section and preserves every other section and local setting.

The updater must write to a temporary file, run `surge-cli --check`, and replace
the active profile atomically only after validation succeeds. A failed SSH
connection, missing region, duplicate name, malformed node or Surge syntax
error must leave the current profile untouched. After replacement, run
`surge-cli reload`; if Surge is not running, the updated profile will be used
at its next start.

### Mac mini subscription gateway

The VPS keeps the Sub-Store backend and management ports on loopback. Do not
weaken the existing Basic Auth or expose those ports. Client subscriptions use
the HTTPS frontend with its automatically renewed certificate:

```text
Surge Mac/iOS
    -> VPS HTTPS path with a private read-only token
    -> VPS loopback-only reverse SSH endpoint
    -> profile gateway on the always-on Mac mini
    -> profile rendered from a pinned Git commit
    -> restricted read-only Sub-Store collection fetch
```

The Mac mini gateway listens only on loopback and accepts the exact managed
profile routes. It must reject the management UI, `/api`, `/download` and every
other path. The iPhone and Android clients use the public HTTPS URL and do not
need to run Tailscale. A dedicated unprivileged VPS account accepts only one
reverse-forward listen address and cannot run commands; launchd restarts the
tunnel after a network interruption. Tailscale Funnel is not a production
dependency.

The final Surge profile URL is generated by the deployment and must not be
assembled or committed manually:

```text
https://PRIVATE-HOST/PRIVATE-SURGE-PATH
```

Do not use a URL containing `username:password@host` and do not serve the
generated profile over plain HTTP. Basic Auth remains a management control;
the long random path token is the client credential. Neither value is committed
to GitHub.

### Sub-Store data prerequisite

The audited Sub-Store container currently has no bind mount or Docker volume.
Its database exists only under `/opt/app/data` in the container writable layer.
Before importing `surge_v2`, upgrading the image or recreating the container,
make a verified host backup and add persistent storage. Do not pull/recreate
the current `latest` container before that backup: doing so may remove the
existing subscriptions, collections and file definitions.

The direct collection endpoint `/download/collection/private/Surge` is valid,
but v2 intentionally does not commit it as `policy-path`: a complete-profile
artifact keeps the private backend address or share token out of the public
template and gives both devices one subscription URL.

## Policy architecture

```text
US -> US-AUTO (fallback) | US-MANUAL
HK -> HK-AUTO (url-test) | HK-MANUAL
JP -> JP-AUTO (url-test) | JP-MANUAL
SG -> SG-AUTO (url-test) | SG-MANUAL

AI-REGION (select) -> US-AUTO | JP-AUTO | SG-AUTO
PROXY-AUTO -> HK-AUTO | SG-AUTO | JP-AUTO | US-AUTO
PROXY -> PROXY-AUTO | HK | US | JP | SG | DIRECT
WIFI -> PROXY | DIRECT
```

The first member is the default: each region starts on AUTO, `AI-REGION` starts
on `US-AUTO`, `PROXY-AUTO` starts on HK, and `WIFI` starts on PROXY until the
region script obtains a valid result. `AI-REGION` is a normal select group, so
JP/SG require an intentional manual change. PayPal deliberately uses
`US-AUTO` directly and cannot be moved outside the US region by changing
`AI-REGION`.

### Access-network matrix

| Traffic | CMHK cellular | Mainland China Wi-Fi | HK/MO Wi-Fi | Other overseas Wi-Fi |
| --- | --- | --- | --- | --- |
| OpenAI / necessary AI | `AI-REGION` (default US) | same | same | same |
| US-region PayPal | `US-AUTO` | `US-AUTO` | `US-AUTO` | `US-AUTO` |
| Tiger / Futu / Longbridge | `DIRECT` | `WIFI = PROXY` | `WIFI = DIRECT` | `WIFI = DIRECT` |
| Other unmatched traffic | `DIRECT` | `WIFI = PROXY` | `WIFI = DIRECT` | `WIFI = DIRECT` |

The country result is based on a `DIRECT` public-egress check. HK/MO and other
overseas countries are classified separately in the script and Logbook, even
though both currently choose `DIRECT`. This leaves room for a later policy
difference without disturbing the critical AI/PayPal rules.

The Telegram Bot API uses two verified static IP mappings together with
`use-local-host-item-for-proxy=true`. This prevents mainland DNS pollution from
breaking OpenClaw/Telegram outbound delivery while retaining the normal
Telegram hostname, TLS SNI, and proxy policy.

The three observed Tiger endpoint suffixes (`iotaskyt.com`, `tigerfintech.com`,
and `skytigris.cn`) are also inline in the main profile so a stale remote-rule
cache cannot send them to `GEOIP,CN`. On Mac, Tiger Trade additionally uses
the `HK` parent policy, so it can be pinned to a Hong Kong node verified against
Tiger's TLS endpoints without altering ordinary traffic's `HK-AUTO` selection.
The shared securities list retains the same domains for other clients.

### Mac and Android consistency

Mac uses this same profile and therefore the same destination policies. Android
remains on the existing Mihomo configuration in this phase, as required; no
production override is changed. Its eventual semantic mapping should be
identical: AI -> a manually fixed US/JP/SG region with same-region node
fallback, US-region PayPal -> stable US,
mainland destinations -> direct, and other international destinations -> the
current network's proxy decision. Android implementation and Surfboard work are
explicitly outside this migration phase.

## Network-region script

Both `network-changed` and `engine-started` run
`scripts/network-region.js`. The script:

1. requests Cloudflare trace with the explicit `DIRECT` policy;
2. parses its two-letter `loc` value;
3. selects `WIFI = PROXY` only for `CN`;
4. classifies HK/MO separately from other overseas countries, selecting
   `WIFI = DIRECT` for both classes;
5. leaves the current selection unchanged on HTTP, status or parse failure.

The script changes only a normal `select` group. A manual `WIFI` switch remains
available and persists until the next engine start or network change.

## DNS and TLS compatibility

Surge has no direct equivalent of Mihomo's GeoIP-conditioned
`fallback-filter`. The migration uses system DNS plus AliDNS and DNSPod; Surge
queries configured traditional resolvers concurrently. Proxied hostnames are
normally resolved by the selected proxy, while corporate and Xiaohongshu
domains use explicit `[Host]` server mappings.

This first version keeps `ipv6=false` from the private Mihomo profile. It does
not add encrypted DNS, MITM, Rewrite, certificate skipping, forced HTTP engine,
QUIC blocking or MTU changes. That is deliberate: OpenAI SSL/auth domains and
their asset/upload dependencies are kept on the same `AI-REGION` decision with
`extended-matching`, but TLS is not decrypted. A network transition can still
terminate an existing TCP/TLS socket; the selected region's automatic group
retests after network changes and chooses another node only within that region.

## Items that cannot be migrated automatically

- The private Sub-Store host, share token, airport subscription URLs and
  generated proxy credentials are correctly absent from the public repository.
  The read-only audit confirmed the collection shape and node names without
  copying those credentials into the repository.
- Node ordering determines US fallback priority. Set the desired stable order
  in Sub-Store; the repository cannot infer provider quality.
- The public repository contains no device request log. The initial securities
  list covers the vendors' official root domains, but app telemetry/CDN hosts
  must be confirmed from Surge requests on the iPhone before calling the list
  complete.
- The historical repository has Google connectivity rules but no standalone
  rule named “Google Play.” The v2 list explicitly includes Play and Android
  service domains; verify them from Surge requests during regression testing
  and add only observed missing hosts.
- Surge is not installed or controlled by this repository, so actual profile
  loading, node protocol compatibility and packet routing require the local
  MacBook test below.
- iOS resource delivery should be tested after the new files are published to
  GitHub Raw or a private managed-profile endpoint. No iOS test is part of this
  phase.

## MacBook local test

Prerequisites: Surge Mac 6.9+, the new `surge/` files published at their GitHub
Raw URLs, and the private Sub-Store `surge_v2` complete-profile URL.

Before importing, run the repository-side static checks:

```bash
node surge/scripts/validate-v2.mjs
```

1. In Sub-Store, preview the `surge_v2` file artifact. Confirm `[Proxy]` contains
   real nodes and the injection marker is gone. Do not commit its private URL.
2. In Surge Mac, import the private `surge_v2` URL and run profile verification.
   Confirm all rule resources and both event scripts download without error.
3. Confirm nodes exist in US/HK/JP/SG manual groups and check for false
   positives or empty groups. Confirm `c87s1~3` appear only in US and `c87s4`
   only in JP.
4. Trigger tests for `US-AUTO`, `HK-AUTO`, `JP-AUTO`, and `SG-AUTO`. Disable one
   currently selected node temporarily and confirm AUTO moves to a healthy
   node. Restore it after the test.
5. Keep `PROXY = PROXY-AUTO`. On a CN Wi-Fi network, run the network-region script from
   Surge's script UI or reconnect Wi-Fi. Confirm Logbook reports the detected
   region and `WIFI = PROXY`.
6. Inspect requests while testing:
   - `chatgpt.com` / `api.openai.com` -> `AI-REGION`, initially through
     `US-AUTO`; JP/SG must not be selected automatically;
   - PayPal login and payment dependencies -> `US-AUTO`;
   - a mainland site such as `baidu.com` -> `DIRECT`;
   - an ordinary international site such as `github.com` -> `WIFI`;
   - `e.szridge.com` -> `DIRECT`, with DNS from the corporate servers when the
     internal network is reachable.
7. Switch each region parent to `*-MANUAL`, select a concrete node, and repeat a
   small request. Confirm the selected node is used. Return parents to AUTO.
   Separately switch `AI-REGION` to JP and SG, verify the intentional change,
   then return it to `US-AUTO`.
8. Manually switch `WIFI` between `PROXY` and `DIRECT`; verify the choice works.
   A later network change is expected to let the script choose again.
9. Test failure behavior by temporarily blocking the country-check URL or
   disconnecting before running the script. Confirm the log says “unchanged”
   and the previous `WIFI` selection remains intact.
10. On iPhone, verify the access-network matrix: Tiger/Futu/Longbridge must be
    DIRECT on CMHK cellular, use PROXY on mainland Wi-Fi, and be DIRECT on HK,
    MO and another overseas Wi-Fi. Capture unmatched app hosts from Surge's
    request log before adding them to `securities-wifi.list`.

The phase is complete when the profile loads, all four region groups populate,
OpenAI stays in the manually selected region, PayPal uses a US automatic node, mainland
destinations are direct, ordinary international traffic uses WIFI, the
securities matrix behaves as specified, and manual node selection works. Do not
begin Surfboard migration in this phase.

## References

- [Surge policy inclusion](https://manual.nssurge.com/policy-groups/policy-including.html)
- [Surge fallback groups](https://manual.nssurge.com/policy-groups/fallback.html)
- [Sub-Store official repository](https://github.com/sub-store-org/Sub-Store)
- [Surge event scripts](https://manual.nssurge.com/scripting/event.html)
- [Surge JavaScript API](https://manual.nssurge.com/scripting/api.html)
- [Surge local DNS mapping](https://manual.nssurge.com/dns/local-dns-mapping.html)
- [OpenAI data residency regions](https://developers.openai.com/api/docs/guides/your-data#default-usage-policies-by-endpoint)
- [PayPal security checks for a new device or different location](https://www.paypal.com/us/cshelp/article/why-do-i-have-to-complete-a-security-check-help171)
