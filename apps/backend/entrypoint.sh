#!/bin/sh
set -e

case "$1" in
  worker)
    exec node dist/worker.js
    ;;
  main|"")
    exec node dist/main.js
    ;;
  *)
    # allow passing through anything else verbatim (e.g. a custom file or node flags)
    exec node "$@"
    ;;
esac
