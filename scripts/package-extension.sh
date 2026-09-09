#!/bin/bash
# package-extension.sh — Creates a clean ZIP package for Chrome Web Store submission

EXTENSION_NAME="brandcloak"
VERSION=$(node -p "require('./manifest.json').version")
OUTPUT="${EXTENSION_NAME}-v${VERSION}.zip"

# Clean up any existing zip
rm -f "$OUTPUT"

echo "Packaging BrandCloak v${VERSION} for Chrome Web Store..."

zip -r "$OUTPUT" \
  manifest.json \
  icons \
  popup \
  content \
  background \
  -x "*.DS_Store"

echo "✅ Successfully packaged: $OUTPUT ($(du -h "$OUTPUT" | cut -f1))"
