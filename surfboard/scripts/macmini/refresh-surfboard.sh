#!/bin/zsh
set -euo pipefail

base_dir="$HOME/Library/Application Support/SurgeProfileGateway"
runtime_dir="$base_dir/runtime"
profile="$base_dir/surfboard-v1.conf"
template="$runtime_dir/surfboard.conf"
nodes="$runtime_dir/surfboard.nodes"
candidate="$runtime_dir/surfboard-v1.conf.candidate"
key="$base_dir/ssh/substore_readonly"
target_file="$base_dir/substore-readonly-target"
template_base_url="https://raw.githubusercontent.com/arronnrock/clash-rules/main/surfboard/surfboard.conf"
template_url="${template_base_url}?refresh=$(/bin/date +%s)"

mkdir -p "$runtime_dir"
chmod 700 "$base_dir" "$runtime_dir"
cleanup() { rm -f "$template.tmp" "$nodes.tmp" "$candidate"; }
trap cleanup EXIT

# A public-template failure may use the previous verified local template.
if /usr/bin/curl -fsSL --max-time 30 -H "Cache-Control: no-cache" "$template_url" -o "$template.tmp"; then
  /bin/mv -f "$template.tmp" "$template"
fi
[[ -s "$template" ]] || { print -u2 "no usable Surfboard template"; exit 1; }
[[ -s "$target_file" ]] || { print -u2 "missing private Sub-Store SSH target"; exit 1; }
substore_target="$(<"$target_file")"
[[ "$substore_target" == *"@"* ]] || { print -u2 "invalid private Sub-Store SSH target"; exit 1; }

# This forced-command key returns Sub-Store's complete Surge-format collection.
# Surfboard accepts these lines; render_surfboard.py rejects unsupported syntax.
/usr/bin/ssh -i "$key" \
  -o BatchMode=yes -o ConnectTimeout=12 \
  -o ServerAliveInterval=10 -o ServerAliveCountMax=2 \
  "$substore_target" > "$nodes.tmp"
[[ -s "$nodes.tmp" ]] || { print -u2 "Sub-Store returned an empty collection"; exit 1; }
/bin/mv -f "$nodes.tmp" "$nodes"

/usr/bin/python3 "$base_dir/bin/render_surfboard.py" "$template" "$nodes" > "$candidate"
chmod 600 "$candidate"
if [[ -f "$profile" ]] && /usr/bin/cmp -s "$candidate" "$profile"; then
  print "Surfboard profile unchanged"
  exit 0
fi
/bin/mv -f "$candidate" "$profile"
chmod 600 "$profile"
print "Surfboard profile updated"
