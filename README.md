<h1 align="center">Whiteboard Card for Home Assistant</h1>

<p align="center">
  <a href="https://github.com/hacs/integration"><img src="https://img.shields.io/badge/HACS-Custom-41BDF5.svg" alt="HACS"></a>
  <a href="https://github.com/Dorin-Irimia/ha-whiteboard/releases"><img src="https://img.shields.io/github/v/release/Dorin-Irimia/ha-whiteboard" alt="Release"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="License"></a>
</p>

<p align="center"><b>🇬🇧 English</b> · <a href="README.ro.md">🇷🇴 Română</a></p>

<p align="center">
  An infinite-canvas whiteboard for your Home Assistant dashboard.<br>
  Draw with a finger or a mouse, paste photos, drop emoji and text notes, pan and zoom forever.<br>
  No cloud, no integration, no build step — a single JavaScript file that runs in your browser.
</p>

<p align="center"><img src="docs/screenshot-board.png" alt="The whiteboard card with drawings, a text note, emoji and a pasted photo" width="100%"></p>

---

## Table of contents

1. [Overview](#1-overview)
   - [1.1 Screenshots](#11-screenshots)
   - [1.2 Feature list](#12-feature-list)
2. [Requirements](#2-requirements)
3. [Installation](#3-installation)
   - [3.1 Via HACS (recommended)](#31-via-hacs-recommended)
   - [3.2 Manual installation](#32-manual-installation)
   - [3.3 Registering the resource](#33-registering-the-resource)
4. [Configuration](#4-configuration)
   - [4.1 Card options](#41-card-options)
   - [4.2 Language](#42-language)
   - [4.3 Layout recipes](#43-layout-recipes)
   - [4.4 The iframe alternative](#44-the-iframe-alternative)
5. [Using the board](#5-using-the-board)
   - [5.1 Controls](#51-controls)
   - [5.2 Images and stickers](#52-images-and-stickers)
   - [5.3 Saving and exporting](#53-saving-and-exporting)
6. [Troubleshooting](#6-troubleshooting)
7. [Updating](#7-updating)
8. [Development](#8-development)
   - [8.1 Repository layout](#81-repository-layout)
   - [8.2 Adding a language](#82-adding-a-language)
9. [License](#9-license)

---

## 1. Overview

### 1.1 Screenshots

**Clean mode** — one button (or the `H` key) hides the whole toolbar, leaving nothing but the board:

<img src="docs/screenshot-clean.png" alt="The same board with the toolbar hidden" width="100%">

**Visual editor** — no YAML needed to configure the card:

<img src="docs/screenshot-editor.png" alt="The card's visual editor in Home Assistant" width="560">

### 1.2 Feature list

- **Infinite canvas** — the drawing is not limited to the screen. Pan in any direction and keep
  drawing. Strokes are vectors, so they stay sharp at any zoom level.
- **Hideable UI** — the round button in the bottom-right corner (or the `H` key) hides the entire
  toolbar. The state is remembered across reloads.
- **Images and stickers** — paste with `Ctrl+V`, drag and drop, or pick a photo from your phone.
  Images are moved and resized like any other object, keeping their aspect ratio.
- **Emoji and text notes** — move and resize them independently (blue corner = resize,
  red `✕` = delete).
- **Eraser that cuts strokes** into pieces instead of painting white over them.
- **Multilingual toolbar** — English by default, 7 languages built in, or follow Home Assistant.
- Optional dot grid, fullscreen button, undo (`Ctrl+Z`), clear all.
- **PNG export** of the *entire* board, not just the visible area.
- **Multiple independent boards** on the same dashboard, via `storage_key`.
- Everything is stored locally in the browser — nothing leaves your network.

---

## 2. Requirements

| Requirement | Details |
|-------------|---------|
| Home Assistant | 2023.1 or newer |
| HACS | Only for the HACS install route — [installation guide](https://hacs.xyz/docs/use/download/download/). Manual install works without it. |
| Dashboard | A dashboard you can edit. If your Lovelace config is in **YAML mode**, you must register the resource by hand — see [3.3](#33-registering-the-resource). |
| Browser | Any modern browser (Chrome, Edge, Firefox, Safari) or the Home Assistant Companion App. Touch and pen input are supported. |

**Not required:** a Home Assistant restart, an integration, a custom component, internet access,
or any cloud account. This is a frontend-only card.

> **Where are the drawings stored?** In the browser's `localStorage`, on each device separately.
> A board drawn on the kitchen tablet is *not* visible on your phone. There is no server-side sync.

---

## 3. Installation

### 3.1 Via HACS (recommended)

This repository is not in the default HACS store yet, so it is added as a **custom repository**.

**Step 1 — add the repository**

1. Open **HACS** in the Home Assistant sidebar
2. Click the **three-dot menu** (⋮) in the top-right corner → **Custom repositories**
3. Fill in the dialog:
   - **Repository:** `https://github.com/Dorin-Irimia/ha-whiteboard`
   - **Type / Category:** **Dashboard** *(called "Lovelace" or "Plugin" on HACS versions before v2)*
4. Click **ADD**, then close the dialog

**Step 2 — download the card**

5. Search for **Whiteboard Card** in HACS — it appears right after adding the repository
6. Open it → **DOWNLOAD** (bottom-right) → confirm the version → **DOWNLOAD**

HACS places the file in `config/www/community/ha-whiteboard/whiteboard-card.js` and **registers the
Lovelace resource automatically** if your dashboards are UI-managed.

**Step 3 — clear the browser cache**

7. Press **`Ctrl` + `Shift` + `R`** (or `Ctrl+F5`)

On the Companion App: **Settings → Companion App → Debugging → Reset frontend cache**, or fully
close and reopen the app. Skipping this step is the number one cause of
*"Custom element doesn't exist"*.

**Step 4 — add the card to a dashboard**

8. Open your dashboard → **✏️** (edit mode) → **+ ADD CARD**
9. Search for **Whiteboard** and pick it
10. Adjust the settings in the visual editor → **SAVE**

### 3.2 Manual installation

```bash
git clone https://github.com/Dorin-Irimia/ha-whiteboard.git
cd ha-whiteboard
chmod +x install.sh
./install.sh /path/to/your/homeassistant/config
```

Or simply copy the files into your config folder:

```bash
cp dist/whiteboard-card.js dist/whiteboard.html /path/to/config/www/
```

The `www` folder is served automatically at `/local/...`, so the resource URL becomes
`/local/whiteboard-card.js`.

### 3.3 Registering the resource

Needed only for manual installs, or when Lovelace runs in YAML mode.

**UI-managed dashboards:** **Settings → Dashboards → ⋮ → Resources → Add resource**

| Field | Value |
|-------|-------|
| URL | `/local/community/ha-whiteboard/whiteboard-card.js` (HACS) or `/local/whiteboard-card.js` (manual) |
| Type | **JavaScript Module** |

**YAML mode** — in `configuration.yaml`, inside your existing `lovelace:` block:

```yaml
lovelace:
  resources:
    - url: /local/whiteboard-card.js?v=1
      type: module
```

Resources declared in YAML are only read at startup, so **restart Home Assistant** afterwards.
Bump the `?v=` number on every update, otherwise the browser keeps serving the cached file.

---

## 4. Configuration

### 4.1 Card options

```yaml
type: custom:whiteboard-card
title: Whiteboard
height: 420
```

| Option | Default | Description |
|--------|---------|-------------|
| `title` | — | Card header; omit for a card without a header |
| `height` | `420` | Height of the drawing area: a number (px) or a string (`85vh`) |
| `grid` | `true` | Dot grid |
| `hide_toolbar` | `false` | Start with the toolbar hidden |
| `storage_key` | `ha_whiteboard_v3` | Storage key — a different key means a separate board |
| `language` | `en` | Toolbar language, see [4.2](#42-language) |

### 4.2 Language

The toolbar is **English by default**. Built-in languages:

| Code | Language | Code | Language |
|------|----------|------|----------|
| `en` | English | `es` | Español |
| `ro` | Română | `it` | Italiano |
| `de` | Deutsch | `nl` | Nederlands |
| `fr` | Français | | |

```yaml
type: custom:whiteboard-card
language: ro
```

Use `language: auto` to follow the language of the logged-in Home Assistant user, falling back to
English when that language is not translated yet. On the standalone page, use `?lang=ro`.

### 4.3 Layout recipes

**A full-screen board** — a view with `panel: true`:

```yaml
views:
  - title: Whiteboard
    panel: true
    cards:
      - type: custom:whiteboard-card
        height: 85vh
```

**Several independent boards:**

```yaml
- type: custom:whiteboard-card
  title: Kitchen
  storage_key: wb_kitchen

- type: custom:whiteboard-card
  title: Office
  storage_key: wb_office
```

### 4.4 The iframe alternative

Works without registering any resource:

```yaml
type: iframe
url: /local/whiteboard.html
aspect_ratio: 90%
```

The page accepts parameters: `?key=office` (separate board), `?lang=ro` (language),
`?grid=0` (no grid), `?clean=1` (start with the toolbar hidden).

HACS only downloads the JavaScript file, so if you want the iframe variant too, copy
`dist/whiteboard.html` next to it, into `config/www/community/ha-whiteboard/`, and point the card at
`/local/community/ha-whiteboard/whiteboard.html`.

---

## 5. Using the board

### 5.1 Controls

| Action | How |
|--------|-----|
| Draw | Mouse or finger |
| Pan | Two fingers, the `✋` tool, mouse wheel, or middle/right-drag |
| Zoom | Pinch, `Ctrl` + scroll, or the `+` / `−` buttons |
| Back to origin | `⤢` |
| Hide / show the toolbar | The round button, or the `H` key |
| Undo | `↶` or `Ctrl+Z` |
| Move or resize an object | Drag it; drag the blue corner to resize; `✕` deletes it |
| Edit a text note | Double-click it |
| Export PNG | `💾` |

### 5.2 Images and stickers

Three ways to get a picture onto the board:

- **Paste** — copy an image anywhere and press `Ctrl+V` while the pointer is over the board
- **Drag and drop** — drop an image file straight onto the board
- **The 🖼️ button** — opens the file picker; on a phone or tablet this offers the camera and the
  photo gallery, which is the quickest way to turn a photo into a sticker

Images behave like every other object: drag to move, drag the blue corner to resize (the aspect
ratio is kept), `✕` to delete.

Pictures are downscaled to 1000 px on the long edge before being stored, so a phone photo does not
fill up the browser's storage. Images with transparency are kept as PNG so cut-out stickers stay
transparent; everything else is stored as JPEG. If the storage does fill up, the board says so
instead of silently losing your work.

### 5.3 Saving and exporting

**The board saves itself.** Every stroke, note and image is written to the browser's storage
automatically — there is no "save" button to press, and a page reload brings everything back,
including where you had panned and zoomed to.

**The 💾 button exports a PNG** of the whole board — the full content, not just the visible part.
Inside the `iframe` card, Home Assistant blocks downloads (the sandbox has no `allow-downloads`),
so the image opens in a new tab where you can save it. In the custom card the download works
directly.

---

## 6. Troubleshooting

| Symptom | Cause and fix |
|---------|---------------|
| `Custom element doesn't exist: whiteboard-card` | Browser cache. Hard-reload. If it persists, check **Settings → Dashboards → ⋮ → Resources** for the URL and make sure the type is **JavaScript Module**. |
| *"Your resources are in YAML mode"* instead of the resource list | Lovelace is in YAML mode; HACS cannot register the resource. Add it to `configuration.yaml` and restart — see [3.3](#33-registering-the-resource). |
| The card shows up but is empty or squashed | Increase `height`, or use a view with `panel: true`. |
| HACS refuses to add the repository | The category must be **Dashboard** (not Integration), and the URL must include `https://`. |
| The PNG never downloads | You are using the `iframe` card — the image opens in a new tab instead. Allow pop-ups for your Home Assistant address. |
| *"Storage is full"* | Too many images on one board. Delete a few, or move them to a second board with its own `storage_key`. |
| The board is empty on another device | Expected — boards are stored per browser, there is no sync. |

---

## 7. Updating

**HACS:** a notification appears on new releases → **HACS → Whiteboard Card → UPDATE**, then
hard-reload the browser. The resource does not need to be reconfigured.

**Manual:**

```bash
cd ha-whiteboard
git pull
./install.sh /path/to/config
```

Remember to bump `?v=` in `configuration.yaml` if you registered the resource in YAML mode.

---

## 8. Development

### 8.1 Repository layout

```
dist/whiteboard-card.js   the drawing engine + the custom:whiteboard-card element
dist/whiteboard.html      standalone page (iframe variant), uses the same engine
docs/                     screenshots used in this README
install.sh                copies both files into the Home Assistant config folder
hacs.json                 HACS metadata
```

There is no build step and no dependency. Edit `dist/whiteboard-card.js`, reload, done.

### 8.2 Adding a language

Open `dist/whiteboard-card.js`, find the `I18N` object, copy the `en` block, translate the values
and add a display name in `LANGUAGE_NAMES`. Missing keys fall back to English automatically.
Pull requests with new languages are welcome.

---

## 9. License

MIT — see [LICENSE](LICENSE).
