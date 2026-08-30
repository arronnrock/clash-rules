#!/bin/zsh
set -euo pipefail

if [[ $# -ne 1 || ! "$1" =~ ^[0-9a-f]{40}$ ]]; then
  print -u2 "usage: proxy-config-update FULL_40_CHARACTER_COMMIT"
  exit 2
fi

requested="$1"
origin_url="https://github.com/arronnrock/clash-rules.git"
service_root="$HOME/Services/clash-rules"
repository="$service_root/repository.git"
releases="$service_root/releases"
current_link="$service_root/current"
base="$HOME/Library/Application Support/SurgeProfileGateway"
bin_dir="$base/bin"
runtime="$base/runtime"
backups="$base/deploy-backups"
lock="$runtime/deploy.lock"
uid="$(/usr/bin/id -u)"

/bin/mkdir -p "$service_root" "$releases" "$bin_dir" "$runtime" "$backups"
/bin/chmod 700 "$service_root" "$releases" "$base" "$bin_dir" "$runtime" "$backups"
if ! /bin/mkdir "$lock" 2>/dev/null; then
  print -u2 "another deployment is running or a stale lock exists: $lock"
  exit 1
fi
/usr/bin/printf '%s\n' "$$" > "$lock/pid"
cleanup() {
  /bin/rm -rf "$lock"
  [[ -n "${candidate_release:-}" ]] && /bin/rm -rf "$candidate_release"
  [[ -n "${stage:-}" ]] && /bin/rm -rf "$stage"
}
trap cleanup EXIT

if [[ ! -d "$repository" ]]; then
  repository_candidate="$service_root/repository.git.candidate.$$"
  /usr/bin/git clone --bare "$origin_url" "$repository_candidate"
  /bin/mv "$repository_candidate" "$repository"
fi
actual_origin="$(/usr/bin/git --git-dir "$repository" remote get-url origin)"
[[ "$actual_origin" == "$origin_url" ]] || { print -u2 "unexpected Git origin"; exit 1; }
/usr/bin/git --git-dir "$repository" fetch --prune origin \
  '+refs/heads/main:refs/remotes/origin/main'
commit="$(/usr/bin/git --git-dir "$repository" rev-parse --verify "$requested^{commit}")"
[[ "$commit" == "$requested" ]] || { print -u2 "commit resolution mismatch"; exit 1; }
/usr/bin/git --git-dir "$repository" merge-base --is-ancestor \
  "$commit" refs/remotes/origin/main || {
    print -u2 "requested commit is not on origin/main"
    exit 1
  }

release="$releases/$commit"
if [[ ! -d "$release" ]]; then
  candidate_release="$releases/.candidate-$commit.$$"
  /bin/mkdir "$candidate_release"
  /usr/bin/git --git-dir "$repository" archive "$commit" | \
    /usr/bin/tar -x -C "$candidate_release"
  /usr/bin/python3 "$candidate_release/ops/macmini/validate-runtime.py" "$candidate_release"
  /bin/mv "$candidate_release" "$release"
  candidate_release=""
else
  /usr/bin/python3 "$release/ops/macmini/validate-runtime.py" "$release"
fi

previous_release=""
if [[ -L "$current_link" ]]; then
  previous_release="$(/usr/bin/readlink "$current_link")"
fi
timestamp="$(/bin/date -u +%Y%m%dT%H%M%SZ)"
backup="$backups/$timestamp"
/bin/mkdir "$backup"
/bin/chmod 700 "$backup"
for name in \
  render_profile.py refresh-profile.sh render_surfboard.py \
  refresh-surfboard.sh serve_profile.py profile-tunnel.sh proxy-config-health-check; do
  [[ -e "$bin_dir/$name" ]] && /bin/cp -p "$bin_dir/$name" "$backup/$name"
done
for name in source-dir deployed-commit surge-v2.conf surfboard-v1.conf; do
  [[ -e "$base/$name" ]] && /bin/cp -p "$base/$name" "$backup/$name"
done

rollback() {
  trap - ERR
  set +e
  for name in \
    render_profile.py refresh-profile.sh render_surfboard.py \
    refresh-surfboard.sh serve_profile.py profile-tunnel.sh proxy-config-health-check; do
    if [[ -e "$backup/$name" ]]; then
      /bin/cp -p "$backup/$name" "$bin_dir/$name"
    else
      /bin/rm -f "$bin_dir/$name"
    fi
  done
  for name in source-dir deployed-commit surge-v2.conf surfboard-v1.conf; do
    if [[ -e "$backup/$name" ]]; then
      /bin/cp -p "$backup/$name" "$base/$name"
    else
      /bin/rm -f "$base/$name"
    fi
  done
  if [[ -n "$previous_release" ]]; then
    /bin/ln -s "$previous_release" "$current_link.rollback.$$"
    /bin/mv -fh "$current_link.rollback.$$" "$current_link"
  else
    [[ -L "$current_link" ]] && /usr/bin/unlink "$current_link"
  fi
  /bin/launchctl kickstart -k "gui/$uid/com.arronnrock.surge-profile-server" >/dev/null 2>&1
  print -u2 "deployment failed; previous runtime restored from $backup"
}
trap rollback ERR

next_link="$service_root/current.next.$$"
/bin/ln -s "$release" "$next_link"
/bin/mv -fh "$next_link" "$current_link"
source_tmp="$runtime/source-dir.$$"
/usr/bin/printf '%s\n' "$current_link" > "$source_tmp"
/bin/chmod 600 "$source_tmp"
/bin/mv -f "$source_tmp" "$base/source-dir"

stage="$runtime/deploy-stage.$$"
/bin/mkdir "$stage"
/usr/bin/install -m 700 "$release/surge/scripts/macmini/render_surge.py" "$stage/render_profile.py"
/usr/bin/install -m 700 "$release/surge/scripts/macmini/refresh-surge.sh" "$stage/refresh-profile.sh"
/usr/bin/install -m 700 "$release/surfboard/scripts/macmini/render_surfboard.py" "$stage/render_surfboard.py"
/usr/bin/install -m 700 "$release/surfboard/scripts/macmini/refresh-surfboard.sh" "$stage/refresh-surfboard.sh"
/usr/bin/install -m 600 "$release/surfboard/scripts/macmini/serve_profiles.py" "$stage/serve_profile.py"
/usr/bin/install -m 700 "$release/ops/macmini/profile-tunnel.sh" "$stage/profile-tunnel.sh"
/usr/bin/install -m 700 "$release/ops/macmini/health-check.sh" "$stage/proxy-config-health-check"

for name in \
  render_profile.py refresh-profile.sh render_surfboard.py \
  refresh-surfboard.sh serve_profile.py profile-tunnel.sh proxy-config-health-check; do
  /bin/mv -f "$stage/$name" "$bin_dir/$name"
done

"$bin_dir/refresh-profile.sh"
"$bin_dir/refresh-surfboard.sh"
/bin/launchctl kickstart -k "gui/$uid/com.arronnrock.surge-profile-server"

commit_tmp="$runtime/deployed-commit.$$"
/usr/bin/printf '%s\n' "$commit" > "$commit_tmp"
/bin/chmod 600 "$commit_tmp"
/bin/mv -f "$commit_tmp" "$base/deployed-commit"
"$bin_dir/proxy-config-health-check"

# Update the stable entrypoint last, after the new release is healthy.
/usr/bin/install -m 700 "$release/ops/macmini/update-runtime.sh" "$bin_dir/proxy-config-update.next"
/bin/mv -f "$bin_dir/proxy-config-update.next" "$bin_dir/proxy-config-update"

trap - ERR
print "deployed commit=$commit backup=$backup"
