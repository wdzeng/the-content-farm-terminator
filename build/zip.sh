#!/bin/bash -e
# The script should be run at project root.

if [[ -z "$BROWSER" ]]; then
  >&2 echo "Missing BROWSER"
  exit 1
fi

if [[ "$BROWSER" == chrome ]]; then
  DEST='../out/the-content-farm-terminator_chrome.zip'
elif [[ "$BROWSER" == firefox ]]; then
  DEST='../out/the-content-farm-terminator_firefox.zip'
else
  >&2 echo "Unknown browser: $BROWSER"
  exit 1
fi

mkdir -p out
cd dist
zip -FSr ../out/the-content-farm-terminator_chrome.zip .
