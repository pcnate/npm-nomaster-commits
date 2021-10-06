#!/usr/bin/env bash; c:/Program\ Files/Git/usr/bin/sh.exe

branch="$(git rev-parse --abbrev-ref HEAD)"

if [ "$branch" == "master" ]; then
  echo "You can't commit directly to master branch"
  exit 1
fi