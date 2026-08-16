# Whiteboard Card pentru Home Assistant

[![hacs][hacs-badge]][hacs-url]
[![release][release-badge]][release-url]
[![license][license-badge]](LICENSE)

[🇬🇧 English](README.md) · **🇷🇴 Română**

O tablă de desen cu pânză infinită pentru dashboard-ul Home Assistant. Desenezi cu degetul sau cu
mouse-ul, adaugi emoji și note text, te miști și dai zoom la nesfârșit. Fără cloud, fără integrare,
fără build — un singur fișier JavaScript care rulează complet în browserul tău.

[hacs-badge]: https://img.shields.io/badge/HACS-Custom-41BDF5.svg
[hacs-url]: https://github.com/hacs/integration
[release-badge]: https://img.shields.io/github/v/release/Dorin-Irimia/ha-whiteboard
[release-url]: https://github.com/Dorin-Irimia/ha-whiteboard/releases
[license-badge]: https://img.shields.io/badge/license-MIT-blue.svg

---

## Funcții

- **Pânză infinită** — desenul nu e limitat la ecran. Te miști în orice direcție și desenezi mai
  departe. Traseele sunt vectoriale, deci rămân clare la orice nivel de zoom.
- **Interfață ascundibilă** — butonul rotund din dreapta jos (sau tasta `H`) ascunde toată bara de
  unelte și lasă o suprafață albă, curată. Starea se ține minte.
- **Obiecte emoji și text** — se mută și se redimensionează independent (colțul albastru = resize,
  `✕` roșu = șterge).
- **Radieră care taie traseele** în bucăți, în loc să picteze cu alb peste ele.
- Grilă de puncte opțională, buton de ecran complet, undo (`Ctrl+Z`), șterge tot.
- **Export PNG** al *întregului* conținut, nu doar al zonei vizibile.
- **Mai multe table independente** pe același dashboard, prin `storage_key`.
- Totul se salvează local în browser — nimic nu iese din rețeaua ta.

## Cerințe preliminare

