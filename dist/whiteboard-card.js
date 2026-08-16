/*
 * HA Whiteboard — custom card pentru Lovelace + motorul de desen.
 *
 * Defineste doua elemente:
 *   <whiteboard-board>  — tabla propriu-zisa (folosita si de whiteboard.html standalone)
 *   <whiteboard-card>   — cardul Lovelace (type: custom:whiteboard-card)
 *
 * Fara dependinte externe. Tot desenul e vectorial, pe o panza infinita.
 */

const VERSION = '2.4.7';

const STYLES = `
  :host {
    display: block;
    position: relative;
    width: 100%;
    height: 100%;
    --wb-panel: rgba(35,37,41,0.92);
    --wb-panel-border: #3a3d44;
    --wb-ink: #f2f1ee;
    --wb-muted: #9a9da3;
    --wb-accent: #5eb1ff;
  }
  * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }

  .wb {
    position: absolute;
    inset: 0;
    overflow: hidden;
    background: #ffffff;
    border-radius: inherit;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    color: var(--wb-ink);
    touch-action: none;
  }
  .wb:fullscreen { border-radius: 0; }

  .canvasWrap { position: absolute; inset: 0; overflow: hidden; }
  canvas { position: absolute; top: 0; left: 0; width: 100%; height: 100%; display: block; }
  .objectLayer {
    position: absolute; top: 0; left: 0; width: 0; height: 0;
    transform-origin: 0 0;
    pointer-events: none;
  }

  /* ---------- Bara de unelte (overlay, ascundibila) ---------- */
  .toolbar {
    position: absolute;
    top: 8px; left: 8px;
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 5px;
    background: var(--wb-panel);
    -webkit-backdrop-filter: blur(8px);
    backdrop-filter: blur(8px);
    border: 1px solid var(--wb-panel-border);
    border-radius: 14px;
    flex-wrap: wrap;
    max-width: calc(100% - 16px);
    z-index: 20;
    transition: opacity .18s ease, transform .18s ease;
  }
  .wb.chrome-hidden .toolbar,
  .wb.chrome-hidden .hint {
    opacity: 0;
    transform: translateY(-12px);
    pointer-events: none;
  }
  .group {
    display: flex;
    align-items: center;
    gap: 5px;
    padding: 4px 7px;
    background: rgba(27,29,33,0.85);
    border-radius: 10px;
    border: 1px solid var(--wb-panel-border);
  }
  .swatch {
    width: 22px; height: 22px;
    border-radius: 50%;
    border: 2px solid transparent;
    cursor: pointer;
    flex-shrink: 0;
  }
  .swatch.active { border-color: var(--wb-ink); }
  input[type="color"] {
    width: 24px; height: 24px;
    border: none; border-radius: 50%;
    padding: 0; background: none; cursor: pointer;
  }
  input[type="range"] { width: 64px; accent-color: var(--wb-accent); }
  button, .btn {
    background: #2c2f35;
    color: var(--wb-ink);
    border: 1px solid var(--wb-panel-border);
    border-radius: 8px;
    padding: 6px 9px;
    font-size: 12.5px;
    font-family: inherit;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 5px;
    white-space: nowrap;
  }
  button:active, .btn:active { background: #3a3e46; }
  button.active-tool { background: var(--wb-accent); color: #10131a; border-color: var(--wb-accent); }
  .brushPreview { border-radius: 50%; background: var(--wb-ink); flex-shrink: 0; }
  .zoomLabel { font-size: 12px; color: var(--wb-muted); min-width: 38px; text-align: center; }

  /* ---------- Buton de ascundere ---------- */
  .chromeToggle {
    position: absolute;
    right: 10px; bottom: 10px;
    width: 40px; height: 40px;
    padding: 0;
    justify-content: center;
    border-radius: 50%;
    background: var(--wb-panel);
    -webkit-backdrop-filter: blur(8px);
    backdrop-filter: blur(8px);
    border: 1px solid var(--wb-panel-border);
    font-size: 15px;
    opacity: 0.5;
    z-index: 30;
    transition: opacity .18s ease;
  }
  .chromeToggle:hover { opacity: 1; }
  .wb.chrome-hidden .chromeToggle { opacity: 0.22; }
  .wb.chrome-hidden .chromeToggle:hover { opacity: 0.9; }

  /* ---------- Obiecte (emoji / text) ---------- */
  .obj {
    position: absolute;
    pointer-events: auto;
    display: flex;
    align-items: center;
    justify-content: center;
    user-select: none;
    cursor: move;
    border: 1px solid transparent;
  }
  .obj .txt { line-height: 1.1; outline: none; white-space: nowrap; }
  .obj.image {
    background: #fff;
    border-radius: 4px;
    filter: drop-shadow(0 1px 3px rgba(0,0,0,0.28));
  }
  .obj.image img {
    width: 100%; height: 100%;
    object-fit: contain;
    display: block;
    pointer-events: none;
    user-select: none;
    -webkit-user-drag: none;
    border-radius: 3px;
  }

  /* Ascuns vizual, dar nu cu display:none — pe iOS/Android un input cu
     display:none sau hidden nu deschide selectorul de fisiere. */
  /* Inputul acopera butonul si e transparent: atingerea utilizatorului cade
     direct pe el. Un input.click() din JavaScript e refuzat de unele webview-uri
     Android, care nu il considera un gest real al utilizatorului. */
  #imageBtn { position: relative; overflow: hidden; cursor: pointer; }
  .fileInput {
    position: absolute;
    inset: -2px;
    width: 100%; height: 100%;
    opacity: 0;
    cursor: pointer;
    font-size: 0;
  }

  .dropHint {
    position: absolute;
    inset: 12px;
    display: none;
    align-items: center;
    justify-content: center;
    border: 2px dashed var(--wb-accent);
    border-radius: 14px;
    background: rgba(94,177,255,0.12);
    color: #10131a;
    font-size: 15px;
    font-weight: 600;
    z-index: 35;
    pointer-events: none;
  }
  .dropHint.show { display: flex; }
  .obj.text .txt { color: inherit; user-select: text; }
  .obj.text { color: #111; }
  .obj.selected { border: 1px dashed var(--wb-accent); }
  .handle {
    position: absolute;
    width: 18px; height: 18px;
    background: var(--wb-accent);
    border-radius: 50%;
    right: -9px; bottom: -9px;
    cursor: nwse-resize;
    display: none;
  }
  .obj.selected .handle { display: block; }
  .del-handle {
    position: absolute;
    width: 18px; height: 18px;
    background: #e03131;
    color: #fff;
    border-radius: 50%;
    right: -9px; top: -9px;
    display: none;
    align-items: center;
    justify-content: center;
    font-size: 11px;
    cursor: pointer;
  }
  .obj.selected .del-handle { display: flex; }

  .emojiPanel {
    position: absolute;
    top: 8px; right: 8px;
    background: var(--wb-panel);
    -webkit-backdrop-filter: blur(8px);
    backdrop-filter: blur(8px);
    border: 1px solid var(--wb-panel-border);
    border-radius: 10px;
    padding: 6px;
    display: none;
    grid-template-columns: repeat(6, 1fr);
    gap: 2px;
    max-width: 260px;
    z-index: 21;
  }
  .emojiPanel.open { display: grid; }
  .wb.chrome-hidden .emojiPanel { display: none; }
  .emoji-btn { font-size: 20px; background: none; border: none; padding: 4px; cursor: pointer; border-radius: 6px; }
  .emoji-btn:active { background: #3a3e46; }

  .hint {
    position: absolute;
    bottom: 10px; left: 10px;
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 11px;
    color: var(--wb-muted);
    background: rgba(0,0,0,0.45);
    padding: 4px 6px 4px 9px;
    border-radius: 8px;
    z-index: 20;
    max-width: 72%;
    transition: opacity .18s ease, transform .18s ease;
  }
  .hint.gone { display: none; }

  .toast {
    position: absolute;
    left: 50%;
    bottom: 16px;
    transform: translate(-50%, 12px);
    max-width: 80%;
    padding: 8px 14px;
    background: var(--wb-panel);
    -webkit-backdrop-filter: blur(8px);
    backdrop-filter: blur(8px);
    border: 1px solid var(--wb-panel-border);
    border-radius: 10px;
    color: var(--wb-ink);
    font-size: 12.5px;
    text-align: center;
    opacity: 0;
    pointer-events: none;
    transition: opacity .2s ease, transform .2s ease;
    z-index: 40;
  }
  .toast.show { opacity: 1; transform: translate(-50%, 0); }
  .hintClose {
    padding: 0;
    width: 18px; height: 18px;
    justify-content: center;
    border-radius: 50%;
    font-size: 11px;
    background: #2c2f35;
    flex-shrink: 0;
  }
`;

const MARKUP = `
  <div class="wb" id="wb">
    <div class="canvasWrap" id="canvasWrap">
      <canvas id="board"></canvas>
      <div class="objectLayer" id="objectLayer"></div>
    </div>

    <div class="toolbar" id="toolbar">
      <div class="group">
        <div class="swatch active" style="background:#111111" data-color="#111111"></div>
        <div class="swatch" style="background:#e03131" data-color="#e03131"></div>
        <div class="swatch" style="background:#2f9e44" data-color="#2f9e44"></div>
        <div class="swatch" style="background:#1971c2" data-color="#1971c2"></div>
        <div class="swatch" style="background:#f08c00" data-color="#f08c00"></div>
        <input type="color" id="customColor" value="#111111" data-i18n-title="color">
      </div>

      <div class="group">
        <span class="brushPreview" id="brushPreview" style="width:8px;height:8px;"></span>
        <input type="range" id="sizeSlider" min="1" max="40" value="4" data-i18n-title="size">
      </div>

      <div class="group">
        <button id="penBtn" class="active-tool" data-i18n-title="pen"><span>✏️</span><span data-i18n="pen"></span></button>
        <button id="eraserBtn" data-i18n-title="eraser"><span>🧹</span><span data-i18n="eraser"></span></button>
        <button id="textBtn" data-i18n-title="text"><span>🔤</span><span data-i18n="text"></span></button>
        <button id="panBtn" data-i18n-title="pan"><span>✋</span><span data-i18n="pan"></span></button>
      </div>

      <div class="group">
        <button id="zoomOutBtn" data-i18n-title="zoomOut">−</button>
        <span class="zoomLabel" id="zoomLabel">100%</span>
        <button id="zoomInBtn" data-i18n-title="zoomIn">+</button>
        <button id="zoomResetBtn" data-i18n-title="resetView">⤢</button>
        <button id="gridBtn" data-i18n-title="grid">▦</button>
        <button id="fsBtn" data-i18n-title="fullscreen">⛶</button>
      </div>

      <div class="group">
        <button id="syncBadge" data-i18n-title="syncLocal">🖥️</button>
        <button id="emojiToggle" data-i18n-title="emoji">🙂</button>
        <label id="imageBtn" class="btn" data-i18n-title="image">🖼️<input type="file" id="fileInput" class="fileInput" accept="image/*"></label>
        <button id="undoBtn" data-i18n-title="undo">↶</button>
        <button id="clearBtn" data-i18n-title="clear">🗑️</button>
        <button id="saveBtn" data-i18n-title="export">💾</button>
      </div>
    </div>

    <div class="dropHint" id="dropHint" data-i18n="dropHere"></div>

    <div class="emojiPanel" id="emojiPanel"></div>

    <div class="hint" id="hint">
      <span data-i18n="hint"></span>
      <button class="hintClose" id="hintClose" data-i18n-title="hideHint">✕</button>
    </div>

    <button class="chromeToggle" id="chromeToggle" data-i18n-title="toggleUi">✕</button>
  </div>
`;

