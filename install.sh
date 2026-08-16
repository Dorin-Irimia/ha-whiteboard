#!/usr/bin/env bash
# Manual installer for the Home Assistant Whiteboard Card.
# Run this ON THE MACHINE THAT RUNS HOME ASSISTANT.
#
# Usage:  ./install.sh /path/to/homeassistant/config
# Without an argument it falls back to: ~/homeassistant
#
# Not needed if you install through HACS.
#
# RO: Instalare manuala. Ruleaza scriptul pe masina unde ruleaza Home Assistant.
#     Folosire: ./install.sh /calea/catre/config    Nu e necesar daca instalezi prin HACS.

set -e

HA_CONFIG_DIR="${1:-$HOME/homeassistant}"
WWW_DIR="$HA_CONFIG_DIR/www"
SRC_DIR="$(dirname "$0")/dist"

if [ ! -d "$HA_CONFIG_DIR" ]; then
  echo "Config folder not found: $HA_CONFIG_DIR"
  echo "RO: Nu gasesc folderul de config HA la calea de mai sus."
  echo ""
  echo "Try again with the correct path:  ./install.sh /path/to/config"
  exit 1
fi

if [ ! -f "$SRC_DIR/whiteboard-card.js" ]; then
  echo "Source files not found in: $SRC_DIR"
  echo "Run this script from inside the cloned repository."
  exit 1
fi

mkdir -p "$WWW_DIR"
cp "$SRC_DIR/whiteboard-card.js" "$WWW_DIR/whiteboard-card.js"
cp "$SRC_DIR/whiteboard.html"    "$WWW_DIR/whiteboard.html"

cat <<EOF

Installed into: $WWW_DIR
  - whiteboard-card.js   the Lovelace card
  - whiteboard.html      standalone page (iframe variant)

NEXT STEPS / PASII URMATORI

1. Register the resource / Inregistreaza resursa
   UI:   Settings -> Dashboards -> (three dots) Resources -> Add resource
           URL:  /local/whiteboard-card.js?v=1
           Type: JavaScript Module
   YAML: add to configuration.yaml under your existing lovelace: block

           lovelace:
             resources:
               - url: /local/whiteboard-card.js?v=1
                 type: module

         then restart Home Assistant (YAML resources are read at startup only).

2. Hard-reload the browser: Ctrl+Shift+R
   RO: Goleste cache-ul browserului, altfel primesti "Custom element doesn't exist".

3. Add the card / Adauga cardul

     type: custom:whiteboard-card
     title: Whiteboard
     height: 420

   Or without registering any resource / Sau fara nicio resursa:

     type: iframe
     url: /local/whiteboard.html
     aspect_ratio: 90%

Docs: README.md (English) | README.ro.md (Romana)

EOF
