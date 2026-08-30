#!/bin/zsh
set -euo pipefail

base="$HOME/Library/Application Support/SurgeProfileGateway"
key="$base/ssh/profile_gateway_tunnel"
target_file="$base/profile-tunnel-target"

[[ -s "$key" ]] || { print -u2 "missing profile tunnel key"; exit 1; }
[[ "$(/usr/bin/stat -f '%Lp' "$key")" == "600" ]] || {
  print -u2 "unsafe profile tunnel key permission"
  exit 1
}
[[ -s "$target_file" ]] || { print -u2 "missing profile tunnel target"; exit 1; }
target="$(<"$target_file")"
[[ "$target" == profile-tunnel@* ]] || { print -u2 "invalid profile tunnel target"; exit 1; }

exec /usr/bin/ssh -N -T \
  -i "$key" \
  -o BatchMode=yes \
  -o ConnectTimeout=12 \
  -o ExitOnForwardFailure=yes \
  -o LogLevel=ERROR \
  -o RequestTTY=no \
  -o ServerAliveCountMax=3 \
  -o ServerAliveInterval=15 \
  -o StrictHostKeyChecking=yes \
  -o TCPKeepAlive=yes \
  -R 127.0.0.1:23132:127.0.0.1:13002 \
  "$target"
