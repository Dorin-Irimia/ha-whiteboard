# Whiteboard Card for Home Assistant

[![hacs][hacs-badge]][hacs-url]
[![release][release-badge]][release-url]
[![license][license-badge]](LICENSE)

**🇬🇧 English** · [🇷🇴 Română](README.ro.md)

An infinite-canvas whiteboard for your Home Assistant dashboard. Draw with a finger or a mouse,
drop emoji and text notes, pan and zoom forever. No cloud, no integration, no build step —
a single JavaScript file that runs entirely in your browser.

[hacs-badge]: https://img.shields.io/badge/HACS-Custom-41BDF5.svg
[hacs-url]: https://github.com/hacs/integration
[release-badge]: https://img.shields.io/github/v/release/Dorin-Irimia/ha-whiteboard
[release-url]: https://github.com/Dorin-Irimia/ha-whiteboard/releases
[license-badge]: https://img.shields.io/badge/license-MIT-blue.svg

---

## Features

- **Infinite canvas** — the drawing is not limited to the screen. Pan in any direction and keep
  drawing. Strokes are vectors, so they stay sharp at any zoom level.
- **Hideable UI** — the round button in the bottom-right corner (or the `H` key) hides the entire
  toolbar, leaving a clean white surface. The state is remembered.
- **Emoji and text objects** — move and resize them independently (blue corner = resize,
  red `✕` = delete).
- **Eraser that cuts strokes** into pieces instead of painting white over them.
- Optional dot grid, fullscreen button, undo (`Ctrl+Z`), clear all.
- **PNG export** of the *entire* board, not just the visible area.
- **Multiple independent boards** on the same dashboard, via `storage_key`.
- Everything is stored locally in the browser — nothing leaves your network.

## Requirements

