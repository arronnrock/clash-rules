# Mac mini pinned runtime deployment

GitHub remains the source of truth and the MacBook remains the development
machine. The Mac mini runs only a validated, explicit commit from `main`.

`proxy-config-update` maintains a bare repository under
`~/Services/clash-rules`, expands immutable commit snapshots under `releases/`,
and switches the `current` symlink only after source validation. It then stages
the Surge/Surfboard renderers, refreshes both complete private profiles,
restarts the existing profile gateway and checks the public endpoints plus the
local OpenClaw gateway. A failed step restores the previous scripts, profiles
and source pointer.

Production delivery does not depend on Tailscale Funnel. A dedicated launchd
job keeps a reverse SSH tunnel from the Mac mini gateway at `127.0.0.1:13002`
to one loopback-only port on the VPS. The tunnel key belongs to an unprivileged
VPS account and is restricted to that single remote-listen address; it cannot
open a shell or expose a public listener. VPS Nginx serves both clients from
tokenized HTTPS paths and proxies only to that loopback port.

The deployment does not create or copy credentials. Existing tokens, the
forced-command Sub-Store SSH key, private node output and managed URLs remain
under `~/Library/Application Support/SurgeProfileGateway` with private
permissions.

The private tunnel files are `ssh/profile_gateway_tunnel` and
`profile-tunnel-target`. The LaunchAgent uses `profile-tunnel.sh` from the pinned
release and restarts it after a network interruption. Do not reuse the
Sub-Store read-only key for this tunnel.

Deploy only a full commit already pushed to `origin/main`:

```bash
~/Library/Application\ Support/SurgeProfileGateway/bin/proxy-config-update \
  FULL_40_CHARACTER_COMMIT
```

Run a read-only health check at any time:

```bash
~/Library/Application\ Support/SurgeProfileGateway/bin/proxy-config-health-check
```

The existing LaunchAgents continue refreshing the pinned templates every six
hours. A later GitHub push has no production effect until its exact commit is
deployed.
