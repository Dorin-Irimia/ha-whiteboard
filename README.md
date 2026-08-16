# HA Whiteboard

Un mic whiteboard (canvas de desen) de sine statator, facut sa fie servit din
folderul `www` al Home Assistant si afisat printr-un card `iframe` in dashboard.

## Ce contine

- `www/whiteboard.html` — aplicatia (HTML/CSS/JS intr-un singur fisier, fara dependinte externe)
- `install.sh` — script care copiaza fisierul in folderul de config HA

## Functii

- **Panza infinita** — desenul nu mai e limitat la dimensiunea ecranului; te poti muta si desena oriunde,
  in orice directie. Traseele sunt vectoriale, deci raman clare la orice zoom.
- **Interfata ascundibila** — butonul rotund din dreapta-jos (sau tasta `H`) ascunde toata bara de unelte;
  ramane doar panza alba. Starea se tine minte la reincarcare.
- Mesajul de ajutor din stanga-jos se poate inchide definitiv cu `x`.
- Grila de puncte (buton `▦`) — se poate opri; nu apare in PNG-ul exportat.
- Desen liber (mouse/deget), culori, grosime linie, radiera (taie traseele, fara pete albe)
- Obiecte emoji si text — se pot muta si redimensiona independent (colt albastru = resize, x rosu = sterge)
- Navigare: doua degete (mutare + zoom simultan), rotita mouse-ului, `Ctrl+scroll` pentru zoom,
  butoanele `+`/`−`, unealta `✋`, click dreapta/mijloc pentru pan. `⤢ Reset` readuce vederea la origine.
- Undo (`Ctrl+Z`) pentru desen si obiecte, "Sterge tot", salvare ca PNG
- Salvarea ca PNG exporta **tot continutul**, nu doar ce se vede pe ecran
- Persistenta locala in browser (localStorage) — ramane desenat la reincarcare, dar NU e sincronizat intre device-uri diferite.
  Un desen facut cu versiunea veche (panza fixa) este preluat automat ca fundal.

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