/* ============================================================
 *  Traduceri / Translations
 *  Ca sa adaugi o limba noua: copiaza blocul "en", tradu valorile
 *  si adauga codul limbii in SUPPORTED_LANGUAGES.
 * ============================================================ */
const I18N = {
  en: {
    pen: 'Pen', eraser: 'Eraser', text: 'Text', pan: 'Move',
    color: 'Custom colour', size: 'Brush size',
    zoomIn: 'Zoom in', zoomOut: 'Zoom out', resetView: 'Reset view',
    grid: 'Dot grid', fullscreen: 'Fullscreen',
    emoji: 'Emoji', image: 'Add image / sticker (or paste with Ctrl+V)',
    undo: 'Undo (Ctrl+Z)', clear: 'Clear all', export: 'Export as PNG',
    toggleUi: 'Hide / show the toolbar (H)', hideHint: 'Hide permanently',
    dropHere: 'Drop the image here',
    hint: 'Infinite canvas · Pan: 2 fingers / ✋ · Zoom: pinch or Ctrl+scroll · Hide the buttons: H',
    openedInTab: 'The image opened in a new tab — save it from there',
    popupBlocked: 'Allow pop-ups to export the image',
    readFailed: 'Could not read the file',
    notAnImage: 'That file is not a valid image',
    storageFull: 'Storage is full — remove a few images or clear the board',
    syncShared: 'Shared board — everyone on this Home Assistant sees it',
    syncLocal: 'Local board — only this browser. Install the Whiteboard integration to share it.',
    imageLoading: 'Loading image…',
    heicUnsupported: 'This browser cannot open HEIC/HEIF photos. Set the camera to JPEG, or share the photo instead of picking the file.',
    imageFailed: 'Could not open that photo'
  },
  ro: {
    pen: 'Creion', eraser: 'Radieră', text: 'Text', pan: 'Mută',
    color: 'Culoare personalizată', size: 'Grosimea liniei',
    zoomIn: 'Mărește', zoomOut: 'Micșorează', resetView: 'Înapoi la centru',
    grid: 'Grilă de puncte', fullscreen: 'Ecran complet',
    emoji: 'Emoji', image: 'Adaugă imagine / sticker (sau lipește cu Ctrl+V)',
    undo: 'Anulează (Ctrl+Z)', clear: 'Șterge tot', export: 'Exportă ca PNG',
    toggleUi: 'Ascunde / arată butoanele (H)', hideHint: 'Ascunde permanent',
    dropHere: 'Lasă imaginea aici',
    hint: 'Pânză infinită · Mută: 2 degete / ✋ · Zoom: pinch sau Ctrl+scroll · Ascunde butoanele: H',
    openedInTab: 'Imaginea s-a deschis într-o filă nouă — salveaz-o de acolo',
    popupBlocked: 'Permite ferestrele pop-up ca să poți exporta imaginea',
    readFailed: 'Nu am putut citi fișierul',
    notAnImage: 'Fișierul nu este o imagine validă',
    storageFull: 'Spațiul de stocare e plin — șterge câteva imagini sau golește tabla',
    syncShared: 'Tablă partajată — o văd toți din acest Home Assistant',
    syncLocal: 'Tablă locală — doar în acest browser. Instalează integrarea Whiteboard ca să fie partajată.',
    imageLoading: 'Se încarcă imaginea…',
    heicUnsupported: 'Browserul nu poate deschide poze HEIC/HEIF. Pune camera pe JPEG, sau trimite poza prin partajare în loc să alegi fișierul.',
    imageFailed: 'Nu am putut deschide poza'
  },
  de: {
    pen: 'Stift', eraser: 'Radierer', text: 'Text', pan: 'Verschieben',
    color: 'Eigene Farbe', size: 'Strichstärke',
    zoomIn: 'Vergrößern', zoomOut: 'Verkleinern', resetView: 'Ansicht zurücksetzen',
    grid: 'Punktraster', fullscreen: 'Vollbild',
    emoji: 'Emoji', image: 'Bild / Sticker hinzufügen (oder mit Strg+V einfügen)',
    undo: 'Rückgängig (Strg+Z)', clear: 'Alles löschen', export: 'Als PNG exportieren',
    toggleUi: 'Werkzeugleiste aus-/einblenden (H)', hideHint: 'Dauerhaft ausblenden',
    dropHere: 'Bild hier ablegen',
    hint: 'Unendliche Fläche · Verschieben: 2 Finger / ✋ · Zoom: Pinch oder Strg+Scrollen · Buttons ausblenden: H',
    openedInTab: 'Das Bild wurde in einem neuen Tab geöffnet — dort speichern',
    popupBlocked: 'Pop-ups erlauben, um das Bild zu exportieren',
    readFailed: 'Datei konnte nicht gelesen werden',
    notAnImage: 'Die Datei ist kein gültiges Bild',
    storageFull: 'Speicher voll — entferne einige Bilder oder leere die Tafel',
    syncShared: 'Geteilte Tafel — alle in diesem Home Assistant sehen sie',
    syncLocal: 'Lokale Tafel — nur in diesem Browser. Installiere die Whiteboard-Integration zum Teilen.',
    imageLoading: 'Bild wird geladen…',
    heicUnsupported: 'Dieser Browser kann keine HEIC/HEIF-Fotos öffnen. Stelle die Kamera auf JPEG um oder teile das Foto.',
    imageFailed: 'Das Foto konnte nicht geöffnet werden'
  },
  fr: {
    pen: 'Crayon', eraser: 'Gomme', text: 'Texte', pan: 'Déplacer',
    color: 'Couleur personnalisée', size: 'Épaisseur du trait',
    zoomIn: 'Zoom avant', zoomOut: 'Zoom arrière', resetView: 'Réinitialiser la vue',
    grid: 'Grille de points', fullscreen: 'Plein écran',
    emoji: 'Emoji', image: 'Ajouter une image / un sticker (ou coller avec Ctrl+V)',
    undo: 'Annuler (Ctrl+Z)', clear: 'Tout effacer', export: 'Exporter en PNG',
    toggleUi: 'Masquer / afficher la barre d\'outils (H)', hideHint: 'Masquer définitivement',
    dropHere: 'Déposez l\'image ici',
    hint: 'Toile infinie · Déplacer : 2 doigts / ✋ · Zoom : pincer ou Ctrl+molette · Masquer les boutons : H',
    openedInTab: 'L\'image s\'est ouverte dans un nouvel onglet — enregistrez-la depuis là',
    popupBlocked: 'Autorisez les pop-ups pour exporter l\'image',
    readFailed: 'Impossible de lire le fichier',
    notAnImage: 'Ce fichier n\'est pas une image valide',
    storageFull: 'Stockage plein — supprimez des images ou videz le tableau',
    syncShared: 'Tableau partagé — tout le monde sur ce Home Assistant le voit',
    syncLocal: 'Tableau local — seulement ce navigateur. Installez l\'intégration Whiteboard pour le partager.',
    imageLoading: 'Chargement de l\'image…',
    heicUnsupported: 'Ce navigateur ne peut pas ouvrir les photos HEIC/HEIF. Réglez l\'appareil photo sur JPEG ou partagez la photo.',
    imageFailed: 'Impossible d\'ouvrir cette photo'
  },
  es: {
    pen: 'Lápiz', eraser: 'Borrador', text: 'Texto', pan: 'Mover',
    color: 'Color personalizado', size: 'Grosor del trazo',
    zoomIn: 'Acercar', zoomOut: 'Alejar', resetView: 'Restablecer vista',
    grid: 'Cuadrícula de puntos', fullscreen: 'Pantalla completa',
    emoji: 'Emoji', image: 'Añadir imagen / pegatina (o pegar con Ctrl+V)',
    undo: 'Deshacer (Ctrl+Z)', clear: 'Borrar todo', export: 'Exportar como PNG',
    toggleUi: 'Ocultar / mostrar la barra (H)', hideHint: 'Ocultar permanentemente',
    dropHere: 'Suelta la imagen aquí',
    hint: 'Lienzo infinito · Mover: 2 dedos / ✋ · Zoom: pellizcar o Ctrl+rueda · Ocultar botones: H',
    openedInTab: 'La imagen se abrió en una pestaña nueva — guárdala desde allí',
    popupBlocked: 'Permite las ventanas emergentes para exportar la imagen',
    readFailed: 'No se pudo leer el archivo',
    notAnImage: 'El archivo no es una imagen válida',
    storageFull: 'Almacenamiento lleno — elimina imágenes o vacía la pizarra',
    syncShared: 'Pizarra compartida — la ven todos en este Home Assistant',
    syncLocal: 'Pizarra local — solo este navegador. Instala la integración Whiteboard para compartirla.',
    imageLoading: 'Cargando imagen…',
    heicUnsupported: 'Este navegador no puede abrir fotos HEIC/HEIF. Configura la cámara en JPEG o comparte la foto.',
    imageFailed: 'No se pudo abrir esa foto'
  },
  it: {
    pen: 'Matita', eraser: 'Gomma', text: 'Testo', pan: 'Sposta',
    color: 'Colore personalizzato', size: 'Spessore del tratto',
    zoomIn: 'Ingrandisci', zoomOut: 'Riduci', resetView: 'Reimposta vista',
    grid: 'Griglia a punti', fullscreen: 'Schermo intero',
    emoji: 'Emoji', image: 'Aggiungi immagine / sticker (o incolla con Ctrl+V)',
    undo: 'Annulla (Ctrl+Z)', clear: 'Cancella tutto', export: 'Esporta come PNG',
    toggleUi: 'Nascondi / mostra la barra (H)', hideHint: 'Nascondi definitivamente',
    dropHere: 'Trascina qui l\'immagine',
    hint: 'Tela infinita · Sposta: 2 dita / ✋ · Zoom: pizzica o Ctrl+rotellina · Nascondi i pulsanti: H',
    openedInTab: 'L\'immagine si è aperta in una nuova scheda — salvala da lì',
    popupBlocked: 'Consenti i pop-up per esportare l\'immagine',
    readFailed: 'Impossibile leggere il file',
    notAnImage: 'Il file non è un\'immagine valida',
    storageFull: 'Spazio esaurito — rimuovi immagini o svuota la lavagna',
    syncShared: 'Lavagna condivisa — la vedono tutti su questo Home Assistant',
    syncLocal: 'Lavagna locale — solo questo browser. Installa l\'integrazione Whiteboard per condividerla.',
    imageLoading: 'Caricamento immagine…',
    heicUnsupported: 'Questo browser non apre le foto HEIC/HEIF. Imposta la fotocamera su JPEG oppure condividi la foto.',
    imageFailed: 'Non riesco ad aprire quella foto'
  },
  nl: {
    pen: 'Pen', eraser: 'Gum', text: 'Tekst', pan: 'Verplaatsen',
    color: 'Aangepaste kleur', size: 'Lijndikte',
    zoomIn: 'Inzoomen', zoomOut: 'Uitzoomen', resetView: 'Weergave herstellen',
    grid: 'Stippenraster', fullscreen: 'Volledig scherm',
    emoji: 'Emoji', image: 'Afbeelding / sticker toevoegen (of plakken met Ctrl+V)',
    undo: 'Ongedaan maken (Ctrl+Z)', clear: 'Alles wissen', export: 'Exporteren als PNG',
    toggleUi: 'Werkbalk verbergen / tonen (H)', hideHint: 'Permanent verbergen',
    dropHere: 'Zet de afbeelding hier neer',
    hint: 'Oneindig canvas · Verplaatsen: 2 vingers / ✋ · Zoom: knijpen of Ctrl+scroll · Knoppen verbergen: H',
    openedInTab: 'De afbeelding is in een nieuw tabblad geopend — sla hem daar op',
    popupBlocked: 'Sta pop-ups toe om de afbeelding te exporteren',
    readFailed: 'Kon het bestand niet lezen',
    notAnImage: 'Dit bestand is geen geldige afbeelding',
    storageFull: 'Opslag vol — verwijder afbeeldingen of wis het bord',
    syncShared: 'Gedeeld bord — iedereen op deze Home Assistant ziet het',
    syncLocal: 'Lokaal bord — alleen deze browser. Installeer de Whiteboard-integratie om te delen.',
    imageLoading: 'Afbeelding laden…',
    heicUnsupported: 'Deze browser kan geen HEIC/HEIF-foto\'s openen. Zet de camera op JPEG of deel de foto.',
    imageFailed: 'Kon die foto niet openen'
  }
};

