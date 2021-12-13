#!/usr/bin/env bash; c:/Program\ Files/Git/usr/bin/sh.exe
###############################################################################
# Name:    npm-nomaster-commits@1.0.5
# Author:  Nathan Baker <pcnate@gmail.com>
# Desc:    simple pre-commit hook to block commits to master/main/trunk
# License: https://github.com/pcnate/npm-nomaster-commits/blob/master/LICENSE
###############################################################################

branch="$(git rev-parse --abbrev-ref HEAD)"

if [ "$branch" == "master" ]; then
  echo "You can't commit directly to master branch"
  exit 1
fi

if [ "$branch" == "main" ]; then
  echo "You can't commit directly to main branch"
  exit 1
fi

if [ "$branch" == "trunk" ]; then
  echo "You can't commit directly to trunk branch"
  exit 1
fi
