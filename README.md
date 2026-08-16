# Whiteboard Card pentru Home Assistant

[![hacs][hacs-badge]][hacs-url]
[![license][license-badge]](LICENSE)

O tabla de desen (whiteboard) pentru Home Assistant, cu **panza infinita**.
Se poate folosi fie ca **custom card** in Lovelace, fie ca pagina separata intr-un card `iframe`.
Fara dependinte externe, fara build, fara cloud — totul e local.

[hacs-badge]: https://img.shields.io/badge/HACS-Custom-41BDF5.svg
[hacs-url]: https://github.com/hacs/integration
[license-badge]: https://img.shields.io/badge/license-MIT-blue.svg

## Ce contine

- `dist/whiteboard-card.js` — motorul de desen + cardul Lovelace `custom:whiteboard-card`
- `dist/whiteboard.html` — pagina de sine statatoare, care foloseste acelasi motor
- `install.sh` — script care copiaza ambele fisiere in folderul de config HA (instalare manuala)

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

## Instalare prin HACS (recomandat)

Repo-ul nu e (inca) in magazinul implicit HACS, deci se adauga ca **custom repository**:

1. HACS -> meniul cu trei puncte din dreapta sus -> **Custom repositories**
2. Repository: `https://github.com/Dorin-Irimia/ha-whiteboard` — Type/Category: **Dashboard**
   (in versiunile mai vechi de HACS se numeste **Lovelace** sau **Plugin**)
3. **Add**, apoi cauta **Whiteboard Card** in HACS -> **Download**
4. Reincarca pagina cu `Ctrl+F5`

HACS pune fisierul in `config/www/community/ha-whiteboard/whiteboard-card.js` si adauga singur
resursa, daca dashboard-urile tale sunt gestionate din interfata. Daca ai Lovelace in **mod YAML**,
adauga resursa de mana in `configuration.yaml`:

```yaml
lovelace:
  resources:
    - url: /local/community/ha-whiteboard/whiteboard-card.js
      type: module
```

## Instalare manuala (fara HACS)

```bash
git clone https://github.com/Dorin-Irimia/ha-whiteboard.git
cd ha-whiteboard
chmod +x install.sh
./install.sh /calea/catre/config/home-assistant
```

Sau pur si simplu copiaza fisierele:

```bash
cp dist/whiteboard-card.js dist/whiteboard.html /calea/catre/config/home-assistant/www/
```

Folderul `www` e servit automat la `/local/...`, deci calea resursei devine `/local/whiteboard-card.js`.

## Adaugarea resursei manual

Necesar doar la instalarea manuala, sau daca ai Lovelace in mod YAML.
**Settings -> Dashboards -> meniul din dreapta sus -> Resources -> Add resource**

| Camp | Valoare |
|------|---------|
| URL  | `/local/whiteboard-card.js` (HACS: `/local/community/ha-whiteboard/whiteboard-card.js`) |
| Type | `JavaScript Module` |

In mod YAML, aceeasi resursa in `configuration.yaml`, cu `type: module`.
Adauga `?v=2` la URL si creste numarul la fiecare actualizare, ca sa nu ramai cu fisierul din cache.

Apoi reincarca pagina cu `Ctrl+F5` (pe tableta: inchide si redeschide aplicatia).

## Utilizare

In editorul de dashboard, **Add Card -> "Whiteboard"** (are si editor vizual), sau direct din YAML:

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

### Optiuni card

| Optiune | Implicit | Descriere |
|---------|----------|-----------|
| `title` | — | Titlul cardului; lipseste = card fara antet |
| `height` | `420` | Inaltimea zonei de desen: numar (px) sau text (`85vh`) |
| `grid` | `true` | Grila de puncte |
| `hide_toolbar` | `false` | Porneste cu bara de unelte ascunsa |
| `storage_key` | `ha_whiteboard_v3` | Cheia de stocare; chei diferite = table diferite |

Pentru o tabla pe tot ecranul, foloseste un view cu `panel: true` si `height: 85vh`.

## Varianta alternativa: iframe (nu necesita inregistrarea unei resurse)

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

La instalarea prin HACS, `whiteboard.html` nu este copiat (HACS descarca doar fisierul JS).
Daca vrei si varianta iframe, copiaza `dist/whiteboard.html` langa fisierul instalat de HACS,
in `config/www/community/ha-whiteboard/`, si foloseste
`url: /local/community/ha-whiteboard/whiteboard.html`.

## Note

- **Butonul 💾 exporta un PNG**, nu salveaza notitele — desenul se salveaza singur, continuu.
  In cardul `iframe`, HA blocheaza descarcarile (sandbox fara `allow-downloads`), asa ca imaginea
  se deschide intr-o fila noua, de unde o poti salva. In custom card descarcarea merge direct.
- Tabla e locala fiecarui browser/device. Nu exista sincronizare intre tableta si telefon.

## Actualizare ulterioara

Prin HACS: HACS -> Whiteboard Card -> **Update**, apoi `Ctrl+F5`.

Manual:

```bash
cd ha-whiteboard
git pull
./install.sh /calea/catre/config/home-assistant
```

## Licenta

MIT — vezi [LICENSE](LICENSE).
