#!/bin/bash -e
# The script should be run at project root.

if [[ -z "$BROWSER" ]]; then
  >&2 echo "Missing BROWSER"
  exit 1
fi

if [[ "$BROWSER" == chrome ]]; then
  SRC_MANIFEST='src/manifest-chrome.json'
elif [[ "$BROWSER" == firefox ]]; then
  SRC_MANIFEST='src/manifest-firefox.json'
else
  >&2 echo "Unknown browser: $BROWSER"
  exit 1
fi

if [[ -z "$VERSION" ]]; then
  version=$(jq '.version' package.json)
else
  version="\"$VERSION\""
fi


jq ".version = $version" "$SRC_MANIFEST" > ./dist/manifest.json
