#!/usr/bin/env bash
# Instaleaza whiteboard-ul in folderul www al Home Assistant
# Ruleaza acest script DIRECT PE MASINA UNDE RULEAZA HOME ASSISTANT (ex: Jetson Nano)
#
# Foloseste: ./install.sh /calea/catre/config/ha
# Daca nu dai argument, incearca calea implicita: ~/homeassistant

set -e

HA_CONFIG_DIR="${1:-$HOME/homeassistant}"
WWW_DIR="$HA_CONFIG_DIR/www"
SRC_DIR="$(dirname "$0")/dist"

if [ ! -d "$HA_CONFIG_DIR" ]; then
  echo "Nu gasesc folderul de config HA la: $HA_CONFIG_DIR"
  echo "Ruleaza din nou: ./install.sh /calea/corecta/catre/config"
  exit 1
fi

mkdir -p "$WWW_DIR"
cp "$SRC_DIR/whiteboard-card.js" "$WWW_DIR/whiteboard-card.js"
cp "$SRC_DIR/whiteboard.html"    "$WWW_DIR/whiteboard.html"

echo ""
echo "Copiat cu succes in: $WWW_DIR"
echo "  - whiteboard-card.js  (cardul Lovelace)"
echo "  - whiteboard.html     (pagina de sine statatoare / varianta iframe)"
echo ""
echo "== Varianta 1 (recomandata): custom card =="
echo ""
echo "1. Adauga resursa o singura data:"
echo "   Settings -> Dashboards -> (meniul din dreapta sus) Resources -> Add resource"
echo "     URL:  /local/whiteboard-card.js"
echo "     Type: JavaScript Module"
echo "   Apoi reincarca pagina cu Ctrl+F5 (sau goleste cache-ul pe tableta)."
echo ""
echo "2. In dashboard: Add Card -> cauta \"Whiteboard\", sau Show code editor:"
echo ""
echo "   type: custom:whiteboard-card"
echo "   height: 420"
echo "   title: Whiteboard"
echo ""
echo "== Varianta 2: iframe (fara resurse de adaugat) =="
echo ""
echo "   type: iframe"
echo "   url: /local/whiteboard.html"
echo "   aspect_ratio: 90%"
echo ""
echo "Nu e nevoie de restart HA — folderul www e servit automat la /local/..."
echo ""
