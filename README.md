# HA Whiteboard

Un mic whiteboard (canvas de desen) de sine statator, facut sa fie servit din
folderul `www` al Home Assistant si afisat printr-un card `iframe` in dashboard.

## Ce contine

- `www/whiteboard.html` — aplicatia (HTML/CSS/JS intr-un singur fisier, fara dependinte externe)
- `install.sh` — script care copiaza fisierul in folderul de config HA

## Functii

- Desen liber (mouse/deget), culori, grosime linie, radiera
- Obiecte emoji si text — se pot muta si redimensiona independent (colt albastru = resize, x rosu = sterge)
- Zoom (pinch cu doua degete, Ctrl+scroll, sau butoanele +/-) si unealta de "muta vedere" (pan)
- Undo (doar pentru desenul liber), "Sterge tot", salvare ca PNG
- Persistenta locala in browser (localStorage) — ramane desenat la reincarcare, dar NU e sincronizat intre device-uri diferite

## Instalare

```bash
git clone <url-repo> ha-whiteboard
cd ha-whiteboard
chmod +x install.sh
./install.sh /calea/catre/config/home-assistant
```

Sau manual, fara script:

```bash
cp www/whiteboard.html /calea/catre/config/home-assistant/www/whiteboard.html
```

Nu necesita restart HA — folderul `www` e servit automat la `/local/...`.

## Adaugarea in dashboard

In HA: **Edit Dashboard -> Add Card -> Show code editor**, apoi:

```yaml
type: iframe
url: /local/whiteboard.html
title: Whiteboard
aspect_ratio: 90%
```

## Actualizare ulterioara

```bash
cd ha-whiteboard
git pull
./install.sh /calea/catre/config/home-assistant
```