const SUPPORTED_LANGUAGES = Object.keys(I18N);
const DEFAULT_LANGUAGE = 'en';
const LANGUAGE_NAMES = {
  en: 'English', ro: 'Română', de: 'Deutsch', fr: 'Français',
  es: 'Español', it: 'Italiano', nl: 'Nederlands'
};

function resolveLanguage(pref, hassLanguage) {
  if (pref && pref !== 'auto') {
    const code = String(pref).toLowerCase().slice(0, 2);
    return I18N[code] ? code : DEFAULT_LANGUAGE;
  }
  if (pref === 'auto') {
    const candidates = [hassLanguage, (typeof navigator !== 'undefined' ? navigator.language : '')];
    for (const c of candidates) {
      if (!c) continue;
      const code = String(c).toLowerCase().slice(0, 2);
      if (I18N[code]) return code;
    }
  }
  return DEFAULT_LANGUAGE;
}

const EMOJIS = ['😀','😂','😍','😎','🤔','👍','👎','❤️','🔥','⭐','✅','❌',
                '🎉','☀️','🌧️','❄️','⚡','💧','🏠','🚗','⏰','📌','💡','⚠️'];

const DEFAULT_KEY = 'ha_whiteboard_v3';
const LEGACY_KEY = 'ha_whiteboard_v2';

/* ============================================================
 *  Motorul whiteboard
 * ============================================================ */