| Requirement | Details |
|-------------|---------|
| Home Assistant | 2023.1 or newer |
| HACS | Only for the HACS install route — [installation guide](https://hacs.xyz/docs/use/download/download/). Manual install works without it. |
| Dashboard | A dashboard you can edit. If your Lovelace config is in **YAML mode**, you must register the resource by hand (see below). |
| Browser | Any modern browser (Chrome, Edge, Firefox, Safari) or the Home Assistant Companion App. Touch and pen input are supported. |

**Not required:** a Home Assistant restart, an integration, a custom component, internet access,
or any cloud account. This is a frontend-only card.

> **Where are the drawings stored?** In the browser's `localStorage`, on each device separately.
> A board drawn on the kitchen tablet is *not* visible on your phone. There is no server-side sync.

---

## Installation via HACS (recommended)

This repository is not in the default HACS store yet, so it is added as a **custom repository**.

**1. Add the repository**

1. Open **HACS** in the Home Assistant sidebar
2. Click the **three-dot menu** (⋮) in the top-right corner → **Custom repositories**
3. Fill in the dialog:
   - **Repository:** `https://github.com/Dorin-Irimia/ha-whiteboard`
   - **Type / Category:** **Dashboard** *(called "Lovelace" or "Plugin" on HACS versions before v2)*
4. Click **ADD**, then close the dialog

**2. Download the card**

5. Search for **Whiteboard Card** in HACS — it appears right after adding the repository
6. Open it → **DOWNLOAD** (bottom-right) → confirm the version → **DOWNLOAD**

HACS places the file in `config/www/community/ha-whiteboard/whiteboard-card.js` and **registers the
Lovelace resource automatically** if your dashboards are UI-managed.

**3. Clear the browser cache**

7. Press **`Ctrl` + `Shift` + `R`** (or `Ctrl+F5`)

On the Companion App: **Settings → Companion App → Debugging → Reset frontend cache**, or fully
close and reopen the app. Skipping this step is the number one cause of
*"Custom element doesn't exist"*.

**4. Add the card to a dashboard**

8. Open your dashboard → **✏️** (edit mode) → **+ ADD CARD**
9. Search for **Whiteboard** and pick it
10. Adjust title, height and grid in the visual editor → **SAVE**

## Manual installation (without HACS)

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
`/local/whiteboard-card.js`. Then register the resource as described below.

## Registering the resource manually

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

## Usage

```yaml
type: custom:whiteboard-card
title: Whiteboard
height: 420
```

### Card options

| Option | Default | Description |
|--------|---------|-------------|
| `title` | — | Card header; omit for a card without a header |
| `height` | `420` | Height of the drawing area: a number (px) or a string (`85vh`) |
| `grid` | `true` | Dot grid |
| `hide_toolbar` | `false` | Start with the toolbar hidden |
| `storage_key` | `ha_whiteboard_v3` | Storage key — a different key means a separate board |

### A full-screen board

```yaml
views:
  - title: Whiteboard
    panel: true
    cards:
      - type: custom:whiteboard-card
        height: 85vh
```

### Several independent boards

```yaml
- type: custom:whiteboard-card
  title: Kitchen
  storage_key: wb_kitchen

- type: custom:whiteboard-card
  title: Office
  storage_key: wb_office
```

### Controls

| Action | How |
|--------|-----|
| Draw | Mouse or finger |
| Pan | Two fingers, the `✋` tool, mouse wheel, or middle/right-drag |
| Zoom | Pinch, `Ctrl` + scroll, or the `+` / `−` buttons |
| Back to origin | `⤢` |
| Hide/show the toolbar | The round button, or the `H` key |
| Undo | `↶` or `Ctrl+Z` |
| Export PNG | `💾` |

### Alternative: iframe card

Works without registering any resource:

```yaml
type: iframe
url: /local/whiteboard.html
aspect_ratio: 90%
```

The page also accepts parameters: `?key=office` (separate board), `?grid=0` (no grid),
`?clean=1` (start with the toolbar hidden).

HACS only downloads the JavaScript file, so if you want the iframe variant too, copy
`dist/whiteboard.html` next to it, into `config/www/community/ha-whiteboard/`, and point the card at
`/local/community/ha-whiteboard/whiteboard.html`.

---

## Notes

- **The 💾 button exports a PNG — it does not save your notes.** The board saves itself
  continuously, on every stroke. Inside the `iframe` card, Home Assistant blocks downloads
  (the sandbox has no `allow-downloads`), so the image opens in a new tab instead, where you can
  save it. In the custom card, the download works directly.
- Boards are per browser and per device. There is no sync between your tablet and your phone.
- A board drawn with version 1.x (fixed canvas, stored as PNG) is imported automatically as a
  background layer, so nothing is lost.

## Troubleshooting

| Symptom | Cause and fix |
|---------|---------------|
| `Custom element doesn't exist: whiteboard-card` | Browser cache. Hard-reload. If it persists, check **Settings → Dashboards → ⋮ → Resources** for the URL and make sure the type is **JavaScript Module**. |
| *"Your resources are in YAML mode"* instead of the resource list | Lovelace is in YAML mode; HACS cannot register the resource. Add it to `configuration.yaml` and restart. |
| The card shows up but is empty or squashed | Increase `height`, or use a view with `panel: true`. |
| HACS refuses to add the repository | The category must be **Dashboard** (not Integration), and the URL must include `https://`. |
| The PNG never downloads | You are using the `iframe` card — the image opens in a new tab. Allow pop-ups for your Home Assistant address. |

## Updating

**HACS:** a notification appears on new releases → **HACS → Whiteboard Card → UPDATE**, then
hard-reload the browser. The resource does not need to be reconfigured.

**Manual:**

```bash
cd ha-whiteboard
git pull
./install.sh /path/to/config
```

## Repository layout

```
dist/whiteboard-card.js   the drawing engine + the custom:whiteboard-card element
dist/whiteboard.html      standalone page (iframe variant), uses the same engine
install.sh                copies both files into the Home Assistant config folder
hacs.json                 HACS metadata
```

## License

MIT — see [LICENSE](LICENSE).
