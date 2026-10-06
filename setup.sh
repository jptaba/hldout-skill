#!/usr/bin/env bash
# Set up held-out evaluation in a project, or update it, from this clone of the skill (bash, zsh, Git Bash).
#
# Run it in the folder of the project that holds (or will hold) the tests, or point --project at it:
#   1. pulls this clone, so the project gets the latest skill (--no-pull to skip);
#   2. checks Node (20.11 or newer);
#   3. runs the skill's init: a new project is set up (--base-url is needed), a set-up one is updated - the skill, its
#      scripts, the subagents and the files it copied, except the ones the project changed; dependencies and Chromium
#      are installed;
#   4. runs doctor, which lists anything left to do with the command that does it.
# The same command updates a project later, on any machine, even one that has only a clone of the project.
#
#   "$HOME/heldout-skill/setup.sh" --base-url https://your-app       a new project
#   "$HOME/heldout-skill/setup.sh"                                    update
#   "$HOME/heldout-skill/setup.sh" --project ~/work/shop-qa --ci gitlab
# Anything else goes to init as it is (--api-base-url, --name, --profile, --test-id-attr, --data-prefix ...).
set -euo pipefail

skill="$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")" && pwd)"
project="$PWD"
base_url=""
pull=1
init_args=()

while [ $# -gt 0 ]; do
  case "$1" in
    --project) project="$2"; shift 2 ;;
    --base-url) base_url="$2"; shift 2 ;;
    --ci) init_args+=(--ci "$2"); shift 2 ;;
    --no-pull) pull=0; shift ;;
    -h|--help) sed -n '2,16p' "$0" | sed 's/^# \{0,1\}//'; exit 0 ;;
    *) init_args+=("$1"); shift ;;
  esac
done

step() { printf '\n> %s\n' "$1"; }
die() { printf 'setup: %s\n' "$1" >&2; exit 1; }

[ -d "$project" ] || die "no folder $project - create it first, or pass --project <folder>."
project="$(cd "$project" && pwd)"
[ "$project" != "$skill" ] || die "this is the skill's own clone: run setup in your project's folder (or pass --project <folder>)."

if [ "$pull" = 1 ] && [ -d "$skill/.git" ]; then
  step 'git pull (the skill)'
  git -C "$skill" pull --ff-only || printf 'setup: could not pull the skill (offline, or local changes in the clone): going on with the copy as it is.\n' >&2
fi

command -v node >/dev/null 2>&1 || die 'Node.js is not installed: install Node 20 LTS or newer (https://nodejs.org), then run setup again.'
node -e 'const [a, b] = process.versions.node.split(".").map(Number); process.exit(a > 20 || (a === 20 && b >= 11) ? 0 : 1)' \
  || die "Node $(node -p 'process.versions.node') is too old: install Node 20.11 or newer, then run setup again."

if [ -f "$project/heldout.config.json" ]; then new=0; else new=1; fi
[ "$new" = 0 ] || [ -n "$base_url" ] || die 'a new project needs the application'"'"'s address: setup.sh --base-url https://your-app'
[ -z "$base_url" ] || init_args=(--base-url "$base_url" "${init_args[@]+"${init_args[@]}"}")

cd "$project"
export HELDOUT_SETUP=1
if [ "$new" = 1 ]; then step "heldout init (a new project in $project)"; else step "heldout init (updating $project)"; fi
npx -y tsx "$skill/.github/scripts/heldout.ts" init --install "${init_args[@]+"${init_args[@]}"}"
step 'heldout doctor'
npm run --silent heldout -- doctor