function createWhiteboard(root, options) {
  const opts = Object.assign(
    { storageKey: DEFAULT_KEY, grid: true, hideToolbar: false, language: DEFAULT_LANGUAGE },
    options || {}
  );

  root.innerHTML = '<style>' + STYLES + '</style>' + MARKUP;
  const $ = (id) => root.getElementById(id);

  const wb = $('wb');
  const wrap = $('canvasWrap');
  const canvas = $('board');
  const ctx = canvas.getContext('2d');
  const objectLayer = $('objectLayer');
  const toolbar = $('toolbar');
  const emojiPanel = $('emojiPanel');
  const hint = $('hint');
  const zoomLabel = $('zoomLabel');
  const brushPreview = $('brushPreview');
  const sizeSlider = $('sizeSlider');
  const customColor = $('customColor');
  const penBtn = $('penBtn'), eraserBtn = $('eraserBtn'), textBtn = $('textBtn'), panBtn = $('panBtn');
  const gridBtn = $('gridBtn'), fsBtn = $('fsBtn');
  const chromeToggle = $('chromeToggle');

  let storageKey = opts.storageKey;
  let uiKey = storageKey + '_ui';

  // Fiecare traseu si fiecare obiect are un id unic, ca sa se poata imbina
  // modificarile venite de la alte device-uri fara sa se calce in picioare.
  const CLIENT_ID = Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
  let idSeq = 0;
  function newId() { return CLIENT_ID + '-' + (++idSeq); }
  let lang = resolveLanguage(opts.language, opts.hassLanguage);

  function t(key) {
    return (I18N[lang] && I18N[lang][key]) || I18N[DEFAULT_LANGUAGE][key] || key;
  }
  function applyI18n() {
    root.querySelectorAll('[data-i18n]').forEach(el => { el.textContent = t(el.dataset.i18n); });
    root.querySelectorAll('[data-i18n-title]').forEach(el => { el.title = t(el.dataset.i18nTitle); });
  }

  let color = '#111111';
  let size = 4;
  let tool = 'pen';           // 'pen' | 'eraser' | 'text' | 'pan' | 'emoji'
  let pendingEmoji = null;
  let selectedObj = null;

  // Panza este infinita: totul e tinut in coordonate "lume", nu in pixeli de ecran.
  let strokes = [];           // [{ color, size, pts: [x,y,x,y,...] }]
  let current = null;
  let legacy = null;          // imagine importata din versiunea veche (PNG)
  let showGrid = opts.grid !== false;

  let zoom = 1, panX = 0, panY = 0;
  const ZOOM_MIN = 0.05, ZOOM_MAX = 8;

  const history = [];
  const HISTORY_LIMIT = 40;

  let vw = 0, vh = 0, dpr = 1;
  let hovered = false;

  // --- gestionarea listenerilor, ca sa putem face curat la destroy ---
  const listeners = [];
  function on(target, type, fn, o) {
    target.addEventListener(type, fn, o);
    listeners.push(() => target.removeEventListener(type, fn, o));
  }

  /* ---------- Stare UI (butoane ascunse / hint / grila) ---------- */
  function readUI() {
    try { return JSON.parse(localStorage.getItem(uiKey) || 'null'); } catch (err) { return null; }
  }
  function saveUI() {
    try {
      localStorage.setItem(uiKey, JSON.stringify({
        chromeHidden: wb.classList.contains('chrome-hidden'),
        hintClosed: hint.classList.contains('gone'),
        showGrid: showGrid
      }));
    } catch (err) {}
  }
  function loadUI() {
    const ui = readUI();
    const hidden = ui ? !!ui.chromeHidden : !!opts.hideToolbar;
    wb.classList.toggle('chrome-hidden', hidden);
    if (ui && ui.hintClosed) hint.classList.add('gone');
    if (ui && typeof ui.showGrid === 'boolean') showGrid = ui.showGrid;
    syncChromeIcon();
    gridBtn.classList.toggle('active-tool', showGrid);
  }
  function syncChromeIcon() {
    chromeToggle.textContent = wb.classList.contains('chrome-hidden') ? '☰' : '✕';
  }
  function toggleChrome() {
    wb.classList.toggle('chrome-hidden');
    if (wb.classList.contains('chrome-hidden')) emojiPanel.classList.remove('open');
    syncChromeIcon();
    saveUI();
  }
  on(chromeToggle, 'click', toggleChrome);
  on($('hintClose'), 'click', () => { hint.classList.add('gone'); saveUI(); });

  // tastatura: doar cand cursorul e deasupra tablei (ca sa nu deranjam restul HA)
  // "hovered" decide daca tastele si lipirea din clipboard sunt pentru noi.
  // Pe touch nu exista mouseenter, deci luam in calcul si atingerea tablei:
  // altfel, pe telefon si tableta, Ctrl+V si tastele nu ar functiona niciodata.
  on(wb, 'mouseenter', () => { hovered = true; });
  on(wb, 'mouseleave', () => { hovered = false; });
  on(wb, 'pointerdown', () => { hovered = true; });
  on(wb, 'touchstart', () => { hovered = true; }, { passive: true });
  on(document, 'pointerdown', (e) => {
    const path = e.composedPath ? e.composedPath() : [];
    if (path.indexOf(wb) < 0) hovered = false;
  }, true);
  on(document, 'keydown', (e) => {
    if (!hovered) return;
    const t = e.composedPath ? e.composedPath()[0] : e.target;
    if (t && (t.isContentEditable || t.tagName === 'INPUT')) return;
    if (e.key === 'h' || e.key === 'H') { toggleChrome(); return; }
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') { e.preventDefault(); undo(); }
  });

  /* ---------- Unelte ---------- */
  EMOJIS.forEach(em => {
    const b = document.createElement('button');
    b.className = 'emoji-btn';
    b.textContent = em;
    b.addEventListener('click', () => {
      pendingEmoji = em;
      tool = 'emoji';
      setActiveToolButton(null);
      emojiPanel.classList.remove('open');
    });
    emojiPanel.appendChild(b);
  });

  function setActiveToolButton(activeBtn) {
    [penBtn, eraserBtn, textBtn, panBtn].forEach(b => b.classList.remove('active-tool'));
    if (activeBtn) activeBtn.classList.add('active-tool');
  }
  on(penBtn, 'click', () => { tool = 'pen'; setActiveToolButton(penBtn); deselect(); });
  on(eraserBtn, 'click', () => { tool = 'eraser'; setActiveToolButton(eraserBtn); deselect(); });
  on(textBtn, 'click', () => { tool = 'text'; setActiveToolButton(textBtn); deselect(); });
  on(panBtn, 'click', () => { tool = 'pan'; setActiveToolButton(panBtn); deselect(); });
  on($('emojiToggle'), 'click', () => emojiPanel.classList.toggle('open'));
  on($('syncBadge'), 'click', () => toast(t(shared ? 'syncShared' : 'syncLocal')));

  root.querySelectorAll('.swatch').forEach(sw => {
    on(sw, 'click', () => {
      root.querySelectorAll('.swatch').forEach(s => s.classList.remove('active'));
      sw.classList.add('active');
      color = sw.dataset.color;
      if (selectedObj && selectedObj.dataset.type === 'text') { selectedObj.style.color = color; saveSoon(); }
      else { tool = 'pen'; setActiveToolButton(penBtn); }
    });
  });
  on(customColor, 'input', () => {
    root.querySelectorAll('.swatch').forEach(s => s.classList.remove('active'));
    color = customColor.value;
    if (selectedObj && selectedObj.dataset.type === 'text') { selectedObj.style.color = color; saveSoon(); }
    else { tool = 'pen'; setActiveToolButton(penBtn); }
  });
  on(sizeSlider, 'input', () => {
    size = parseInt(sizeSlider.value, 10);
    brushPreview.style.width = Math.max(4, size) + 'px';
    brushPreview.style.height = Math.max(4, size) + 'px';
  });
  on(gridBtn, 'click', () => {
    showGrid = !showGrid;
    gridBtn.classList.toggle('active-tool', showGrid);
    saveUI();
    render();
  });
  on(fsBtn, 'click', () => {
    try {
      if (document.fullscreenElement) document.exitFullscreen();
      else if (wb.requestFullscreen) wb.requestFullscreen();
      else if (wb.webkitRequestFullscreen) wb.webkitRequestFullscreen();
    } catch (err) {}
  });

  /* ---------- Canvas / randare ---------- */
  function resizeCanvas() {
    dpr = window.devicePixelRatio || 1;
    const rect = wrap.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    vw = rect.width; vh = rect.height;
    canvas.width = Math.round(vw * dpr);
    canvas.height = Math.round(vh * dpr);
    render();
  }

  function worldTransform() {
    ctx.setTransform(dpr * zoom, 0, 0, dpr * zoom, dpr * panX, dpr * panY);
  }

  // Grila se deseneaza in coordonate de ecran (puncte mereu la fel de mari),
  // dar e ancorata in lume, deci se misca odata cu panza.
  function drawGrid() {
    if (!showGrid) return;
    let step = 40;
    while (step * zoom < 22) step *= 2;
    while (step * zoom > 90) step /= 2;
    const sp = step * zoom;
    const ox = ((panX % sp) + sp) % sp;
    const oy = ((panY % sp) + sp) % sp;
    const r = 2;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = '#ccd2dc';
    ctx.beginPath();
    for (let x = ox; x < vw; x += sp) {
      for (let y = oy; y < vh; y += sp) {
        ctx.rect(Math.round(x) - r / 2, Math.round(y) - r / 2, r, r);
      }
    }
    ctx.fill();
  }

  function drawStroke(s) {
    const p = s.pts;
    if (p.length < 2) return;
    ctx.strokeStyle = s.color;
    ctx.lineWidth = s.size;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(p[0], p[1]);
    if (p.length === 2) ctx.lineTo(p[0] + 0.01, p[1]);
    else for (let i = 2; i < p.length; i += 2) ctx.lineTo(p[i], p[i + 1]);
    ctx.stroke();
  }

  function render() {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    drawGrid();
    worldTransform();
    if (legacy && legacy.img && legacy.img.complete) ctx.drawImage(legacy.img, 0, 0, legacy.w, legacy.h);
    for (const s of strokes) drawStroke(s);
    if (current) drawStroke(current);
    zoomLabel.textContent = Math.round(zoom * 100) + '%';
  }

  let rafPending = false;
  function scheduleRender() {
    if (rafPending) return;
    rafPending = true;
    requestAnimationFrame(() => { rafPending = false; render(); });
  }

  function applyTransform() {
    objectLayer.style.transform = 'translate(' + panX + 'px,' + panY + 'px) scale(' + zoom + ')';
    scheduleRender();
  }

  /* ---------- Zoom / pan ---------- */
  function clampZoom(z) { return Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, z)); }

  function zoomAt(newZoom, mx, my) {
    newZoom = clampZoom(newZoom);
    const lx = (mx - panX) / zoom, ly = (my - panY) / zoom;
    panX = mx - newZoom * lx;
    panY = my - newZoom * ly;
    zoom = newZoom;
    applyTransform();
    saveViewSoon();
  }

  on($('zoomInBtn'), 'click', () => zoomAt(zoom * 1.25, vw / 2, vh / 2));
  on($('zoomOutBtn'), 'click', () => zoomAt(zoom / 1.25, vw / 2, vh / 2));
  on($('zoomResetBtn'), 'click', () => { zoom = 1; panX = 0; panY = 0; applyTransform(); saveViewSoon(); });

  on(wrap, 'wheel', (e) => {
    e.preventDefault();
    const r = wrap.getBoundingClientRect();
    if (e.ctrlKey || e.metaKey) {
      zoomAt(zoom * (e.deltaY < 0 ? 1.1 : 0.9), e.clientX - r.left, e.clientY - r.top);
    } else {
      if (e.shiftKey) panX -= e.deltaY;
      else { panX -= e.deltaX; panY -= e.deltaY; }
      applyTransform();
      saveViewSoon();
    }
  }, { passive: false });

  function toWorld(clientX, clientY) {
    const r = wrap.getBoundingClientRect();
    return { x: (clientX - r.left - panX) / zoom, y: (clientY - r.top - panY) / zoom };
  }

  /* ---------- Istoric ---------- */
  function pushHistory() {
    history.push({ strokes: strokes.slice(), objects: serializeObjects() });
    if (history.length > HISTORY_LIMIT) history.shift();
  }
  function undo() {
    const snap = history.pop();
    if (!snap) return;
    strokes = snap.strokes.slice();
    current = null;
    objectLayer.querySelectorAll('.obj').forEach(el => el.remove());
    selectedObj = null;
    snap.objects.forEach(buildObject);
    render();
    saveSoon();
  }
  on($('undoBtn'), 'click', undo);

  /* ---------- Desen ---------- */
  let drawing = false;

  function startDraw(clientX, clientY) {
    const p = toWorld(clientX, clientY);
    pushHistory();
    drawing = true;
    if (tool === 'eraser') { eraseAt(p.x, p.y); return; }
    current = { id: newId(), color: color, size: size, pts: [p.x, p.y] };
  }

  function moveDraw(clientX, clientY) {
    if (!drawing) return;
    const p = toWorld(clientX, clientY);
    if (tool === 'eraser') { eraseAt(p.x, p.y); return; }
    if (!current) return;
    const n = current.pts.length;
    const dx = p.x - current.pts[n - 2], dy = p.y - current.pts[n - 1];
    const min = 0.6 / zoom;
    if (dx * dx + dy * dy < min * min) return;
    current.pts.push(p.x, p.y);
    // desenam doar segmentul nou peste ce exista deja (rapid, fara redraw total)
    worldTransform();
    ctx.strokeStyle = current.color;
    ctx.lineWidth = current.size;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(current.pts[n - 2], current.pts[n - 1]);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
  }

  function endDraw() {
    if (!drawing) return;
    drawing = false;
    if (current) {
      if (current.pts.length >= 2) strokes.push(current);
      current = null;
      render();
    }
    saveSoon();
  }

  function distToSeg(px, py, x1, y1, x2, y2) {
    const dx = x2 - x1, dy = y2 - y1;
    const len2 = dx * dx + dy * dy;
    let t = len2 ? ((px - x1) * dx + (py - y1) * dy) / len2 : 0;
    t = Math.max(0, Math.min(1, t));
    return Math.hypot(px - (x1 + t * dx), py - (y1 + t * dy));
  }

  // Radiera taie traseele in bucati (fara "pete albe" pe panza infinita)
  function eraseAt(wx, wy) {
    const radius = Math.max(6, size * 2);
    let changed = false;
    const next = [];
    for (const s of strokes) {
      const lim = radius + s.size / 2;
      const p = s.pts;
      let hit = false;
      for (let i = 0; i < p.length - 2; i += 2) {
        if (distToSeg(wx, wy, p[i], p[i + 1], p[i + 2], p[i + 3]) <= lim) { hit = true; break; }
      }
      if (!hit && p.length === 2 && Math.hypot(wx - p[0], wy - p[1]) <= lim) hit = true;
      if (!hit) { next.push(s); continue; }
      changed = true;
      let run = [];
      for (let i = 0; i < p.length; i += 2) {
        if (Math.hypot(wx - p[i], wy - p[i + 1]) > lim) run.push(p[i], p[i + 1]);
        else { if (run.length >= 4) next.push({ id: newId(), color: s.color, size: s.size, pts: run }); run = []; }
      }
      if (run.length >= 4) next.push({ id: newId(), color: s.color, size: s.size, pts: run });
    }
    if (changed) { strokes = next; scheduleRender(); saveSoon(); }
  }

  /* ---------- Obiecte (emoji / text) ---------- */
  function deselect() {
    if (selectedObj) selectedObj.classList.remove('selected');
    selectedObj = null;
  }
  function selectObj(el) {
    if (selectedObj && selectedObj !== el) selectedObj.classList.remove('selected');
    selectedObj = el;
    el.classList.add('selected');
  }
  function objText(el) {
    const t = el.querySelector('.txt');
    return t ? t.textContent : '';
  }

  function buildObject(o) {
    const el = document.createElement('div');
    el.className = 'obj ' + o.type;
    el.dataset.type = o.type;
    el.dataset.id = o.id || newId();
    el.style.left = o.left + 'px';
    el.style.top = o.top + 'px';
    el.style.width = o.width + 'px';
    el.style.height = o.height + 'px';
    el.style.fontSize = o.fontSize + 'px';
    if (o.type === 'text') el.style.color = o.color || '#111';

    let txt = null;
    if (o.type === 'image') {
      const img = document.createElement('img');
      img.className = 'img';
      img.alt = '';
      img.draggable = false;
      img.src = o.src;
      el.appendChild(img);
      el.dataset.ratio = String(o.width / o.height);
    } else {
      txt = document.createElement('span');
      txt.className = 'txt';
      txt.textContent = o.content || '';
      if (o.type === 'text') txt.contentEditable = 'true';
      el.appendChild(txt);
    }

    const handle = document.createElement('div');
    handle.className = 'handle';
    el.appendChild(handle);
    const del = document.createElement('div');
    del.className = 'del-handle';
    del.textContent = '✕';
    el.appendChild(del);

    objectLayer.appendChild(el);
    attachObjEvents(el, handle, del, txt);
    return el;
  }

  function createObject(type, x, y, content) {
    pushHistory();
    const w = type === 'emoji' ? 44 : 130;
    const h = type === 'emoji' ? 44 : 40;
    const el = buildObject({
      type: type,
      left: x - w / 2, top: y - h / 2,
      width: w, height: h,
      fontSize: type === 'emoji' ? Math.round(h * 0.8) : 20,
      color: color,
      content: content || ''
    });
    selectObj(el);
    if (type === 'text') requestAnimationFrame(() => focusText(el));
    saveSoon();
    return el;
  }

  /* ---------- Imagini / stickere ---------- */
  const MAX_IMG_DIM = 1000;     // latura maxima pastrata, in pixeli
  const JPEG_QUALITY = 0.82;
  const PLACED_MAX = 320;       // latimea maxima la asezarea pe tabla, in unitati "lume"

  // Nu filtram fisierele dupa MIME type sau extensie: galeriile Android trimit adesea
  // content URI-uri fara type si fara extensie in nume. Incercam sa decodam orice, iar
  // daca nu se poate, spunem asta explicit.
  function isHeic(file) {
    const type = (file && file.type) || '';
    const name = (file && file.name) || '';
    return /hei[cf]/i.test(type) || /\.hei[cf]$/i.test(name);
  }

  function addImageFiles(files, x, y) {
    const all = Array.from(files || []);
    if (!all.length) return;
    // Confirmare imediata: pe telefon, decodarea unei poze mari dureaza secunde,
    // iar fara asta nu se poate spune daca fisierul a fost primit sau nu.
    toast(t('imageLoading'), 15000);
    all.forEach((file, i) => {
      decodeImage(file)
        .then(res => {
          placeImage(res.src, res.w, res.h, x + i * 18, y + i * 18);
          hideToast();
        })
        .catch(err => {
          const info = (file && file.name ? file.name : '?') +
            ' · ' + ((file && file.type) || 'fara tip') +
            ' · ' + Math.round(((file && file.size) || 0) / 1024) + ' kB';
          console.warn('[whiteboard] nu am putut incarca imaginea', info, err);
          let message;
          if (isHeic(file)) message = t('heicUnsupported');
          else if (err && err.message === 'read') message = t('readFailed');
          else message = t('imageFailed') + ' — ' + info;
          toast(message, 12000);
        });
    });
  }

  // Decodarea escaladeaza in trei trepte, ca sa acopere si telefoanele:
  //   1. createImageBitmap — codecurile sistemului (HEIC de pe iPhone, HEIF de pe Samsung)
  //   2. acelasi, dar cu redimensionare la decodare — pentru poze de zeci de megapixeli,
  //      unde decodarea la marime intreaga da out-of-memory pe mobil
  //   3. FileReader + <img> — pentru browsere fara createImageBitmap
  function decodeImage(file) {
    return new Promise((resolve, reject) => {
      const finish = (source, w, h) => {
        if (!w || !h) { reject(new Error('decode')); return; }
        let out = null;
        try { out = shrink(source, w, h); } catch (err) { reject(new Error('decode')); return; }
        if (source.close) source.close();
        resolve(out);
      };
      const viaReader = () => {
        const reader = new FileReader();
        reader.onload = () => {
          const img = new Image();
          img.onload = () => finish(img, img.naturalWidth, img.naturalHeight);
          img.onerror = () => reject(new Error('decode'));
          img.src = reader.result;
        };
        reader.onerror = () => reject(new Error('read'));
        reader.readAsDataURL(file);
      };
      const viaResizedBitmap = () => {
        createImageBitmap(file, { resizeWidth: MAX_IMG_DIM, resizeQuality: 'high' })
          .then(bmp => finish(bmp, bmp.width, bmp.height))
          .catch(viaReader);
      };
      if (typeof createImageBitmap === 'function') {
        // Peste ~2.5 MB e aproape sigur o poza de telefon de zeci de megapixeli:
        // decodarea la marime intreaga poate depasi memoria, deci o sarim.
        if (file && file.size > 2.5 * 1024 * 1024) {
          viaResizedBitmap();
        } else {
          createImageBitmap(file)
            .then(bmp => finish(bmp, bmp.width, bmp.height))
            .catch(viaResizedBitmap);
        }
      } else {
        viaReader();
      }
    });
  }

  // Micsoram inainte de salvare: localStorage are ~5 MB, o poza de telefon are mult mai mult.
  function shrink(source, natW, natH) {
    const scale = Math.min(1, MAX_IMG_DIM / Math.max(natW, natH));
    const tw = Math.max(1, Math.round(natW * scale));
    const th = Math.max(1, Math.round(natH * scale));
    const c = document.createElement('canvas');
    c.width = tw; c.height = th;
    const cc = c.getContext('2d');
    cc.drawImage(source, 0, 0, tw, th);
    // JPEG pierde transparenta, deci pastram PNG doar cand chiar e nevoie (stickere decupate)
    let transparent = false;
    try {
      const d = cc.getImageData(0, 0, tw, th).data;
      for (let i = 3; i < d.length; i += 40) { if (d[i] < 250) { transparent = true; break; } }
    } catch (err) { transparent = true; }
    return {
      src: transparent ? c.toDataURL('image/png') : c.toDataURL('image/jpeg', JPEG_QUALITY),
      w: tw,
      h: th
    };
  }

  function placeImage(src, natW, natH, x, y) {
    pushHistory();
    const scale = Math.min(1, PLACED_MAX / Math.max(natW, natH));
    const w = Math.max(24, Math.round(natW * scale));
    const h = Math.max(24, Math.round(natH * scale));
    const el = buildObject({
      type: 'image',
      left: x - w / 2, top: y - h / 2,
      width: w, height: h,
      fontSize: 20,
      src: src
    });
    selectObj(el);
    saveSoon();
    return el;
  }

  function viewCenter() {
    return { x: (vw / 2 - panX) / zoom, y: (vh / 2 - panY) / zoom };
  }

  const fileInput = $('fileInput');

  // Pe unele webview-uri Android evenimentul "change" nu mai ajunge dupa ce
  // selectorul de fisiere se inchide, desi fisierul chiar e in input. Verificam
  // deci si cand pagina redevine vizibila, si ne ferim sa punem aceeasi poza de
  // doua ori printr-o semnatura a selectiei.
  let lastPicked = '';
  let clearTimer = null;
  function handlePickedFiles() {
    const files = fileInput.files;
    if (!files || !files.length) return;
    const token = Array.from(files)
      .map(f => f.name + ':' + f.size + ':' + (f.lastModified || 0)).join('|');
    if (token === lastPicked) return;
    lastPicked = token;
    const c = viewCenter();
    addImageFiles(files, c.x, c.y);
    clearTimeout(clearTimer);
    clearTimer = setTimeout(() => {
      try { fileInput.value = ''; } catch (err) {}
      lastPicked = '';
    }, 2000);
  }
  on(fileInput, 'change', handlePickedFiles);
  on(fileInput, 'input', handlePickedFiles);
  on(document, 'visibilitychange', () => {
    if (!document.hidden) setTimeout(handlePickedFiles, 300);
  });
  on(window, 'focus', () => setTimeout(handlePickedFiles, 300));

  // Lipire din clipboard (Ctrl+V / cmd+V), doar cand tabla e sub cursor
  on(document, 'paste', (e) => {
    if (!hovered) return;
    const items = (e.clipboardData && e.clipboardData.items) || [];
    const files = [];
    for (const it of items) {
      if (it.kind === 'file' && /^image\//.test(it.type)) {
        const f = it.getAsFile();
        if (f) files.push(f);
      }
    }
    if (!files.length) return;
    e.preventDefault();
    const c = viewCenter();
    addImageFiles(files, c.x, c.y);
  });

  // Drag & drop de pe desktop
  const dropHint = $('dropHint');
  let dragDepth = 0;
  on(wb, 'dragenter', (e) => {
    if (!e.dataTransfer || Array.from(e.dataTransfer.types || []).indexOf('Files') < 0) return;
    e.preventDefault();
    dragDepth++;
    dropHint.classList.add('show');
  });
  on(wb, 'dragover', (e) => {
    if (!e.dataTransfer || Array.from(e.dataTransfer.types || []).indexOf('Files') < 0) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  });
  on(wb, 'dragleave', () => {
    dragDepth = Math.max(0, dragDepth - 1);
    if (!dragDepth) dropHint.classList.remove('show');
  });
  on(wb, 'drop', (e) => {
    if (!e.dataTransfer || !e.dataTransfer.files || !e.dataTransfer.files.length) return;
    e.preventDefault();
    dragDepth = 0;
    dropHint.classList.remove('show');
    const p = toWorld(e.clientX, e.clientY);
    addImageFiles(e.dataTransfer.files, p.x, p.y);
  });

  function focusText(el) {
    const txt = el.querySelector('.txt');
    if (!txt) return;
    txt.focus();
    try {
      const sel = root.getSelection ? root.getSelection() : document.getSelection();
      const range = document.createRange();
      range.selectNodeContents(txt);
      sel.removeAllRanges();
      sel.addRange(range);
    } catch (err) {}
  }

  // O singura stare de drag pentru toate obiectele (fara listeneri per obiect)
  let drag = null;

  function attachObjEvents(el, handle, del, txt) {
    function down(e) {
      const t = e.touches ? e.touches[0] : e;
      selectObj(el);
      drag = {
        el: el,
        mode: (e.target === handle) ? 'resize' : 'move',
        sx: t.clientX, sy: t.clientY,
        left: parseFloat(el.style.left), top: parseFloat(el.style.top),
        w: parseFloat(el.style.width), h: parseFloat(el.style.height),
        moved: false
      };
      e.stopPropagation();
      e.preventDefault();
    }
    el.addEventListener('mousedown', down);
    el.addEventListener('touchstart', down, { passive: false });

    del.addEventListener('mousedown', (e) => e.stopPropagation());
    del.addEventListener('click', (e) => {
      e.stopPropagation();
      pushHistory();
      el.remove();
      if (selectedObj === el) selectedObj = null;
      drag = null;
      saveSoon();
    });
    el.addEventListener('dblclick', () => { if (el.dataset.type === 'text') focusText(el); });
    if (txt) txt.addEventListener('blur', () => saveSoon());
  }

  function dragMove(clientX, clientY) {
    if (!drag) return;
    if (!drag.moved) { drag.moved = true; pushHistory(); }
    const el = drag.el;
    const dx = (clientX - drag.sx) / zoom;
    const dy = (clientY - drag.sy) / zoom;
    if (drag.mode === 'move') {
      el.style.left = (drag.left + dx) + 'px';
      el.style.top = (drag.top + dy) + 'px';
    } else if (el.dataset.type === 'image') {
      // imaginile isi pastreaza proportiile
      const ratio = parseFloat(el.dataset.ratio) || (drag.w / drag.h);
      const nw = Math.max(24, drag.w + dx);
      el.style.width = nw + 'px';
      el.style.height = Math.max(24, nw / ratio) + 'px';
    } else {
      const nw = Math.max(20, drag.w + dx);
      const nh = Math.max(20, drag.h + dy);
      el.style.width = nw + 'px';
      el.style.height = nh + 'px';
      el.style.fontSize = (el.dataset.type === 'emoji'
        ? Math.round(Math.min(nw, nh) * 0.8)
        : Math.round(nh * 0.5)) + 'px';
    }
  }
  function dragEnd() {
    if (!drag) return;
    if (drag.moved) saveSoon();
    drag = null;
  }

  /* ---------- Rutarea pointerului ---------- */
  let panning = false, panStartX = 0, panStartY = 0, panOrigX = 0, panOrigY = 0;
  const activeTouches = new Map();
  let pinchStartDist = 0, pinchStartZoom = 1, pinchWorld = null;

  const midpoint = (a, b) => ({ x: (a.clientX + b.clientX) / 2, y: (a.clientY + b.clientY) / 2 });
  const dist = (a, b) => Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);

  on(canvas, 'mousedown', (e) => {
    if (tool === 'pan' || e.button === 1 || e.button === 2) {
      panning = true;
      panStartX = e.clientX; panStartY = e.clientY;
      panOrigX = panX; panOrigY = panY;
      e.preventDefault();
      return;
    }
    if (tool === 'emoji' && pendingEmoji) {
      const p = toWorld(e.clientX, e.clientY);
      createObject('emoji', p.x, p.y, pendingEmoji);
      return;
    }
    if (tool === 'text') {
      const p = toWorld(e.clientX, e.clientY);
      createObject('text', p.x, p.y, '');
      return;
    }
    deselect();
    startDraw(e.clientX, e.clientY);
  });
  on(canvas, 'contextmenu', (e) => e.preventDefault());

  on(document, 'mousemove', (e) => {
    if (drag) { dragMove(e.clientX, e.clientY); return; }
    if (panning) {
      panX = panOrigX + (e.clientX - panStartX);
      panY = panOrigY + (e.clientY - panStartY);
      applyTransform();
      return;
    }
    if (drawing) moveDraw(e.clientX, e.clientY);
  });
  on(document, 'mouseup', () => {
    if (drag) { dragEnd(); return; }
    if (panning) { panning = false; saveViewSoon(); }
    endDraw();
  });

  on(canvas, 'touchstart', (e) => {
    for (const t of e.changedTouches) activeTouches.set(t.identifier, t);
    if (activeTouches.size === 2) {
      // doua degete = mutare + zoom simultan, indiferent de unealta
      drawing = false; current = null; panning = false;
      const pts = Array.from(activeTouches.values());
      const r = wrap.getBoundingClientRect();
      const mid = midpoint(pts[0], pts[1]);
      pinchStartDist = dist(pts[0], pts[1]) || 1;
      pinchStartZoom = zoom;
      pinchWorld = { x: (mid.x - r.left - panX) / zoom, y: (mid.y - r.top - panY) / zoom };
      render();
      e.preventDefault();
      return;
    }
    if (activeTouches.size === 1) {
      const t = e.touches[0];
      if (tool === 'pan') {
        panning = true; panStartX = t.clientX; panStartY = t.clientY;
        panOrigX = panX; panOrigY = panY;
      } else if (tool === 'emoji' && pendingEmoji) {
        const p = toWorld(t.clientX, t.clientY);
        createObject('emoji', p.x, p.y, pendingEmoji);
      } else if (tool === 'text') {
        const p = toWorld(t.clientX, t.clientY);
        createObject('text', p.x, p.y, '');
      } else {
        deselect();
        startDraw(t.clientX, t.clientY);
      }
    }
    e.preventDefault();
  }, { passive: false });

  on(canvas, 'touchmove', (e) => {
    for (const t of e.changedTouches) if (activeTouches.has(t.identifier)) activeTouches.set(t.identifier, t);
    if (activeTouches.size === 2 && pinchWorld) {
      const pts = Array.from(activeTouches.values());
      const r = wrap.getBoundingClientRect();
      const mid = midpoint(pts[0], pts[1]);
      zoom = clampZoom(pinchStartZoom * (dist(pts[0], pts[1]) / pinchStartDist));
      panX = (mid.x - r.left) - pinchWorld.x * zoom;
      panY = (mid.y - r.top) - pinchWorld.y * zoom;
      applyTransform();
      e.preventDefault();
      return;
    }
    if (panning) {
      const t = e.touches[0];
      panX = panOrigX + (t.clientX - panStartX);
      panY = panOrigY + (t.clientY - panStartY);
      applyTransform();
    } else if (drawing) {
      moveDraw(e.touches[0].clientX, e.touches[0].clientY);
    }
    e.preventDefault();
  }, { passive: false });

  on(canvas, 'touchend', (e) => {
    for (const t of e.changedTouches) activeTouches.delete(t.identifier);
    if (activeTouches.size < 2) { pinchStartDist = 0; pinchWorld = null; saveViewSoon(); }
    if (activeTouches.size === 0) {
      if (panning) { panning = false; saveViewSoon(); }
      endDraw();
    }
  });

  // mutarea/redimensionarea obiectelor pe touch (obiectele opresc propagarea spre canvas)
  on(document, 'touchmove', (e) => {
    if (!drag) return;
    const t = e.touches[0];
    if (!t) return;
    dragMove(t.clientX, t.clientY);
    e.preventDefault();
  }, { passive: false });
  on(document, 'touchend', () => { if (drag) dragEnd(); });

  /* ---------- Sterge / export ---------- */
  on($('clearBtn'), 'click', () => {
    pushHistory();
    strokes = [];
    current = null;
    legacy = null;
    objectLayer.querySelectorAll('.obj').forEach(el => el.remove());
    selectedObj = null;
    render();
    saveSoon();
  });

  function contentBounds() {
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const s of strokes) {
      const m = s.size / 2;
      for (let i = 0; i < s.pts.length; i += 2) {
        if (s.pts[i] - m < minX) minX = s.pts[i] - m;
        if (s.pts[i] + m > maxX) maxX = s.pts[i] + m;
        if (s.pts[i + 1] - m < minY) minY = s.pts[i + 1] - m;
        if (s.pts[i + 1] + m > maxY) maxY = s.pts[i + 1] + m;
      }
    }
    objectLayer.querySelectorAll('.obj').forEach(el => {
      const x = parseFloat(el.style.left), y = parseFloat(el.style.top);
      const w = parseFloat(el.style.width), h = parseFloat(el.style.height);
      minX = Math.min(minX, x); minY = Math.min(minY, y);
      maxX = Math.max(maxX, x + w); maxY = Math.max(maxY, y + h);
    });
    if (legacy) {
      minX = Math.min(minX, 0); minY = Math.min(minY, 0);
      maxX = Math.max(maxX, legacy.w); maxY = Math.max(maxY, legacy.h);
    }
    if (!isFinite(minX)) return { x: -panX / zoom, y: -panY / zoom, w: vw / zoom, h: vh / zoom };
    const pad = 40;
    return { x: minX - pad, y: minY - pad, w: (maxX - minX) + pad * 2, h: (maxY - minY) + pad * 2 };
  }

  on($('saveBtn'), 'click', () => {
    const b = contentBounds();
    const scale = Math.min(2, Math.max(1, 2400 / Math.max(b.w, b.h)));
    const tmp = document.createElement('canvas');
    tmp.width = Math.max(1, Math.round(b.w * scale));
    tmp.height = Math.max(1, Math.round(b.h * scale));
    const ec = tmp.getContext('2d');
    ec.fillStyle = '#ffffff';
    ec.fillRect(0, 0, tmp.width, tmp.height);
    ec.setTransform(scale, 0, 0, scale, -b.x * scale, -b.y * scale);
    if (legacy && legacy.img) ec.drawImage(legacy.img, 0, 0, legacy.w, legacy.h);
    for (const s of strokes) {
      if (s.pts.length < 2) continue;
      ec.strokeStyle = s.color; ec.lineWidth = s.size;
      ec.lineCap = 'round'; ec.lineJoin = 'round';
      ec.beginPath();
      ec.moveTo(s.pts[0], s.pts[1]);
      for (let i = 2; i < s.pts.length; i += 2) ec.lineTo(s.pts[i], s.pts[i + 1]);
      ec.stroke();
    }
    objectLayer.querySelectorAll('.obj').forEach(el => {
      const x = parseFloat(el.style.left), y = parseFloat(el.style.top);
      const w = parseFloat(el.style.width), h = parseFloat(el.style.height);
      const fs = parseFloat(el.style.fontSize) || 20;
      if (el.dataset.type === 'image') {
        const img = el.querySelector('img');
        if (img && img.complete && img.naturalWidth) {
          try { ec.drawImage(img, x, y, w, h); } catch (err) {}
        }
        return;
      }
      if (el.dataset.type === 'emoji') {
        ec.font = fs + 'px sans-serif';
        ec.textAlign = 'center'; ec.textBaseline = 'middle';
        ec.fillStyle = '#111';
        ec.fillText(objText(el), x + w / 2, y + h / 2);
      } else {
        ec.font = fs + 'px -apple-system, sans-serif';
        ec.fillStyle = el.style.color || '#111';
        ec.textAlign = 'center'; ec.textBaseline = 'middle';
        ec.fillText(objText(el), x + w / 2, y + h / 2);
      }
    });
    const name = 'whiteboard-' + new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-') + '.png';
    exportPng(tmp.toDataURL('image/png'), name);
  });

  // Exportul difera dupa context: in cardul iframe al HA descarcarile sunt blocate
  // (sandbox-ul nu are allow-downloads), asa ca deschidem imaginea intr-o fila noua.
  function exportPng(url, name) {
    let inFrame = false;
    try { inFrame = window.self !== window.top; } catch (err) { inFrame = true; }

    if (inFrame) {
      const w = window.open('', '_blank');
      if (!w) { flashSave('⚠️', t('popupBlocked')); return; }
      w.document.write(
        '<!DOCTYPE html><title>' + name + '</title>' +
        '<body style="margin:0;background:#1b1d21;display:flex;align-items:center;justify-content:center">' +
        '<img src="' + url + '" alt="' + name + '" style="max-width:100%;max-height:100vh;background:#fff">'
      );
      w.document.close();
      flashSave('✓', t('openedInTab'));
      return;
    }

    const link = document.createElement('a');
    link.download = name;
    link.href = url;
    link.click();
    flashSave('✓', '');
  }

  let flashTimer = null;
  function flashSave(mark, message) {
    const btn = $('saveBtn');
    const original = '💾';
    btn.textContent = mark;
    clearTimeout(flashTimer);
    flashTimer = setTimeout(() => { btn.textContent = original; }, 1600);
    if (message) toast(message);
  }

  function hideToast() {
    const el = root.getElementById('toast');
    if (el) el.classList.remove('show');
    clearTimeout(toastTimer);
  }

  let toastTimer = null;
  function toast(message, ms) {
    let el = root.getElementById('toast');
    if (!el) {
      el = document.createElement('div');
      el.className = 'toast';
      el.id = 'toast';
      wb.appendChild(el);
    }
    el.textContent = message;
    el.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('show'), ms || 4000);
  }

  /* ---------- Persistenta ---------- */
  function serializeObjects() {
    return Array.from(objectLayer.querySelectorAll('.obj')).map(el => {
      const o = {
        id: el.dataset.id,
        type: el.dataset.type,
        left: parseFloat(el.style.left),
        top: parseFloat(el.style.top),
        width: parseFloat(el.style.width),
        height: parseFloat(el.style.height),
        fontSize: parseFloat(el.style.fontSize) || 20,
        color: el.style.color || null,
        content: objText(el)
      };
      if (el.dataset.type === 'image') {
        const img = el.querySelector('img');
        o.src = img ? img.getAttribute('src') : '';
      }
      return o;
    });
  }

  let saveTimer = null;
  function saveSoon() {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(doSave, 400);
  }
  function saveViewSoon() {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(doSave, 800);
  }
  let quotaWarned = false;

  function doSave() {
    // Vederea (zoom/pan) ramane mereu locala: fiecare device se uita unde vrea.
    saveView();
    if (shared) { pushDelta(); return; }
    try {
      localStorage.setItem(storageKey, JSON.stringify({
        strokes: strokes.map(s => ({ i: s.id, c: s.color, w: s.size, p: s.pts.map(n => Math.round(n * 10) / 10) })),
        objects: serializeObjects(),
        view: { zoom: zoom, panX: panX, panY: panY },
        legacy: legacy ? { src: legacy.src, w: legacy.w, h: legacy.h } : null
      }));
      quotaWarned = false;
    } catch (err) {
      // cel mai probabil QuotaExceededError, de la prea multe imagini
      if (!quotaWarned) { quotaWarned = true; toast(t('storageFull')); }
    }
  }

  function saveView() {
    if (!shared) return;
    try {
      localStorage.setItem(storageKey + '_view',
        JSON.stringify({ zoom: zoom, panX: panX, panY: panY }));
    } catch (err) {}
  }
  function loadView() {
    try {
      const v = JSON.parse(localStorage.getItem(storageKey + '_view') || 'null');
      if (v) { zoom = clampZoom(v.zoom || 1); panX = v.panX || 0; panY = v.panY || 0; }
    } catch (err) {}
  }

  /* ============================================================
   *  Tabla partajata (integrarea ha_whiteboard)
   *
   *  Daca integrarea e instalata, tabla se tine pe serverul Home Assistant si
   *  e aceeasi pentru toti utilizatorii. Trimitem doar ce s-a schimbat, iar
   *  imbinarea se face pe id, deci doi oameni pot desena in acelasi timp.
   *  Fara integrare, totul ramane exact ca inainte, in localStorage.
   * ============================================================ */
  let hass = null;
  let shared = false;          // integrarea raspunde, tabla e pe server
  let sharedTried = false;
  let unsubscribe = null;
  let serverRev = 0;
  let pending = [];            // evenimente sosite inainte de snapshot
  let syncing = false;
  let applyingRemote = false;
  let flushTimer = null;
  let localCopyStale = false;   // copia locala trebuie stearsa dupa prima urcare pe server
  // id -> semnatura ultimei versiuni trimise la server ('S' pentru trasee, care nu se schimba)
  let sent = new Map();

  function objSignature(o) {
    return [o.type, o.left, o.top, o.width, o.height, o.fontSize, o.color, o.content].join('|');
  }
  function encodeStroke(s) {
    return { id: s.id, c: s.color, w: s.size, p: s.pts.map(n => Math.round(n * 10) / 10) };
  }
  function decodeStroke(s) {
    return { id: s.id, color: s.c, size: s.w, pts: s.p };
  }

  function markSynced() {
    sent = new Map();
    for (const s of strokes) sent.set(s.id, 'S');
    for (const o of serializeObjects()) sent.set(o.id, objSignature(o));
  }

  function buildDelta() {
    const alive = new Set();
    const addStrokes = [];
    const upsertObjects = [];
    for (const s of strokes) {
      alive.add(s.id);
      if (!sent.has(s.id)) addStrokes.push(encodeStroke(s));
    }
    for (const o of serializeObjects()) {
      alive.add(o.id);
      if (sent.get(o.id) !== objSignature(o)) upsertObjects.push(o);
    }
    const remove = [];
    sent.forEach((_, id) => { if (!alive.has(id)) remove.push(id); });
    if (!addStrokes.length && !upsertObjects.length && !remove.length) return null;
    return { strokes: addStrokes, objects: upsertObjects, remove: remove };
  }

  function pushDelta() {
    if (!shared || applyingRemote) return;
    clearTimeout(flushTimer);
    flushTimer = setTimeout(flushDelta, 300);
  }

  function flushDelta() {
    if (!shared || syncing) return;
    const delta = buildDelta();
    if (!delta) return;
    syncing = true;
    hass.callWS(Object.assign({
      type: 'ha_whiteboard/apply',
      key: storageKey,
      client_id: CLIENT_ID
    }, delta)).then(res => {
      syncing = false;
      if (res && res.rev) serverRev = res.rev;
      markSynced();
      dropLocalCopy();
      // ceva s-a mai schimbat cat timp trimiteam
      if (buildDelta()) pushDelta();
    }).catch(err => {
      syncing = false;
      if (err && err.code === 'too_large') toast(t('storageFull'));
      else console.warn('[whiteboard] nu am putut trimite modificarea', err);
    });
  }

  // Dupa ce continutul local a ajuns pe server, stergem copia din localStorage.
  // Altfel, un traseu sters de altcineva ar reveni la fiecare reincarcare a paginii.
  function dropLocalCopy() {
    if (!localCopyStale) return;
    localCopyStale = false;
    try { localStorage.removeItem(storageKey); } catch (err) {}
  }

  function findObjById(id) {
    return objectLayer.querySelector('.obj[data-id="' + id + '"]');
  }

  function applyRemote(payload) {
    if (!payload || payload.client_id === CLIENT_ID) return;
    if (payload.rev && payload.rev <= serverRev) return;
    applyingRemote = true;

    if (payload.clear) {
      strokes = [];
      objectLayer.querySelectorAll('.obj').forEach(el => el.remove());
      selectedObj = null;
    }
    const removed = payload.remove || [];
    if (removed.length) {
      const gone = new Set(removed);
      strokes = strokes.filter(s => !gone.has(s.id));
      gone.forEach(id => {
        const el = findObjById(id);
        if (el && (!drag || drag.el !== el)) {
          if (selectedObj === el) selectedObj = null;
          el.remove();
        }
      });
    }
    (payload.strokes || []).forEach(raw => {
      if (!strokes.some(s => s.id === raw.id)) strokes.push(decodeStroke(raw));
    });
    (payload.objects || []).forEach(o => {
      const el = findObjById(o.id);
      if (el && drag && drag.el === el) return;   // nu smulgem obiectul din mana cuiva
      if (el) el.remove();
      if (selectedObj && el === selectedObj) selectedObj = null;
      buildObject(o);
    });

    if (payload.rev) serverRev = payload.rev;
    render();
    markSynced();
    applyingRemote = false;
  }

  function updateSyncBadge() {
    const badge = $('syncBadge');
    if (!badge) return;
    badge.textContent = shared ? '☁️' : '🖥️';
    badge.title = t(shared ? 'syncShared' : 'syncLocal');
    badge.dataset.i18nTitle = shared ? 'syncShared' : 'syncLocal';
  }

  function stopSharing() {
    if (unsubscribe) { try { unsubscribe(); } catch (err) {} }
    unsubscribe = null;
    shared = false;
    sharedTried = false;
    serverRev = 0;
    pending = [];
    updateSyncBadge();
  }

  function startSharing() {
    if (!hass || !hass.connection || sharedTried) return;
    sharedTried = true;
    pending = [];
    // Ne abonam intai si punem deoparte ce vine, ca sa nu pierdem modificarile
    // facute intre abonare si incarcarea tablei.
    hass.connection.subscribeMessage(
      msg => { if (shared) applyRemote(msg); else pending.push(msg); },
      { type: 'ha_whiteboard/subscribe', key: storageKey }
    ).then(unsub => {
      unsubscribe = unsub;
      return hass.callWS({ type: 'ha_whiteboard/get', key: storageKey });
    }).then(snapshot => {
      adoptSnapshot(snapshot);
      shared = true;
      pending.forEach(applyRemote);
      pending = [];
      // ce era deja desenat local, pe un browser care tocmai a primit integrarea,
      // se urca pe server in loc sa dispara
      localCopyStale = true;
      if (buildDelta()) pushDelta(); else dropLocalCopy();
      updateSyncBadge();
      console.info('[whiteboard] tabla partajata este activa, cheia "' + storageKey + '"');
    }).catch(err => {
      // integrarea nu e instalata (sau nu raspunde): ramanem pe localStorage
      stopSharing();
      sharedTried = true;
      updateSyncBadge();
      console.info('[whiteboard] tabla ramane locala in acest browser. ' +
        'Instaleaza integrarea "Whiteboard" pentru o tabla comuna. Motiv:',
        (err && (err.message || err.code)) || err);
    });
  }

  function adoptSnapshot(snapshot) {
    if (!snapshot) return;
    serverRev = snapshot.rev || 0;
    const localStrokes = strokes.slice();
    const localObjects = serializeObjects();

    strokes = (snapshot.strokes || []).map(decodeStroke);
    objectLayer.querySelectorAll('.obj').forEach(el => el.remove());
    selectedObj = null;
    (snapshot.objects || []).forEach(buildObject);
    markSynced();

    // pastram ce era local si nu exista pe server (prima pornire dupa instalare)
    localStrokes.forEach(s => { if (!sent.has(s.id)) strokes.push(s); });
    localObjects.forEach(o => { if (!sent.has(o.id)) buildObject(o); });

    history.length = 0;
    loadView();
    applyTransform();
    render();
  }

  function setHass(next) {
    const first = !hass;
    hass = next;
    if (first || !sharedTried) startSharing();
  }

  function loadLegacyImage(src, w, h) {
    const img = new Image();
    img.onload = () => {
      legacy = {
        src: src,
        w: w || img.naturalWidth / (window.devicePixelRatio || 1),
        h: h || img.naturalHeight / (window.devicePixelRatio || 1),
        img: img
      };
      render();
    };
    img.src = src;
  }

  function restore() {
    strokes = [];
    legacy = null;
    objectLayer.querySelectorAll('.obj').forEach(el => el.remove());
    selectedObj = null;
    history.length = 0;
    zoom = 1; panX = 0; panY = 0;

    let data = null;
    try { data = JSON.parse(localStorage.getItem(storageKey) || 'null'); } catch (err) {}

    if (!data) {
      // migrare din versiunea veche (panza fixa, salvata ca PNG)
      if (storageKey === DEFAULT_KEY) {
        let old = null;
        try { old = JSON.parse(localStorage.getItem(LEGACY_KEY) || 'null'); } catch (err) {}
        if (old) {
          if (old.png) loadLegacyImage(old.png, null, null);
          (old.objects || []).forEach(o => buildObject({
            type: o.type,
            left: parseFloat(o.left) || 0,
            top: parseFloat(o.top) || 0,
            width: parseFloat(o.width) || 44,
            height: parseFloat(o.height) || 44,
            fontSize: parseFloat(o.fontSize) || 20,
            color: o.color,
            content: o.content
          }));
          saveSoon();
        }
      }
      return;
    }

    strokes = (data.strokes || []).map(s => ({ id: s.i || newId(), color: s.c, size: s.w, pts: s.p }));
    (data.objects || []).forEach(buildObject);
    if (data.legacy && data.legacy.src) loadLegacyImage(data.legacy.src, data.legacy.w, data.legacy.h);
    if (data.view) {
      zoom = clampZoom(data.view.zoom || 1);
      panX = data.view.panX || 0;
      panY = data.view.panY || 0;
    }
  }

  /* ---------- Start ---------- */
  const ro = ('ResizeObserver' in window) ? new ResizeObserver(() => resizeCanvas()) : null;
  if (ro) ro.observe(wrap); else on(window, 'resize', resizeCanvas);
  on(document, 'fullscreenchange', () => requestAnimationFrame(resizeCanvas));

  applyI18n();
  updateSyncBadge();
  loadUI();
  restore();
  resizeCanvas();
  applyTransform();
  brushPreview.style.width = size + 'px';
  brushPreview.style.height = size + 'px';

  return {
    setOptions(next) {
      next = next || {};
      const nextLang = resolveLanguage(
        next.language !== undefined ? next.language : opts.language,
        next.hassLanguage !== undefined ? next.hassLanguage : opts.hassLanguage
      );
      if (nextLang !== lang) {
        lang = nextLang;
        opts.language = next.language !== undefined ? next.language : opts.language;
        opts.hassLanguage = next.hassLanguage !== undefined ? next.hassLanguage : opts.hassLanguage;
        applyI18n();
      }
      if (next.storageKey && next.storageKey !== storageKey) {
        stopSharing();
        storageKey = next.storageKey;
        uiKey = storageKey + '_ui';
        opts.storageKey = storageKey;
        loadUI();
        restore();
        startSharing();
        applyTransform();
        render();
      }
      if (typeof next.hideToolbar === 'boolean' && !readUI()) {
        wb.classList.toggle('chrome-hidden', next.hideToolbar);
        syncChromeIcon();
      }
      if (typeof next.grid === 'boolean' && !readUI()) {
        showGrid = next.grid;
        gridBtn.classList.toggle('active-tool', showGrid);
        render();
      }
    },
    setHass: setHass,
    refresh: resizeCanvas,
    destroy() {
      clearTimeout(saveTimer);
      clearTimeout(flushTimer);
      stopSharing();
      if (ro) ro.disconnect();
      listeners.forEach(off => off());
      listeners.length = 0;
    }
  };
}

