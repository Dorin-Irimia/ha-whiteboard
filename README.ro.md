<h1 align="center">Whiteboard Card pentru Home Assistant</h1>

<p align="center">
  <a href="https://github.com/hacs/integration"><img src="https://img.shields.io/badge/HACS-Custom-41BDF5.svg" alt="HACS"></a>
  <a href="https://github.com/Dorin-Irimia/ha-whiteboard/releases"><img src="https://img.shields.io/github/v/release/Dorin-Irimia/ha-whiteboard" alt="Release"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="Licență"></a>
</p>

<p align="center"><a href="README.md">🇬🇧 English</a> · <b>🇷🇴 Română</b></p>

<p align="center">
  O tablă de desen cu pânză infinită pentru dashboard-ul Home Assistant.<br>
  Desenezi cu degetul sau cu mouse-ul, lipești poze, adaugi emoji și note text, te miști și dai zoom la nesfârșit.<br>
  Fără cloud, fără integrare, fără build — un singur fișier JavaScript care rulează în browserul tău.
</p>

<p align="center"><img src="docs/screenshot-board.png" alt="Cardul whiteboard cu desene, o notă text, emoji și o poză lipită" width="100%"></p>

---

## Cuprins

1. [Prezentare](#1-prezentare)
   - [1.1 Capturi de ecran](#11-capturi-de-ecran)
   - [1.2 Lista de funcții](#12-lista-de-funcții)
2. [Cerințe preliminare](#2-cerințe-preliminare)
3. [Instalare](#3-instalare)
   - [3.1 Prin HACS (recomandat)](#31-prin-hacs-recomandat)
   - [3.2 Instalare manuală](#32-instalare-manuală)
   - [3.3 Înregistrarea resursei](#33-înregistrarea-resursei)
4. [Configurare](#4-configurare)
   - [4.1 Opțiunile cardului](#41-opțiunile-cardului)
   - [4.2 Limba](#42-limba)
   - [4.3 Rețete de așezare în pagină](#43-rețete-de-așezare-în-pagină)
   - [4.4 Varianta iframe](#44-varianta-iframe)
5. [Utilizare](#5-utilizare)
   - [5.1 Comenzi](#51-comenzi)
   - [5.2 Imagini și stickere](#52-imagini-și-stickere)
   - [5.3 Salvare și export](#53-salvare-și-export)
6. [Probleme frecvente](#6-probleme-frecvente)
7. [Actualizare](#7-actualizare)
8. [Dezvoltare](#8-dezvoltare)
   - [8.1 Structura repo-ului](#81-structura-repo-ului)
   - [8.2 Adăugarea unei limbi](#82-adăugarea-unei-limbi)
9. [Licență](#9-licență)

---

## 1. Prezentare

### 1.1 Capturi de ecran

**Mod curat** — un singur buton (sau tasta `H`) ascunde toată bara de unelte și lasă doar tabla:

<img src="docs/screenshot-clean.png" alt="Aceeași tablă, cu bara de unelte ascunsă" width="100%">

**Editor vizual** — nu ai nevoie de YAML ca să configurezi cardul:

<img src="docs/screenshot-editor.png" alt="Editorul vizual al cardului în Home Assistant" width="560">

### 1.2 Lista de funcții

- **Pânză infinită** — desenul nu e limitat la ecran. Te miști în orice direcție și desenezi mai
  departe. Traseele sunt vectoriale, deci rămân clare la orice nivel de zoom.
- **Interfață ascundibilă** — butonul rotund din dreapta jos (sau tasta `H`) ascunde toată bara de
  unelte. Starea se ține minte la reîncărcare.
- **Imagini și stickere** — lipești cu `Ctrl+V`, tragi fișierul peste tablă, sau alegi o poză din
  telefon. Imaginile se mută și se redimensionează ca orice alt obiect, păstrându-și proporțiile.
- **Emoji și note text** — se mută și se redimensionează independent (colțul albastru = resize,
  `✕` roșu = șterge).
- **Radieră care taie traseele** în bucăți, în loc să picteze cu alb peste ele.
- **Bară de unelte multilingvă** — engleză implicit, 7 limbi incluse, sau după limba din
  Home Assistant.
- Grilă de puncte opțională, buton de ecran complet, undo (`Ctrl+Z`), șterge tot.
- **Export PNG** al *întregului* conținut, nu doar al zonei vizibile.
- **Mai multe table independente** pe același dashboard, prin `storage_key`.
- Totul se salvează local în browser — nimic nu iese din rețeaua ta.

---

## 2. Cerințe preliminare

| Cerință | Detalii |
|---------|---------|
| Home Assistant | 2023.1 sau mai nou |
| HACS | Doar pentru instalarea prin HACS — [ghid de instalare](https://hacs.xyz/docs/use/download/download/). Instalarea manuală merge și fără el. |
| Dashboard | Un dashboard pe care îl poți edita. Dacă ai Lovelace în **mod YAML**, resursa trebuie adăugată de mână — vezi [3.3](#33-înregistrarea-resursei). |
| Browser | Orice browser modern (Chrome, Edge, Firefox, Safari) sau aplicația Home Assistant Companion. Merge cu degetul și cu stylusul. |

**Nu e nevoie de:** restart la Home Assistant, integrare, custom component, acces la internet sau
cont de cloud. E un card care rulează exclusiv în frontend.

> **Unde se salvează desenele?** În `localStorage`-ul browserului, separat pe fiecare device.
> O tablă desenată pe tableta din bucătărie *nu* se vede pe telefon. Nu există sincronizare pe server.

---

## 3. Instalare

### 3.1 Prin HACS (recomandat)

Repo-ul nu e (încă) în magazinul implicit HACS, deci se adaugă ca **custom repository**.

**Pasul 1 — adaugă repo-ul**

1. Deschide **HACS** din bara laterală Home Assistant
2. Meniul cu **trei puncte** (⋮) din dreapta sus → **Custom repositories**
3. Completează fereastra:
   - **Repository:** `https://github.com/Dorin-Irimia/ha-whiteboard`
   - **Type / Category:** **Dashboard** *(pe HACS mai vechi de v2 se numește „Lovelace" sau „Plugin")*
4. Apasă **ADD**, apoi închide fereastra

**Pasul 2 — descarcă**

5. Caută **Whiteboard Card** în HACS — apare imediat după adăugarea repo-ului
6. Deschide-l → **DOWNLOAD** (dreapta jos) → confirmă versiunea → **DOWNLOAD**

HACS pune fișierul în `config/www/community/ha-whiteboard/whiteboard-card.js` și **adaugă singur
resursa Lovelace**, dacă dashboard-urile tale sunt gestionate din interfață.

**Pasul 3 — golește cache-ul browserului**

7. Apasă **`Ctrl` + `Shift` + `R`** (sau `Ctrl+F5`)

Pe aplicația Companion: **Settings → Companion App → Debugging → Reset frontend cache**, sau închide
complet aplicația și redeschide-o. Pasul ăsta e cauza numărul unu pentru
*„Custom element doesn't exist"*.

**Pasul 4 — adaugă cardul în dashboard**

8. Deschide dashboard-ul → **✏️** (mod editare) → **+ ADD CARD**
9. Caută **Whiteboard** și alege-l
10. Reglează setările din editorul vizual → **SAVE**

### 3.2 Instalare manuală

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
`/local/whiteboard-card.js`.

### 3.3 Înregistrarea resursei

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

## 4. Configurare

### 4.1 Opțiunile cardului

```yaml
type: custom:whiteboard-card
title: Whiteboard
height: 420
```

| Opțiune | Implicit | Descriere |
|---------|----------|-----------|
| `title` | — | Titlul cardului; lipsește = card fără antet |
| `height` | `420` | Înălțimea zonei de desen: număr (px) sau text (`85vh`) |
| `grid` | `true` | Grila de puncte |
| `hide_toolbar` | `false` | Pornește cu bara de unelte ascunsă |
| `storage_key` | `ha_whiteboard_v3` | Cheia de stocare — o cheie diferită înseamnă o tablă separată |
| `language` | `en` | Limba barei de unelte, vezi [4.2](#42-limba) |

### 4.2 Limba

Bara de unelte e **în engleză implicit**. Limbi incluse:

| Cod | Limbă | Cod | Limbă |
|-----|-------|-----|-------|
| `en` | English | `es` | Español |
| `ro` | Română | `it` | Italiano |
| `de` | Deutsch | `nl` | Nederlands |
| `fr` | Français | | |

```yaml
type: custom:whiteboard-card
language: ro
```

Cu `language: auto` se ia limba utilizatorului conectat în Home Assistant, cu revenire la engleză
dacă limba aceea nu e tradusă încă. Pe pagina de sine stătătoare folosești `?lang=ro`.

### 4.3 Rețete de așezare în pagină

**Tablă pe tot ecranul** — un view cu `panel: true`:

```yaml
views:
  - title: Tablă
    panel: true
    cards:
      - type: custom:whiteboard-card
        height: 85vh
```

**Mai multe table independente:**

```yaml
- type: custom:whiteboard-card
  title: Bucătărie
  storage_key: wb_bucatarie

- type: custom:whiteboard-card
  title: Birou
  storage_key: wb_birou
```

### 4.4 Varianta iframe

Merge fără să înregistrezi vreo resursă:

```yaml
type: iframe
url: /local/whiteboard.html
aspect_ratio: 90%
```

Pagina acceptă parametri: `?key=birou` (tablă separată), `?lang=ro` (limba),
`?grid=0` (fără grilă), `?clean=1` (pornește cu butoanele ascunse).

HACS descarcă doar fișierul JavaScript, așa că dacă vrei și varianta iframe, copiază
`dist/whiteboard.html` lângă el, în `config/www/community/ha-whiteboard/`, și folosește
`/local/community/ha-whiteboard/whiteboard.html`.

---

## 5. Utilizare

### 5.1 Comenzi

| Acțiune | Cum |
|---------|-----|
| Desen | Mouse sau deget |
| Mutarea pânzei | Două degete, unealta `✋`, rotița mouse-ului, sau click mijloc/dreapta |
| Zoom | Pinch, `Ctrl` + scroll, sau butoanele `+` / `−` |
| Înapoi la origine | `⤢` |
| Ascunde / arată butoanele | Butonul rotund, sau tasta `H` |
| Anulare | `↶` sau `Ctrl+Z` |
| Mută sau redimensionează un obiect | Îl tragi; colțul albastru redimensionează; `✕` îl șterge |
| Editează o notă text | Dublu-click pe ea |
| Export PNG | `💾` |

### 5.2 Imagini și stickere

Trei feluri de a pune o poză pe tablă:

- **Lipire** — copiezi o imagine de oriunde și apeși `Ctrl+V` cu cursorul deasupra tablei
- **Drag & drop** — tragi fișierul imagine direct peste tablă
- **Butonul 🖼️** — deschide selectorul de fișiere; pe telefon sau tabletă îți oferă camera și
  galeria foto, cea mai rapidă cale de a transforma o poză în sticker

Imaginile se comportă ca orice alt obiect: le tragi ca să le muți, tragi colțul albastru ca să le
redimensionezi (proporțiile se păstrează), `✕` le șterge.

Pozele sunt micșorate la 1000 px pe latura lungă înainte de salvare, ca o poză de telefon să nu
umple spațiul de stocare al browserului. Imaginile cu transparență rămân PNG, ca stickerele
decupate să rămână transparente; restul se salvează ca JPEG. Dacă totuși se umple spațiul, tabla îți
spune, în loc să-ți piardă lucrul în tăcere.

### 5.3 Salvare și export

**Tabla se salvează singură.** Fiecare linie, notă și imagine se scrie automat în spațiul de stocare
al browserului — nu există buton de „salvează" de apăsat, iar la reîncărcarea paginii revine tot,
inclusiv poziția și zoomul la care rămăseseși.

**Butonul 💾 exportă un PNG** cu toată tabla — tot conținutul, nu doar partea vizibilă. În cardul
`iframe`, Home Assistant blochează descărcările (sandbox-ul nu are `allow-downloads`), așa că
imaginea se deschide într-o filă nouă, de unde o poți salva. În custom card descărcarea merge direct.

---

## 6. Probleme frecvente

| Simptom | Cauză și rezolvare |
|---------|--------------------|
| `Custom element doesn't exist: whiteboard-card` | Cache-ul browserului. Reîncarcă forțat. Dacă persistă, verifică în **Settings → Dashboards → ⋮ → Resources** URL-ul și că tipul e **JavaScript Module**. |
| *„Your resources are in YAML mode"* în loc de lista de resurse | Lovelace e în mod YAML, HACS nu poate înregistra resursa. O adaugi în `configuration.yaml` și repornești — vezi [3.3](#33-înregistrarea-resursei). |
| Cardul apare, dar e gol sau turtit | Mărește `height`, sau folosește un view cu `panel: true`. |
| HACS refuză să adauge repo-ul | Categoria trebuie să fie **Dashboard** (nu Integration), iar URL-ul trebuie să înceapă cu `https://`. |
| PNG-ul nu se descarcă niciodată | Folosești cardul `iframe` — imaginea se deschide într-o filă nouă. Permite pop-up-urile pentru adresa Home Assistant. |
| *„Spațiul de stocare e plin"* | Prea multe imagini pe o singură tablă. Șterge câteva, sau mută-le pe o a doua tablă cu propriul `storage_key`. |
| Tabla e goală pe alt device | Normal — tablele se salvează per browser, nu există sincronizare. |

---

## 7. Actualizare

**HACS:** la fiecare release nou apare o notificare → **HACS → Whiteboard Card → UPDATE**, apoi
reîncarcă forțat browserul. Resursa nu trebuie reconfigurată.

**Manual:**

```bash
cd ha-whiteboard
git pull
./install.sh /calea/catre/config
```

Dacă ai înregistrat resursa în mod YAML, nu uita să crești `?v=` în `configuration.yaml`.

---

## 8. Dezvoltare

### 8.1 Structura repo-ului

```
dist/whiteboard-card.js   motorul de desen + elementul custom:whiteboard-card
dist/whiteboard.html      pagina de sine stătătoare (varianta iframe), același motor
docs/                     capturile de ecran folosite în acest README
install.sh                copiază ambele fișiere în folderul de config Home Assistant
hacs.json                 metadate HACS
```

Nu există pas de build și nicio dependință. Editezi `dist/whiteboard-card.js`, reîncarci, gata.

### 8.2 Adăugarea unei limbi

Deschizi `dist/whiteboard-card.js`, cauți obiectul `I18N`, copiezi blocul `en`, traduci valorile și
adaugi numele limbii în `LANGUAGE_NAMES`. Cheile lipsă revin automat la engleză.
Pull request-urile cu limbi noi sunt binevenite.

---

## 9. Licență

MIT — vezi [LICENSE](LICENSE).
