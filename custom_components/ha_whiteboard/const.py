"""Constants for the Whiteboard integration."""

DOMAIN = "ha_whiteboard"

STORAGE_KEY = "ha_whiteboard.boards"
STORAGE_VERSION = 1

# Boards are written to .storage a couple of seconds after the last change,
# so a burst of strokes results in a single write.
SAVE_DELAY = 3

# A board holds base64 images, so it can grow. Refuse to store more than this
# per board and tell the client, instead of letting .storage grow without bound.
MAX_BOARD_BYTES = 8 * 1024 * 1024

# Fisierul cardului, servit chiar de integrare, ca sa nu fie nevoie de o resursa
# Lovelace adaugata manual.
CARD_FILENAME = "whiteboard-card.js"
URL_BASE = "/ha_whiteboard"
