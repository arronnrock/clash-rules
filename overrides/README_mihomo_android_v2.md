# Android Mihomo v2

`mihomo_android_cn_v2.js` is an additive Android-only Sub-Store override. It
does not contain proxy nodes, subscription URLs, credentials, or a dependency
on the Mac mini.

## Intended data flow

```text
Sub-Store private collection -> Mihomo output with this override -> Android
```

Create a separate Android Mihomo output from the existing `private` collection;
do not replace the output currently used by other clients. Attach this override
as that output's configuration/override script, then subscribe to the new
Mihomo output directly in the Android client. Node refreshes are handled by
Sub-Store and the Android client's existing subscription-update schedule.

## Policy defaults

- `ACCESS` defaults to `PROXY`, whose default is `HK`. In overseas Wi-Fi,
  manually selecting `ACCESS -> DIRECT` sends ordinary traffic and securities
  apps direct without changing ChatGPT or PayPal.
- `DIRECT` is Mihomo's built-in policy, not a user-defined proxy group.
- `AI-REGION` defaults to `US`, but the user may explicitly select `JP` or
  `SG`. It never automatically switches countries.
- Each region uses a same-region automatic group first and a manual fallback
  group second. `US-AUTO` uses ordered fallback; HK/JP/SG use latency testing.
- Mainland and local-network traffic remain direct; international traffic uses
  `PROXY`.
- ChatGPT and OpenAI use `AI-REGION`; PayPal uses `US`; the three securities
  app package families use `PROXY`.

## ChatGPT TLS safeguards

- IPv6 is disabled.
- OpenAI-related domains use remote DoH through `AI-REGION`.
- Only ChatGPT/OpenAI UDP traffic is rejected, so the app falls back to
  TCP/TLS. Hysteria2 node UDP remains enabled.
- No MITM, certificate bypass, static OpenAI CDN IP, or global UDP block is
  used.

## Required client settings

- Use Mihomo/Clash Meta mode with TUN/VPN enabled.
- Leave the client's application-bypass list empty for ChatGPT, PayPal and the
  securities apps; their package rules must see the traffic.
- Keep `AI-REGION` on one chosen country for the full ChatGPT session.
