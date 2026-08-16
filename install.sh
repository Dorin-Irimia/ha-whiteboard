#!/usr/bin/env bash
# Manual installer for the Home Assistant Whiteboard Card.
# Run this ON THE MACHINE THAT RUNS HOME ASSISTANT.
#
# Usage:  ./install.sh /path/to/homeassistant/config
# Without an argument it falls back to: ~/homeassistant
#
# Installs two things:
#   1. the Lovelace card              -> config/www/
#   2. the optional shared-board      -> config/custom_components/ha_whiteboard/
#      integration                       (skip it with --card-only)
#
# Not needed if you install through HACS.
#
# RO: Instalare manuala. Ruleaza scriptul pe masina unde ruleaza Home Assistant.
#     Folosire: ./install.sh /calea/catre/config   Nu e necesar daca instalezi prin HACS.

set -e

CARD_ONLY=0
ARGS=()
for arg in "$@"; do
  case "$arg" in
    --card-only) CARD_ONLY=1 ;;
    *) ARGS+=("$arg") ;;
  esac
done

HA_CONFIG_DIR="${ARGS[0]:-$HOME/homeassistant}"
WWW_DIR="$HA_CONFIG_DIR/www"
CC_DIR="$HA_CONFIG_DIR/custom_components"
SRC="$(cd "$(dirname "$0")" && pwd)"

if [ ! -d "$HA_CONFIG_DIR" ]; then
  echo "Config folder not found: $HA_CONFIG_DIR"
  echo "RO: Nu gasesc folderul de config HA la calea de mai sus."
  echo ""
  echo "Try again with the correct path:  ./install.sh /path/to/config"
  exit 1
fi

if [ ! -f "$SRC/dist/whiteboard-card.js" ]; then
  echo "Source files not found in: $SRC/dist"
  echo "Run this script from inside the cloned repository."
  exit 1
fi

mkdir -p "$WWW_DIR"
cp "$SRC/dist/whiteboard-card.js" "$WWW_DIR/whiteboard-card.js"
cp "$SRC/dist/whiteboard.html"    "$WWW_DIR/whiteboard.html"
echo "Card installed:        $WWW_DIR/whiteboard-card.js"

if [ "$CARD_ONLY" -eq 1 ]; then
  echo "Integration skipped (--card-only). Boards stay per-browser."
else
  mkdir -p "$CC_DIR"
  rm -rf "$CC_DIR/ha_whiteboard"
  cp -r "$SRC/custom_components/ha_whiteboard" "$CC_DIR/ha_whiteboard"
  find "$CC_DIR/ha_whiteboard" -name '__pycache__' -type d -exec rm -rf {} + 2>/dev/null || true
  echo "Integration installed: $CC_DIR/ha_whiteboard"
fi

cat <<EOF

NEXT STEPS / PASII URMATORI

1. Register the card resource / Inregistreaza resursa cardului
   UI:   Settings -> Dashboards -> (three dots) Resources -> Add resource
           URL:  /local/whiteboard-card.js?v=1
           Type: JavaScript Module
   YAML: add to configuration.yaml under your existing lovelace: block

           lovelace:
             resources:
               - url: /local/whiteboard-card.js?v=1
                 type: module

   Bump ?v= on every update, otherwise the browser serves the cached file.

2. Turn on the shared board / Porneste tabla partajata
   Either add one line to configuration.yaml:

           ha_whiteboard:

   or leave it out and add it later from
   Settings -> Devices & Services -> + Add integration -> Whiteboard.

3. RESTART Home Assistant. An integration is only picked up at startup.
   RO: Repornirea e obligatorie, integrarea se incarca doar la pornire.

4. Hard-reload the browser: Ctrl+Shift+R
   RO: Goleste cache-ul, altfel primesti "Custom element doesn't exist".

5. Add the card / Adauga cardul

     type: custom:whiteboard-card
     title: Whiteboard
     height: 420

   The toolbar shows a status icon: cloud = shared board, screen = local only.

Docs: README.md (English) | README.ro.md (Romana)

EOF
