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

The deployment does not create or copy credentials. Existing tokens, the
forced-command Sub-Store SSH key, private node output and managed URLs remain
under `~/Library/Application Support/SurgeProfileGateway` with private
permissions.

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
