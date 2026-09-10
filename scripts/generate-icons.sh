#!/usr/bin/env bash
set -e

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )/.." && pwd )"
ICONS_DIR="$DIR/icons"
mkdir -p "$ICONS_DIR"

# Generate 128, 48, 32 from main SVG
rsvg-convert -w 128 -h 128 "$DIR/icons/icon.svg" -o "$ICONS_DIR/icon-128.png"
rsvg-convert -w 48 -h 48 "$DIR/icons/icon.svg" -o "$ICONS_DIR/icon-48.png"
rsvg-convert -w 32 -h 32 "$DIR/icons/icon.svg" -o "$ICONS_DIR/icon-32.png"

# Generate 16 from pixel-optimized 16px SVG
rsvg-convert -w 16 -h 16 "$DIR/icons/icon-16.svg" -o "$ICONS_DIR/icon-16.png"

echo "✅ BrandCloak icons generated successfully in $ICONS_DIR:"
ls -lh "$ICONS_DIR"