| Cerință | Detalii |
|---------|---------|
| Home Assistant | 2023.1 sau mai nou |
| HACS | Doar pentru instalarea prin HACS — [ghid de instalare](https://hacs.xyz/docs/use/download/download/). Instalarea manuală merge și fără el. |
| Dashboard | Un dashboard pe care îl poți edita. Dacă ai configurația Lovelace în **mod YAML**, resursa trebuie adăugată de mână (vezi mai jos). |
| Browser | Orice browser modern (Chrome, Edge, Firefox, Safari) sau aplicația Home Assistant Companion. Merge cu degetul și cu stylusul. |

**Nu e nevoie de:** restart la Home Assistant, integrare, custom component, acces la internet sau
cont de cloud. E un card care rulează exclusiv în frontend.

> **Unde se salvează desenele?** În `localStorage`-ul browserului, separat pe fiecare device.
> O tablă desenată pe tableta din bucătărie *nu* se vede pe telefon. Nu există sincronizare pe server.

---

## Instalare prin HACS (recomandat)

Repo-ul nu e (încă) în magazinul implicit HACS, deci se adaugă ca **custom repository**.

**1. Adaugă repo-ul**

1. Deschide **HACS** din bara laterală Home Assistant
2. Meniul cu **trei puncte** (⋮) din dreapta sus → **Custom repositories**
3. Completează fereastra:
   - **Repository:** `https://github.com/Dorin-Irimia/ha-whiteboard`
   - **Type / Category:** **Dashboard** *(pe HACS mai vechi de v2 se numește „Lovelace" sau „Plugin")*
4. Apasă **ADD**, apoi închide fereastra

**2. Descarcă**

5. Caută **Whiteboard Card** în HACS — apare imediat după adăugarea repo-ului
6. Deschide-l → **DOWNLOAD** (dreapta jos) → confirmă versiunea → **DOWNLOAD**

HACS pune fișierul în `config/www/community/ha-whiteboard/whiteboard-card.js` și **adaugă singur
resursa Lovelace**, dacă dashboard-urile tale sunt gestionate din interfață.

**3. Golește cache-ul browserului**

7. Apasă **`Ctrl` + `Shift` + `R`** (sau `Ctrl+F5`)

Pe aplicația Companion: **Settings → Companion App → Debugging → Reset frontend cache**, sau închide
complet aplicația și redeschide-o. Pasul ăsta e cauza numărul unu pentru
*„Custom element doesn't exist"*.

**4. Adaugă cardul în dashboard**

8. Deschide dashboard-ul → **✏️** (mod editare) → **+ ADD CARD**
9. Caută **Whiteboard** și alege-l
10. Reglează titlul, înălțimea și grila din editorul vizual → **SAVE**

## Instalare manuală (fără HACS)

```bash
git clone https://github.com/Dorin-Irimia/ha-whiteboard.git
cd ha-whiteboard
chmod +x install.sh
./install.sh /calea/catre/config/home-assistant
```

Sau pur și simplu copiază fișierele în folderul de config:

```bash
cp dist/whiteboard-card.js dist/whiteboard.html /calea/catre/config/www/
```

Folderul `www` e servit automat la `/local/...`, deci URL-ul resursei devine
`/local/whiteboard-card.js`. Apoi înregistrează resursa, ca mai jos.

## Înregistrarea resursei manual

Necesară doar la instalarea manuală, sau dacă Lovelace rulează în mod YAML.

**Dashboard-uri gestionate din interfață:** **Settings → Dashboards → ⋮ → Resources → Add resource**

| Câmp | Valoare |
|------|---------|
| URL | `/local/community/ha-whiteboard/whiteboard-card.js` (HACS) sau `/local/whiteboard-card.js` (manual) |
| Type | **JavaScript Module** |

**Mod YAML** — în `configuration.yaml`, în blocul `lovelace:` pe care îl ai deja:

```yaml
lovelace:
  resources:
    - url: /local/whiteboard-card.js?v=1
      type: module
```

Resursele declarate în YAML se citesc doar la pornire, deci **repornește Home Assistant** după.
Crește numărul din `?v=` la fiecare actualizare, altfel browserul îți servește fișierul din cache.

---

## Utilizare

```yaml
type: custom:whiteboard-card
title: Whiteboard
height: 420
```

### Opțiunile cardului

| Opțiune | Implicit | Descriere |
|---------|----------|-----------|
| `title` | — | Titlul cardului; lipsește = card fără antet |
| `height` | `420` | Înălțimea zonei de desen: număr (px) sau text (`85vh`) |
| `grid` | `true` | Grila de puncte |
| `hide_toolbar` | `false` | Pornește cu bara de unelte ascunsă |
| `storage_key` | `ha_whiteboard_v3` | Cheia de stocare — o cheie diferită înseamnă o tablă separată |

### Tablă pe tot ecranul

```yaml
views:
  - title: Tablă
    panel: true
    cards:
      - type: custom:whiteboard-card
        height: 85vh
```

### Mai multe table independente

```yaml
- type: custom:whiteboard-card
  title: Bucătărie
  storage_key: wb_bucatarie

- type: custom:whiteboard-card
  title: Birou
  storage_key: wb_birou
```

### Comenzi

| Acțiune | Cum |
|---------|-----|
| Desen | Mouse sau deget |
| Mutarea pânzei | Două degete, unealta `✋`, rotița mouse-ului, sau click mijloc/dreapta |
| Zoom | Pinch, `Ctrl` + scroll, sau butoanele `+` / `−` |
| Înapoi la origine | `⤢` |
| Ascunde/arată butoanele | Butonul rotund, sau tasta `H` |
| Undo | `↶` sau `Ctrl+Z` |
| Export PNG | `💾` |

### Variantă alternativă: card iframe

Merge fără să înregistrezi vreo resursă:

```yaml
type: iframe
url: /local/whiteboard.html
aspect_ratio: 90%
```

Pagina acceptă și parametri: `?key=birou` (tablă separată), `?grid=0` (fără grilă),
`?clean=1` (pornește cu butoanele ascunse).

HACS descarcă doar fișierul JavaScript, așa că dacă vrei și varianta iframe, copiază
`dist/whiteboard.html` lângă el, în `config/www/community/ha-whiteboard/`, și folosește
`/local/community/ha-whiteboard/whiteboard.html`.

---

## De reținut

- **Butonul 💾 exportă un PNG — nu salvează notițele.** Tabla se salvează singură, continuu, la
  fiecare linie trasă. În cardul `iframe`, Home Assistant blochează descărcările (sandbox-ul nu are
  `allow-downloads`), așa că imaginea se deschide într-o filă nouă, de unde o poți salva. În custom
  card descărcarea merge direct.
- Tablele sunt locale fiecărui browser și fiecărui device. Nu există sincronizare între tabletă și
  telefon.
- O tablă desenată cu versiunea 1.x (pânză fixă, salvată ca PNG) este importată automat ca fundal,
  deci nu se pierde nimic.

## Probleme frecvente

| Simptom | Cauză și rezolvare |
|---------|--------------------|
| `Custom element doesn't exist: whiteboard-card` | Cache-ul browserului. Reîncarcă forțat. Dacă persistă, verifică în **Settings → Dashboards → ⋮ → Resources** URL-ul și că tipul e **JavaScript Module**. |
| *„Your resources are in YAML mode"* în loc de lista de resurse | Lovelace e în mod YAML, HACS nu poate înregistra resursa. O adaugi în `configuration.yaml` și repornești. |
| Cardul apare, dar e gol sau turtit | Mărește `height`, sau folosește un view cu `panel: true`. |
| HACS refuză să adauge repo-ul | Categoria trebuie să fie **Dashboard** (nu Integration), iar URL-ul trebuie să înceapă cu `https://`. |
| PNG-ul nu se descarcă niciodată | Folosești cardul `iframe` — imaginea se deschide într-o filă nouă. Permite pop-up-urile pentru adresa Home Assistant. |

## Actualizare

**HACS:** la fiecare release nou apare o notificare → **HACS → Whiteboard Card → UPDATE**, apoi
reîncarcă forțat browserul. Resursa nu trebuie reconfigurată.

**Manual:**

```bash
cd ha-whiteboard
git pull
./install.sh /calea/catre/config
```

## Structura repo-ului

```
dist/whiteboard-card.js   motorul de desen + elementul custom:whiteboard-card
dist/whiteboard.html      pagina de sine stătătoare (varianta iframe), același motor
install.sh                copiază ambele fișiere în folderul de config Home Assistant
hacs.json                 metadate HACS
```

## Licență

MIT — vezi [LICENSE](LICENSE).
