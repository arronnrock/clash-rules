# Surfboard Android test checklist

## Before import

- [ ] Surfboard is version 2.34.2 or newer.
- [ ] Bypass Configuration has no allowed/disallowed application selection.
- [ ] Managed URL uses HTTPS, `/surfboard-v1.conf`, and the private token.
- [ ] The first downloaded line is `#!MANAGED-CONFIG` with `interval=21600`.
- [ ] US, HK, JP and SG groups are non-empty; Hysteria2 and SS nodes appear.

## Mainland cellular

- [ ] A mainland website and WeChat use `DIRECT`.
- [ ] A generic international website uses `ACCESS → PROXY`.
- [ ] ChatGPT uses `AI-REGION`; login, conversation and image upload show no SSL error.
- [ ] PayPal uses `US-AUTO`.
- [ ] Tiger, Futu and Longbridge use `ACCESS → PROXY`.
- [ ] Google Play and Telegram use `ACCESS → PROXY`.

## Mainland and overseas Wi-Fi

- [ ] Mainland/unknown Wi-Fi starts with `WIFI = PROXY`.
- [ ] On overseas Wi-Fi, manually set `WIFI = DIRECT`.
- [ ] With `WIFI = DIRECT`, ordinary traffic and all three broker apps are direct.
- [ ] With `WIFI = DIRECT`, ChatGPT remains on `AI-REGION` and PayPal on `US-AUTO`.
- [ ] Returning to mainland Wi-Fi includes manually restoring `WIFI = PROXY`.

## ChatGPT and update regression

- [ ] Switch cellular/Wi-Fi at least three times while checking ChatGPT login and chat.
- [ ] Connection log shows ChatGPT DNS using `force-remote-dns/enhanced-mode`.
- [ ] ChatGPT QUIC is rejected and the following TCP/TLS connection succeeds.
- [ ] Voice entry works; no global UDP rejection is observed.
- [ ] Company DNS, WeChat images and Google Play downloads still work.
- [ ] A six-hour refresh keeps the same managed URL and valid groups.
- [ ] A deliberately invalid candidate is rejected while the last-good profile stays served.

Rollback is to stop Surfboard and reactivate the existing Android Mihomo client.
Do not delete either configuration during initial acceptance.
