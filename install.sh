#!/usr/bin/env bash
# Instaleaza whiteboard.html in folderul www al Home Assistant
# Ruleaza acest script DIRECT PE MASINA UNDE RULEAZA HOME ASSISTANT (ex: Jetson Nano)
#
# Foloseste: ./install.sh /calea/catre/config/ha
# Daca nu dai argument, incearca calea implicita: ~/homeassistant

set -e

HA_CONFIG_DIR="${1:-$HOME/homeassistant}"
WWW_DIR="$HA_CONFIG_DIR/www"

if [ ! -d "$HA_CONFIG_DIR" ]; then
  echo "Nu gasesc folderul de config HA la: $HA_CONFIG_DIR"
  echo "Ruleaza din nou: ./install.sh /calea/corecta/catre/config"
  exit 1
fi

mkdir -p "$WWW_DIR"
cp "$(dirname "$0")/www/whiteboard.html" "$WWW_DIR/whiteboard.html"

echo ""
echo "Whiteboard copiat cu succes in: $WWW_DIR/whiteboard.html"
echo "Va fi disponibil (fara restart HA) la: http://<ip-ha>:8123/local/whiteboard.html"
echo ""
echo "Adauga acest card intr-un dashboard HA (Edit Dashboard -> Add Card -> Show code editor):"
echo ""
echo "type: iframe"
echo "url: /local/whiteboard.html"
echo "title: Whiteboard"
echo "aspect_ratio: 90%"
echo ""