/* ============================================================
 *  <whiteboard-board> — tabla ca element de sine statator
 * ============================================================ */
class WhiteboardBoard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._opts = {};
  }
  connectedCallback() {
    if (this._api) { this._api.refresh(); return; }
    // asteptam un microtask: parintele poate seta `options` imediat dupa inserare
    queueMicrotask(() => {
      if (!this.isConnected || this._api) return;
      this._api = createWhiteboard(this.shadowRoot, this._opts);
      if (this._hass) this._api.setHass(this._hass);
    });
  }
  disconnectedCallback() {
    // Lovelace muta cardurile prin DOM; nu distrugem imediat, doar daca ramane detasat.
    setTimeout(() => {
      if (!this.isConnected && this._api) { this._api.destroy(); this._api = null; }
    }, 1000);
  }
  set options(o) {
    this._opts = Object.assign({}, this._opts, o || {});
    if (this._api) this._api.setOptions(this._opts);
  }
  get options() { return this._opts; }
  set hass(h) {
    this._hass = h;
    if (this._api) this._api.setHass(h);
  }
  get hass() { return this._hass; }
}
if (!customElements.get('whiteboard-board')) customElements.define('whiteboard-board', WhiteboardBoard);

/* ============================================================
 *  <whiteboard-card> — cardul Lovelace
 * ============================================================ */
class WhiteboardCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  static getStubConfig() {
    return { type: 'custom:whiteboard-card', height: 420, grid: true };
  }
  static getConfigElement() {
    return document.createElement('whiteboard-card-editor');
  }

  setConfig(config) {
    this._config = Object.assign({
      height: 420,
      grid: true,
      hide_toolbar: false,
      storage_key: DEFAULT_KEY,
      language: DEFAULT_LANGUAGE
    }, config || {});
    this._render();
  }

  // Singurul lucru folosit din hass este limba, pentru language: auto
  set hass(hass) {
    this._hass = hass;
    const board = this.shadowRoot && this.shadowRoot.getElementById('board');
    if (board) board.hass = hass;
    const l = hass && hass.language;
    if (l && l !== this._hassLanguage) {
      this._hassLanguage = l;
      if (this._config) this._render();
    }
  }

  getCardSize() {
    const h = parseInt(this._config && this._config.height, 10) || 420;
    return Math.max(3, Math.ceil(h / 50));
  }

  _render() {
    const c = this._config;
    const height = (typeof c.height === 'number') ? c.height + 'px' : String(c.height || '420px');

    if (!this._built) {
      this.shadowRoot.innerHTML = `
        <style>
          ha-card { display: block; overflow: hidden; }
          .header {
            padding: 12px 16px 0;
            font-size: var(--ha-card-header-font-size, 24px);
            color: var(--ha-card-header-color, var(--primary-text-color));
            font-family: var(--ha-card-header-font-family, inherit);
          }
          .body { padding: 8px; }
          .board-wrap {
            position: relative;
            width: 100%;
            overflow: hidden;
            border-radius: var(--ha-card-border-radius, 10px);
            border: 1px solid var(--divider-color, rgba(0,0,0,.12));
          }
        </style>
        <ha-card>
          <div class="header" id="header" style="display:none"></div>
          <div class="body">
            <div class="board-wrap" id="wrap">
              <whiteboard-board id="board"></whiteboard-board>
            </div>
          </div>
        </ha-card>
      `;
      this._built = true;
    }

    const header = this.shadowRoot.getElementById('header');
    header.textContent = c.title || '';
    header.style.display = c.title ? '' : 'none';

    this.shadowRoot.getElementById('wrap').style.height = height;

    const board = this.shadowRoot.getElementById('board');
    if (this._hass) board.hass = this._hass;
    board.options = {
      storageKey: c.storage_key || DEFAULT_KEY,
      grid: c.grid !== false,
      hideToolbar: !!c.hide_toolbar,
      language: c.language || DEFAULT_LANGUAGE,
      hassLanguage: this._hassLanguage
    };
  }
}
if (!customElements.get('whiteboard-card')) customElements.define('whiteboard-card', WhiteboardCard);

