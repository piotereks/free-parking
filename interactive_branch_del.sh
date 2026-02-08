#!/bin/bash
# Strict mode for safer shell scripting:
# -e : exit immediately if any command returns a non-zero status.
# -u : treat unset variables as an error and exit.
# -o pipefail : make a pipeline fail if any command within it fails.
# Together these flags make failures explicit and scripts more predictable.
# set -euo pipefail

# default protected branches (regex) if not provided
PROTECTED='main|master|dev|develop|staging|production|gh-pages|HEAD'

# Defaults (set to "-r" when remote mode is requested, or blank otherwise)
REMOTE_MODE=""
 TARGET='main'

usage() {
  cat <<EOF
Usage: ${0##*/} [-r] [-t target-branch] [-P protected_regex]

Options:
  -r                Operate on remote branches (origin/*) instead of local branches
  -t target-branch  Target branch name to test merged-into (default: main)
  -P regex          Override protected branches regular expression
  -h                Show this help and exit

Examples:
  ${0##*/}            # operate on local branches merged into 'main'
  ${0##*/} -r         # operate on remote branches merged into 'origin/main'
  ${0##*/} -t develop # use 'develop' as the target branch
EOF
}

# parse options
while getopts ":rt:P:h" opt; do
  case $opt in
    r) REMOTE_MODE="-r" ;;
    t) TARGET="$OPTARG" ;;
    P) PROTECTED="$OPTARG" ;;
    h) usage; exit 0 ;;
    \?) echo "Invalid option: -$OPTARG" >&2; usage; exit 1 ;;
    :) echo "Option -$OPTARG requires an argument." >&2; usage; exit 1 ;;
  esac
done

# Ensure we have up-to-date remote refs when working with remotes
if [ -n "$REMOTE_MODE" ]; then
  git fetch --prune
fi

# Use $REMOTE_MODE directly in git commands (-r or blank) and set merged ref accordingly
MERGED_REF="$TARGET"
if [ -n "$REMOTE_MODE" ]; then
  MERGED_REF="origin/$TARGET"
fi
# echo git branch $REMOTE_MODE --no-merged "$MERGED_REF"
# List merged branches (remote or local depending on $REMOTE_MODE) and apply mode-specific filters
git branch $REMOTE_MODE --merged "$MERGED_REF" \
  | sed 's/^[ *]*//' \
  | ( if [ -n "$REMOTE_MODE" ]; then grep -v 'origin/HEAD'; else grep -v -E "^(HEAD$|\*$|$TARGET$)"; fi ) \
  | grep -v -E "$( if [ -n "$REMOTE_MODE" ]; then echo "origin/($PROTECTED)"; else echo "^($PROTECTED)$"; fi )" \
  | sed 's#^origin/##' \
  | while IFS= read -r b; do
  echo $b
      printf '%s\n' "$b"
      [ -z "$b" ] && continue
      if [ -n "$REMOTE_MODE" ]; then
        read -r -p "Delete remote branch $b? [y/N] " yn </dev/tty
        if [ "$yn" = "y" ]; then
          git push origin --delete "$b"
        fi
      else
        read -r -p "Delete local branch $b? [y/N] " yn </dev/tty
        if [ "$yn" = "y" ]; then
          git branch -d "$b"
        fi
      fi
    done

echo "No merged branches found or all merged branches are protected."
# Show branches not merged yet (respecting remote/local mode)
git branch $REMOTE_MODE --no-merged "$MERGED_REF"

