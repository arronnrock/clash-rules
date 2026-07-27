# Surge iOS Test Checklist

Record the matched rule, final policy and node for every failed test.

## Cellular (CMHK)

- [ ] ChatGPT login uses `US`.
- [ ] ChatGPT conversation and streaming use `US`.
- [ ] ChatGPT image upload uses `US`.
- [ ] PayPal login and payment pages use `US`.
- [ ] WeChat text, images and files use `DIRECT`.
- [ ] WeChat voice and video use `DIRECT`.
- [ ] WeCom uses `DIRECT`.
- [ ] Xiaohongshu images and video use `DIRECT`.
- [ ] YouTube playback uses `DIRECT`.
- [ ] Apple Music uses `DIRECT`.
- [ ] Mainland and Hong Kong banking apps use `DIRECT`.
- [ ] Mainland, Hong Kong and international broker apps use `DIRECT`.
- [ ] Domestic Safari sites use `DIRECT`.
- [ ] Foreign Safari sites not explicitly forced to US use `DIRECT`.

Expected result: only OpenAI/ChatGPT and PayPal use a proxy.

## Wi-Fi: Profile A

- [ ] ChatGPT login, conversation and upload use `US`.
- [ ] PayPal uses `US`.
- [ ] WeChat text, images, files, voice and video use `DIRECT`.
- [ ] Xiaohongshu domains and CDN resources use `DIRECT`.
- [ ] Banking, broker and payment apps use `DIRECT`.
- [ ] Domestic Safari sites use `DIRECT`.
- [ ] YouTube uses `GLOBAL-PROXY`.
- [ ] Google, GitHub, Telegram and WhatsApp use `GLOBAL-PROXY`.
- [ ] `GLOBAL-PROXY` defaults to `HK`.
- [ ] Manual `JP`, `SG`, `TW`, `US` and `OTHER` selections work.
- [ ] Changing `GLOBAL-PROXY` does not affect ChatGPT or PayPal.
- [ ] Changing `GLOBAL-PROXY` does not affect domestic services.

## Wi-Fi: Profile B

- [ ] ChatGPT and PayPal still use `US`.
- [ ] WeChat and Xiaohongshu still use `DIRECT`.
- [ ] Known domestic domains and China IPs still use `DIRECT`.
- [ ] Explicit foreign services use `GLOBAL-PROXY`.
- [ ] A foreign domain missing from `foreign-proxy.list` uses `GLOBAL-PROXY`.
- [ ] Switching back to A makes that same unclassified domain use `DIRECT`.
- [ ] Cellular behavior remains identical to A.

## A/B Test

- [ ] Use the same Wi-Fi, device, target service and `GLOBAL-PROXY` selection.
- [ ] Force-close the target app after every profile switch to avoid reusing a
      connection opened by the previous profile.
- [ ] Randomize the order as A-B or B-A, then repeat in the reverse order.
- [ ] Record only profile label, load success, elapsed time, matched rule and
      final policy before comparing which profile is which.
- [ ] Use B as a temporary fallback rather than the default when it fixes an
      otherwise inaccessible foreign service.

## Regression Signals

- [ ] No domestic request falls through to `foreign-proxy.list`.
- [ ] No WeChat request uses `GLOBAL-PROXY`.
- [ ] No Xiaohongshu request uses `GLOBAL-PROXY`.
- [ ] A contains no Wi-Fi catch-all rule.
- [ ] B contains exactly one Wi-Fi catch-all rule after domestic rules.
- [ ] No regional group contains `DIRECT`.
- [ ] `c87s5` appears in no regional group.
- [ ] There are no empty US, HK, JP, SG, TW or OTHER groups after Sub-Store
      injects the current nodes.
