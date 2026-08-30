#!/bin/zsh
set -euo pipefail

base="$HOME/Library/Application Support/SurgeProfileGateway"
runtime="$base/runtime"
uid="$(/usr/bin/id -u)"
temp_dir="$(/usr/bin/mktemp -d "$runtime/health.XXXXXX")"
cleanup() { /bin/rm -rf "$temp_dir"; }
trap cleanup EXIT

for required in source-dir deployed-commit token surfboard-token surge-v2.conf surfboard-v1.conf; do
  [[ -s "$base/$required" ]] || { print -u2 "missing runtime file: $required"; exit 1; }
done
for secret in token surfboard-token; do
  [[ "$(/usr/bin/stat -f '%Lp' "$base/$secret")" == "600" ]] || {
    print -u2 "unsafe permission on $secret"
    exit 1
  }
done

source_dir="$(<"$base/source-dir")"
commit="$(<"$base/deployed-commit")"
[[ -d "$source_dir" ]] || { print -u2 "pinned source directory is missing"; exit 1; }
[[ "$commit" =~ ^[0-9a-f]{40}$ ]] || { print -u2 "invalid deployed commit record"; exit 1; }

for label in \
  com.arronnrock.surge-profile-server \
  com.arronnrock.surge-profile-refresh \
  com.arronnrock.surfboard-profile-refresh; do
  /bin/launchctl print "gui/$uid/$label" >/dev/null
done
if [[ -s "$base/profile-tunnel-target" ]]; then
  /bin/launchctl print "gui/$uid/com.arronnrock.profile-gateway-tunnel" >/dev/null
fi
/usr/sbin/lsof -nP -iTCP:13002 -sTCP:LISTEN >/dev/null

fetch_local_profile() {
  local route="$1"
  local token_file="$2"
  local output="$3"
  local token
  token="$(<"$base/$token_file")"
  /usr/bin/printf 'url = "http://127.0.0.1:13002/%s?token=%s"\nsilent\nshow-error\nfail\nconnect-timeout = 5\nmax-time = 15\noutput = "%s"\n' \
    "$route" "$token" "$output" | /usr/bin/curl --config -
  /usr/bin/head -n 1 "$output" | /usr/bin/grep -q '^#!MANAGED-CONFIG '
}

fetch_local_profile surge-v2.conf token "$temp_dir/surge.conf"
fetch_local_profile surfboard-v1.conf surfboard-token "$temp_dir/surfboard.conf"

count_proxies() {
  /usr/bin/awk '
    BEGIN { section=0; count=0 }
    /^\[Proxy\][[:space:]]*$/ { section=1; next }
    /^\[[^]]+\][[:space:]]*$/ { if (section) exit }
    section && index($0, "=") > 0 { count++ }
    END { print count }
  ' "$1"
}
surge_count="$(count_proxies "$temp_dir/surge.conf")"
surfboard_count="$(count_proxies "$temp_dir/surfboard.conf")"
(( surge_count >= 4 )) || { print -u2 "Surge profile has too few proxies"; exit 1; }
(( surfboard_count >= 4 )) || { print -u2 "Surfboard profile has too few proxies"; exit 1; }

for url_file in surge-vps-path-managed-url.txt surfboard-vps-path-managed-url.txt; do
  [[ -s "$base/$url_file" ]] || { print -u2 "missing public path URL: $url_file"; exit 1; }
  public_url="$(<"$base/$url_file")"
  public_profile="$temp_dir/$url_file.conf"
  /usr/bin/printf 'url = "%s"\nsilent\nshow-error\nfail\nconnect-timeout = 10\nmax-time = 30\noutput = "%s"\n' \
    "$public_url" "$public_profile" | /usr/bin/curl --config -
  managed_url="$(/usr/bin/head -n 1 "$public_profile" | /usr/bin/awk '$1 == "#!MANAGED-CONFIG" { print $2 }')"
  [[ "$managed_url" == "$public_url" ]] || {
    print -u2 "public profile contains the wrong managed URL: $url_file"
    exit 1
  }
done

# OpenClaw is not changed by this deployment. Its local gateway must remain
# responsive so a proxy-profile update cannot silently break the service.
/usr/bin/curl --silent --show-error --connect-timeout 3 --max-time 5 \
  http://127.0.0.1:18789/ -o /dev/null

print "runtime healthy commit=$commit surge_proxies=$surge_count surfboard_proxies=$surfboard_count"
