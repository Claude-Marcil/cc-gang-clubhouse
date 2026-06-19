#!/usr/bin/env bash
# Backward-compat shim — the real launcher is the cross-platform Node script.
exec node "$(dirname "$0")/knock.mjs"
