#!/bin/zsh
set -euo pipefail

base_dir="$HOME/Library/Application Support/SurgeProfileGateway"
runtime_dir="$base_dir/runtime"
source_dir_file="$base_dir/source-dir"
profile="$base_dir/surge-v2.conf"
template="$runtime_dir/surge.conf"
nodes="$runtime_dir/private.nodes"
candidate="$runtime_dir/surge-v2.conf.candidate"
key="$base_dir/ssh/substore_readonly"
target_file="$base_dir/substore-readonly-target"

/bin/mkdir -p "$runtime_dir"
/bin/chmod 700 "$base_dir" "$runtime_dir"
cleanup() { /bin/rm -f "$template.tmp" "$nodes.tmp" "$candidate"; }
trap cleanup EXIT

[[ -s "$source_dir_file" ]] || { print -u2 "missing pinned source directory"; exit 1; }
source_dir="$(<"$source_dir_file")"
template_source="$source_dir/surge/surge.conf"
[[ -s "$template_source" ]] || { print -u2 "missing pinned Surge template"; exit 1; }
/bin/cp "$template_source" "$template.tmp"
/bin/mv -f "$template.tmp" "$template"

[[ -s "$target_file" ]] || { print -u2 "missing private Sub-Store SSH target"; exit 1; }
substore_target="$(<"$target_file")"
[[ "$substore_target" == *"@"* ]] || { print -u2 "invalid private Sub-Store SSH target"; exit 1; }

/usr/bin/ssh -i "$key" \
  -o BatchMode=yes -o ConnectTimeout=12 \
  -o ServerAliveInterval=10 -o ServerAliveCountMax=2 \
  "$substore_target" > "$nodes.tmp"
[[ -s "$nodes.tmp" ]] || { print -u2 "Sub-Store returned an empty collection"; exit 1; }
/bin/mv -f "$nodes.tmp" "$nodes"

/usr/bin/python3 "$base_dir/bin/render_profile.py" "$template" "$nodes" > "$candidate"
/bin/chmod 600 "$candidate"
if [[ -f "$profile" ]] && /usr/bin/cmp -s "$candidate" "$profile"; then
  print "Surge profile unchanged"
  exit 0
fi
/bin/mv -f "$candidate" "$profile"
/bin/chmod 600 "$profile"
print "Surge profile updated"
