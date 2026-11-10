const fs = require('fs');
const path = require('path');

const root = '/Users/maddhamsolanki/.gemini/antigravity/scratch/thecalverse';
const files = [path.join(root, 'index.html'), path.join(root, 'app.html')];

for (const file of files) {
  let content = fs.readFileSync(file, 'utf-8');

  // 1. Ensure journalBgActiveCategory defaults to 'all'
  content = content.replace(/let journalBgActiveCategory = '[^']*';/, "let journalBgActiveCategory = 'all';");

  // 2. Add selectJournalBackgroundItem and applyJournalPaperBackground
  const targetBgFunc = `function applyJournalPageBackground(bgValue, bgId = null){`;
  const bgFuncs = `function selectJournalBackgroundItem(bgId){
  const customs = getJournalCustomBackgrounds();
  const allBgs = [...JOURNAL_BACKGROUNDS, ...customs];
  const bg = allBgs.find(b => b.id === bgId);
  if(!bg) return;
  applyJournalPaperBackground(bg);
}

function applyJournalPaperBackground(bg){
  const note = getNoteById(currentNoteId);
  if(!note) return;

  if(bg.styleKey){
    applyIpadPaperStyle(bg.styleKey);
    note.pageBg = null;
    note.pageBgId = bg.id;
    note.paperStyle = bg.styleKey;
    applyPageBackgroundToSheet(null);
    saveCurrentIpadPage(false);
    renderJournalBackgroundGrid(journalBgActiveCategory || 'all');
    showToast(\`Background set: \${bg.name} ✨\`);
  } else if(bg.value){
    note.pageBg = bg.value;
    note.pageBgId = bg.id;
    applyPageBackgroundToSheet(note.pageBg, note.pageBgDim || 100);
    saveCurrentIpadPage(false);
    renderJournalBackgroundGrid(journalBgActiveCategory || 'all');
    showToast(\`Custom background set 🖼️✨\`);
  }
}

function applyJournalPageBackground(bgValue, bgId = null){`;

  if (!content.includes('function selectJournalBackgroundItem(')) {
    content = content.replace(targetBgFunc, bgFuncs);
    console.log(`[${path.basename(file)}] Restored selectJournalBackgroundItem & applyJournalPaperBackground!`);
  }

  // 3. Upgrade insertGraphicStickerToJournal to work across both iPad notebook AND note editor
  const oldInsertGraphic = `function insertGraphicStickerToJournal(src, name){
  closeStickersModal();
  const editor = document.getElementById("ipad-page-editor");
  if(!editor) return;

  const resolvedSrc = resolveCalverseAsset(src);
  const id = "cgstk_" + Date.now() + "_" + Math.random().toString(36).slice(2,6);
  const w = 150;
  const h = 150;
  const contentHtml = \`
    <div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;cursor:move;padding:4px;box-sizing:border-box;">
      <img src="\${escapeHtml(resolvedSrc)}" alt="\${escapeHtml(name || 'Sticker')}" style="max-width:100%;max-height:100%;object-fit:contain;pointer-events:none;filter:drop-shadow(0 4px 10px rgba(0,0,0,0.18));">
    </div>
  \`;

  const pos = getNextCanvasItemPosition(w, h);
  const barHtml = buildCanvasItemBar(id, "sticker", {
    isMini: true,
    dragLabel: "Sticker",
    angle: 0
  });

  const html = \`
    <div class="canvas-item canvas-sticker is-selected" id="\${id}" data-type="sticker" data-rotation="0" style="left:\${pos.left}px;top:\${pos.top}px;width:\${w}px;height:\${h}px;z-index:\${++canvasMaxZIndex};" contenteditable="false">
      \${barHtml}
      \${contentHtml}
      <div class="canvas-rotate-handle" title="Drag to freely rotate to any degree">↻</div>
      <div class="canvas-resize-handle" data-dir="se" title="Drag corner to resize">⤡</div>
    </div>
  \`;

  deselectAllCanvasItems();
  editor.insertAdjacentHTML("beforeend", html);
  queueIpadSave();
  showToast("Sticker placed on page! 🎀");
}`;

  const newInsertGraphic = `function insertGraphicStickerToJournal(src, name){
  closeStickersModal();
  const editor = getActiveJournalEditor();
  if(!editor) return;

  const resolvedSrc = resolveCalverseAsset(src);
  if(editor.id === 'ipad-page-editor'){
    const id = "cgstk_" + Date.now() + "_" + Math.random().toString(36).slice(2,6);
    const w = 150;
    const h = 150;
    const contentHtml = \`
      <div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;cursor:move;padding:4px;box-sizing:border-box;">
        <img src="\${escapeHtml(resolvedSrc)}" alt="\${escapeHtml(name || 'Sticker')}" style="max-width:100%;max-height:100%;object-fit:contain;pointer-events:none;filter:drop-shadow(0 4px 10px rgba(0,0,0,0.18));">
      </div>
    \`;

    const pos = getNextCanvasItemPosition(w, h);
    const barHtml = buildCanvasItemBar(id, "sticker", {
      isMini: true,
      dragLabel: "Sticker",
      angle: 0
    });

    const html = \`
      <div class="canvas-item canvas-sticker is-selected" id="\${id}" data-type="sticker" data-rotation="0" style="left:\${pos.left}px;top:\${pos.top}px;width:\${w}px;height:\${h}px;z-index:\${++canvasMaxZIndex};" contenteditable="false">
        \${barHtml}
        \${contentHtml}
        <div class="canvas-rotate-handle" title="Drag to freely rotate to any degree">↻</div>
        <div class="canvas-resize-handle" data-dir="se" title="Drag corner to resize">⤡</div>
      </div>
    \`;

    deselectAllCanvasItems();
    editor.insertAdjacentHTML("beforeend", html);
    queueIpadSave();
    showToast("Sticker placed on page! 🎀");
  } else {
    setNoteEditMode(true, false);
    editor.focus();
    const stickerHtml = \`<img src="\${escapeHtml(resolvedSrc)}" alt="\${escapeHtml(name || 'Sticker')}" style="max-width:130px;max-height:130px;object-fit:contain;vertical-align:middle;display:inline-block;margin:6px;filter:drop-shadow(0 3px 6px rgba(0,0,0,0.15));" contenteditable="false">&nbsp;\`;
    insertHtmlAtCursor(stickerHtml, editor);
    syncNoteEditorPlaceholder();
    queueNoteSave();
    showToast("Sticker added to note! 🎀");
  }
}`;

  if (content.includes(oldInsertGraphic)) {
    content = content.replace(oldInsertGraphic, newInsertGraphic);
    console.log(`[${path.basename(file)}] Upgraded insertGraphicStickerToJournal!`);
  }

  // 4. Upgrade filterStickerTab('aesthetic_pack') to remove loading="lazy" and add fallback
  const oldStickerTabPack = `  if(tab==='aesthetic_pack'){
    const items = GRAPHIC_STICKERS.map(s => \`
      <div class="graphic-sticker-card" onclick="insertGraphicStickerToJournal('\${s.src}', '\${escapeHtml(s.name)}')" title="\${escapeHtml(s.name)} - Click to place on page">
        <img src="\${resolveCalverseAsset(s.src)}" alt="\${escapeHtml(s.name)}" loading="lazy">
      </div>
    \`).join('');
    box.innerHTML = \`<div class="graphic-stickers-grid">\${items}</div>\`;
    return;
  }`;

  const newStickerTabPack = `  if(tab==='aesthetic_pack'){
    const items = GRAPHIC_STICKERS.map(s => {
      const resolved = resolveCalverseAsset(s.src);
      const fallback = s.rawLocalSrc || s.src;
      return \`
      <div class="graphic-sticker-card" onclick="insertGraphicStickerToJournal('\${resolved}', '\${escapeHtml(s.name)}')" title="\${escapeHtml(s.name)} - Click to place on page">
        <img src="\${resolved}" alt="\${escapeHtml(s.name)}" onerror="if(!this.dataset.fallback){this.dataset.fallback=1;this.src='\${fallback}';}">
      </div>
    \`;}).join('');
    box.innerHTML = \`<div class="graphic-stickers-grid">\${items}</div>\`;
    return;
  }`;

  if (content.includes(oldStickerTabPack)) {
    content = content.replace(oldStickerTabPack, newStickerTabPack);
    console.log(`[${path.basename(file)}] Upgraded filterStickerTab('aesthetic_pack') image loading & fallback!`);
  }

  fs.writeFileSync(file, content, 'utf-8');
  console.log(`[${path.basename(file)}] Written.\n`);
}