/* ============================================================
 *  Editor vizual simplu pentru card
 * ============================================================ */
class WhiteboardCardEditor extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }
  setConfig(config) {
    this._config = Object.assign({}, config);
    this._render();
  }
  _emit() {
    this.dispatchEvent(new CustomEvent('config-changed', {
      detail: { config: this._config },
      bubbles: true,
      composed: true
    }));
  }
  _render() {
    const c = this._config || {};
    if (!this._built) {
      this.shadowRoot.innerHTML = `
        <style>
          .row { display: flex; flex-direction: column; gap: 4px; margin-bottom: 14px; }
          label { font-size: 13px; color: var(--secondary-text-color, #666); }
          input[type="text"], input[type="number"], select {
            padding: 8px 10px;
            border-radius: 6px;
            border: 1px solid var(--divider-color, #ccc);
            background: var(--card-background-color, #fff);
            color: var(--primary-text-color, #111);
            font-size: 14px;
          }
          .check { flex-direction: row; align-items: center; gap: 8px; }
          .hintline { font-size: 12px; color: var(--secondary-text-color, #888); margin-top: -6px; }
        </style>
        <div class="row">
          <label for="title">Title (empty = no header)</label>
          <input type="text" id="title">
        </div>
        <div class="row">
          <label for="height">Height (px)</label>
          <input type="number" id="height" min="150" max="2000" step="10">
        </div>
        <div class="row">
          <label for="storage_key">Storage key</label>
          <input type="text" id="storage_key">
          <div class="hintline">Different keys mean separate boards (e.g. one for the kitchen, one for the office).</div>
        </div>
        <div class="row">
          <label for="language">Toolbar language</label>
          <select id="language">
            <option value="auto">Auto (follow Home Assistant)</option>
          </select>
        </div>
        <div class="row check">
          <input type="checkbox" id="grid">
          <label for="grid">Show the dot grid</label>
        </div>
        <div class="row check">
          <input type="checkbox" id="hide_toolbar">
          <label for="hide_toolbar">Start with the toolbar hidden</label>
        </div>
      `;
      this._built = true;

      const bind = (id, key, kind) => {
        const el = this.shadowRoot.getElementById(id);
        el.addEventListener(kind === 'bool' ? 'change' : 'input', () => {
          const cfg = Object.assign({}, this._config);
          if (kind === 'bool') cfg[key] = el.checked;
          else if (kind === 'num') cfg[key] = parseInt(el.value, 10) || 420;
          else { if (el.value) cfg[key] = el.value; else delete cfg[key]; }
          this._config = cfg;
          this._emit();
        });
      };
      bind('title', 'title', 'str');
      bind('height', 'height', 'num');
      bind('storage_key', 'storage_key', 'str');
      bind('language', 'language', 'str');
      bind('grid', 'grid', 'bool');
      bind('hide_toolbar', 'hide_toolbar', 'bool');
    }

    this.shadowRoot.getElementById('title').value = c.title || '';
    this.shadowRoot.getElementById('height').value = parseInt(c.height, 10) || 420;
    this.shadowRoot.getElementById('storage_key').value = c.storage_key || '';

    const langSel = this.shadowRoot.getElementById('language');
    if (langSel.options.length === 1) {
      SUPPORTED_LANGUAGES.forEach(code => {
        const o = document.createElement('option');
        o.value = code;
        o.textContent = LANGUAGE_NAMES[code] || code;
        langSel.appendChild(o);
      });
    }
    langSel.value = c.language || DEFAULT_LANGUAGE;
    this.shadowRoot.getElementById('grid').checked = c.grid !== false;
    this.shadowRoot.getElementById('hide_toolbar').checked = !!c.hide_toolbar;
  }
}
if (!customElements.get('whiteboard-card-editor')) {
  customElements.define('whiteboard-card-editor', WhiteboardCardEditor);
}

/* Inregistrare in lista de carduri din UI-ul HA */
window.customCards = window.customCards || [];
if (!window.customCards.some(c => c.type === 'whiteboard-card')) {
  window.customCards.push({
    type: 'whiteboard-card',
    name: 'Whiteboard',
    description: 'Infinite-canvas whiteboard with emoji, text and image stickers.',
    preview: false,
    documentationURL: 'https://github.com/Dorin-Irimia/ha-whiteboard'
  });
}

console.info('%c WHITEBOARD-CARD %c ' + VERSION + ' ', 'background:#5eb1ff;color:#10131a;font-weight:700', '');

export { createWhiteboard };
