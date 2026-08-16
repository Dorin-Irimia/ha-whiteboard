# HA Whiteboard

Un mic whiteboard (canvas de desen) pentru Home Assistant, cu panza infinita.
Se poate folosi fie ca **custom card** in Lovelace, fie ca pagina separata intr-un card `iframe`.

## Ce contine

- `www/whiteboard-card.js` — motorul de desen + cardul Lovelace `custom:whiteboard-card`
  (fara dependinte externe, fara build)
- `www/whiteboard.html` — pagina de sine statatoare, care foloseste acelasi motor
- `install.sh` — script care copiaza ambele fisiere in folderul de config HA

## Functii

- **Panza infinita** — desenul nu mai e limitat la dimensiunea ecranului; te poti muta si desena oriunde,
  in orice directie. Traseele sunt vectoriale, deci raman clare la orice zoom.
- **Interfata ascundibila** — butonul rotund din dreapta-jos (sau tasta `H`) ascunde toata bara de unelte;
  ramane doar panza alba. Starea se tine minte la reincarcare.
- Mesajul de ajutor din stanga-jos se poate inchide definitiv cu `x`.
- Grila de puncte (buton `▦`) — se poate opri; nu apare in PNG-ul exportat.
- Buton de **ecran complet** (`⛶`) — util cand cardul e mic intr-un dashboard.
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
cp www/whiteboard-card.js www/whiteboard.html /calea/catre/config/home-assistant/www/
```

Nu necesita restart HA — folderul `www` e servit automat la `/local/...`.

## Varianta 1 (recomandata): custom card

**Pasul 1 — inregistreaza resursa** (o singura data):
**Settings -> Dashboards -> meniul din dreapta sus -> Resources -> Add resource**

| Camp | Valoare |
|------|---------|
| URL  | `/local/whiteboard-card.js` |
| Type | `JavaScript Module` |

Apoi reincarca pagina cu `Ctrl+F5` (pe tableta: inchide si redeschide aplicatia).

**Pasul 2 — adauga cardul.** In editorul de dashboard, **Add Card -> "Whiteboard"**
(are si editor vizual), sau direct din YAML:

```yaml
type: custom:whiteboard-card
title: Whiteboard        # optional; sterge randul pentru card fara titlu
height: 420              # inaltimea zonei de desen, in px
grid: true               # grila de puncte
hide_toolbar: false      # true = porneste cu butoanele ascunse
storage_key: ha_whiteboard_v3   # optional
```

### Mai multe table separate

Fiecare `storage_key` diferit inseamna o tabla separata, salvata independent:

```yaml
type: custom:whiteboard-card
title: Bucatarie
storage_key: wb_bucatarie
```

## Varianta 2: iframe (nu necesita inregistrarea unei resurse)

```yaml
type: iframe
url: /local/whiteboard.html
title: Whiteboard
aspect_ratio: 90%
```

Pagina accepta si parametri: `?key=birou` (tabla separata), `?grid=0` (fara grila),
`?clean=1` (porneste cu butoanele ascunse) — de exemplu `/local/whiteboard.html?key=birou&clean=1`.

> Notele sunt tinute in `localStorage`-ul browserului, deci cardul si pagina `iframe`
> impart aceeasi tabla daca folosesc aceeasi cheie, dar **nu** se sincronizeaza intre
> device-uri diferite.

## Actualizare ulterioara

```bash
cd ha-whiteboard
git pull
./install.sh /calea/catre/config/home-assistant
```
