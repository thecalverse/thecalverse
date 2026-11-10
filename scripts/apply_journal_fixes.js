const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const INDEX_PATH = path.join(ROOT, 'index.html');
const APP_PATH = path.join(ROOT, 'app.html');

function applyFixes(filePath) {
  console.log(`Processing: ${filePath}`);
  let content = fs.readFileSync(filePath, 'utf-8');

  // 1. ADD CSS FOR DIRECT CORNER DELETE BUTTON AND PAGE HEADING STRIP
  const cssTarget = `.canvas-item.canvas-sticky .journal-sticky-note{
  margin:0;
  width:100% !important;
  max-width:100% !important;
  height:100% !important;
  min-height:80px;
  box-sizing:border-box;
  display:flex;
  flex-direction:column;
  overflow:hidden;
  word-break:break-word;
  overflow-wrap:anywhere;
  cursor:default;
  padding:16px 14px 18px;
  border-radius:4px 4px 18px 4px;
}`;

  const cssReplacement = `.canvas-item.canvas-sticky .journal-sticky-note{
  margin:0;
  width:100% !important;
  max-width:100% !important;
  height:100% !important;
  min-height:80px;
  box-sizing:border-box;
  display:flex;
  flex-direction:column;
  overflow:hidden;
  word-break:break-word;
  overflow-wrap:anywhere;
  cursor:default;
  padding:16px 14px 18px;
  border-radius:4px 4px 18px 4px;
}

/* Direct One-Click Delete Button on Sticky Notes */
.canvas-sticky-corner-del{
  position:absolute;
  top:6px;
  right:6px;
  width:24px;
  height:24px;
  border-radius:50%;
  background:rgba(0,0,0,0.32);
  color:#ffffff;
  border:1.5px solid rgba(255,255,255,0.7);
  font-size:12px;
  font-weight:900;
  cursor:pointer;
  display:inline-flex;
  align-items:center;
  justify-content:center;
  line-height:1;
  z-index:120;
  transition:transform 0.15s ease,background 0.15s ease,border-color 0.15s ease;
  user-select:none;
  -webkit-user-select:none;
  box-shadow:0 2px 6px rgba(0,0,0,0.35);
}
.canvas-sticky-corner-del:hover{
  background:#ff4757 !important;
  border-color:#ff4757 !important;
  color:#ffffff !important;
  transform:scale(1.15);
}
.ipad-frame.is-view-mode .canvas-sticky-corner-del,
.ipad-paper-sheet.is-view-mode .canvas-sticky-corner-del{
  display:none !important;
}

/* Clean Page Heading Strip (Above Paper Canvas, Not In Page) */
.ipad-page-heading-strip{
  display:flex;
  align-items:center;
  gap:10px;
  width:100%;
  max-width:840px;
  margin:4px auto 10px auto;
  padding:6px 14px;
  background:rgba(255,255,255,0.06);
  border:1px solid rgba(255,255,255,0.14);
  border-radius:12px;
  box-sizing:border-box;
  backdrop-filter:blur(10px);
  -webkit-backdrop-filter:blur(10px);
  transition:border-color 0.15s ease,background 0.15s ease,box-shadow 0.15s ease;
}
.ipad-page-heading-strip:focus-within{
  border-color:var(--act,#8c7eff);
  background:rgba(255,255,255,0.09);
  box-shadow:0 0 0 2px rgba(140,126,255,0.22);
}
[data-t=light] .ipad-page-heading-strip{
  background:rgba(131,98,74,0.08);
  border-color:rgba(131,98,74,0.22);
}
[data-t=light] .ipad-page-heading-strip:focus-within{
  border-color:#83624a;
  background:rgba(131,98,74,0.13);
  box-shadow:0 0 0 2px rgba(131,98,74,0.2);
}
.ipad-heading-badge{
  font-size:11px;
  font-weight:800;
  text-transform:uppercase;
  letter-spacing:0.6px;
  color:var(--t3);
  display:inline-flex;
  align-items:center;
  gap:4px;
  user-select:none;
  flex-shrink:0;
}
.ipad-top-heading-input{
  flex:1 1 auto;
  background:transparent;
  border:none;
  outline:none;
  color:var(--t1);
  font-size:16px;
  font-weight:800;
  font-family:inherit;
  padding:0;
  margin:0;
  min-width:100px;
}
.ipad-top-heading-input::placeholder{
  color:var(--t3);
  font-weight:500;
}
.ipad-frame.is-view-mode .ipad-top-heading-input{
  cursor:default;
  color:var(--t2);
}`;

  if (content.includes(cssTarget)) {
    content = content.replace(cssTarget, cssReplacement);
    console.log('✓ Injected CSS for sticky delete button and top page heading strip');
  } else {
    console.warn('⚠️ CSS target not found');
  }

  // 2. MOVE HEADING OUT OF .ipad-paper-sheet INTO .ipad-page-heading-strip ABOVE THE PAPER
  const htmlTarget = `<div class="ipad-paper-sheet paper-cream-dots" id="ipad-paper-sheet">
            <div id="ipad-paper-bg-layer" class="ipad-paper-bg-layer"></div>
            <input type="text" id="ipad-page-title" class="ipad-paper-title" placeholder="Page Title (e.g. Bioenergetics & ATP Cycle...)" oninput="queueIpadSave()" onblur="saveCurrentIpadPage(true)">
            <!-- Freehand Inking Canvas Layer -->`;

  const htmlReplacement = `<!-- Clean Page Heading Strip (Above Paper Canvas, Not In Page) -->
        <div class="ipad-page-heading-strip" id="ipad-page-heading-strip">
          <div class="ipad-heading-badge" title="Page Title">🏷️ Title</div>
          <input type="text" id="ipad-page-title" class="ipad-top-heading-input" placeholder="Page Title (e.g. Bioenergetics &amp; ATP Cycle...)" oninput="queueIpadSave()" onblur="saveCurrentIpadPage(true)" autocomplete="off" spellcheck="true">
        </div>

        <!-- iPad Paper Sheet Surface -->
        <div class="ipad-screen-glass" id="ipad-screen-glass">
          <!-- Spiral Spine (when binder is toggled) -->
          <div class="ipad-spiral-spine" id="ipad-spiral-spine" style="display:none;">
            <div class="ipad-spiral-ring"></div>
            <div class="ipad-spiral-ring"></div>
            <div class="ipad-spiral-ring"></div>
            <div class="ipad-spiral-ring"></div>
            <div class="ipad-spiral-ring"></div>
            <div class="ipad-spiral-ring"></div>
            <div class="ipad-spiral-ring"></div>
            <div class="ipad-spiral-ring"></div>
            <div class="ipad-spiral-ring"></div>
            <div class="ipad-spiral-ring"></div>
            <div class="ipad-spiral-ring"></div>
            <div class="ipad-spiral-ring"></div>
          </div>

          <div class="ipad-paper-sheet paper-cream-dots" id="ipad-paper-sheet">
            <div id="ipad-paper-bg-layer" class="ipad-paper-bg-layer"></div>
            <!-- Freehand Inking Canvas Layer -->`;

  // Check the wider block around ipad-screen-glass to be safe
  const glassBlockTarget = `<!-- iPad Paper Sheet Surface -->
        <div class="ipad-screen-glass" id="ipad-screen-glass">
          <!-- Spiral Spine (when binder is toggled) -->
          <div class="ipad-spiral-spine" id="ipad-spiral-spine" style="display:none;">
            <div class="ipad-spiral-ring"></div>
            <div class="ipad-spiral-ring"></div>
            <div class="ipad-spiral-ring"></div>
            <div class="ipad-spiral-ring"></div>
            <div class="ipad-spiral-ring"></div>
            <div class="ipad-spiral-ring"></div>
            <div class="ipad-spiral-ring"></div>
            <div class="ipad-spiral-ring"></div>
            <div class="ipad-spiral-ring"></div>
            <div class="ipad-spiral-ring"></div>
            <div class="ipad-spiral-ring"></div>
            <div class="ipad-spiral-ring"></div>
          </div>

          <div class="ipad-paper-sheet paper-cream-dots" id="ipad-paper-sheet">
            <div id="ipad-paper-bg-layer" class="ipad-paper-bg-layer"></div>
            <input type="text" id="ipad-page-title" class="ipad-paper-title" placeholder="Page Title (e.g. Bioenergetics & ATP Cycle...)" oninput="queueIpadSave()" onblur="saveCurrentIpadPage(true)">
            <!-- Freehand Inking Canvas Layer -->`;

  if (content.includes(glassBlockTarget)) {
    content = content.replace(glassBlockTarget, htmlReplacement);
    console.log('✓ Successfully moved heading above the paper canvas');
  } else {
    console.warn('⚠️ Glass block target not found');
  }

  // 3. BACKGROUND MODAL DISMISSAL (Close immediately when background is selected or cleared)
  const bgSelectTarget = `function selectJournalBackgroundItem(bgId){
  const customs = getJournalCustomBackgrounds();
  const allBgs = [...JOURNAL_BACKGROUNDS, ...customs];
  const bg = allBgs.find(b => b.id === bgId);
  if(!bg) return;
  applyJournalPaperBackground(bg);
}`;

  const bgSelectReplacement = `function selectJournalBackgroundItem(bgId){
  const customs = getJournalCustomBackgrounds();
  const allBgs = [...JOURNAL_BACKGROUNDS, ...customs];
  const bg = allBgs.find(b => b.id === bgId);
  if(!bg) return;
  applyJournalPaperBackground(bg);
  closeJournalBackgroundModal();
}`;

  if (content.includes(bgSelectTarget)) {
    content = content.replace(bgSelectTarget, bgSelectReplacement);
    console.log('✓ selectJournalBackgroundItem now auto-dismisses modal');
  } else {
    console.warn('⚠️ bgSelectTarget not found');
  }

  const bgRemoveTarget = `function removeJournalPageBackground(){
  const note = getNoteById(currentNoteId);
  if(!note) return;
  note.pageBg = null;
  note.pageBgId = null;
  note.paperStyle = 'blank';
  applyPageBackgroundToSheet(null);
  applyIpadPaperStyle('blank');
  saveCurrentIpadPage(false);
  renderJournalBackgroundGrid(journalBgActiveCategory);
  showToast('Background removed from page 🚫');
}`;

  const bgRemoveReplacement = `function removeJournalPageBackground(){
  const note = getNoteById(currentNoteId);
  if(!note) return;
  note.pageBg = null;
  note.pageBgId = null;
  note.paperStyle = 'blank';
  applyPageBackgroundToSheet(null);
  applyIpadPaperStyle('blank');
  saveCurrentIpadPage(false);
  renderJournalBackgroundGrid(journalBgActiveCategory);
  closeJournalBackgroundModal();
  showToast('Background removed from page 🚫');
}`;

  if (content.includes(bgRemoveTarget)) {
    content = content.replace(bgRemoveTarget, bgRemoveReplacement);
    console.log('✓ removeJournalPageBackground now auto-dismisses modal');
  } else {
    console.warn('⚠️ bgRemoveTarget not found');
  }

  // 4. DEFINE deleteCanvasSticky FUNCTION
  const delStickyFunc = `function deleteCanvasSticky(btn, e){
  if(e){
    try { e.stopPropagation(); } catch(_){}
    try { e.preventDefault(); } catch(_){}
  }
  const item = btn.closest(".canvas-item, .journal-sticky-note") || (btn.id ? document.getElementById(btn.id) : null);
  if(item){
    item.remove();
    queueIpadSave();
    queueNoteSave();
    showToast("Sticky note deleted 🗑️");
  }
}
`;

  // Inject deleteCanvasSticky right before insertIpadStickyPrompt
  const insertStickyTarget = `function insertIpadStickyPrompt(){`;
  if (content.includes(insertStickyTarget)) {
    content = content.replace(insertStickyTarget, delStickyFunc + '\n' + insertStickyTarget);
    console.log('✓ Defined deleteCanvasSticky helper function');
  } else {
    console.warn('⚠️ insertStickyTarget not found');
  }

  // 5. UPDATE insertIpadStickyPrompt TO INCLUDE CORNER DELETE BUTTON
  const ipadStickyOldHtml = `    <div class="canvas-item canvas-sticky is-selected" id="\${id}" data-type="sticky" data-sticky-color="\${picked}" data-custom-font="patrick" data-custom-font-size="15" data-rotation="-1" style="left:\${pos.left}px;top:\${pos.top}px;width:260px;transform:rotate(-1deg);z-index:\${++canvasMaxZIndex};" contenteditable="false">
      \${barHtml}
      <div class="journal-sticky-note \${picked} canvas-sticky-body" contenteditable="true" spellcheck="true" style="font-family:'Patrick Hand',cursive;font-size:15px;">
        <b>📌 Note:</b> Type key study takeaway or formula here...
      </div>`;

  const ipadStickyNewHtml = `    <div class="canvas-item canvas-sticky is-selected" id="\${id}" data-type="sticky" data-sticky-color="\${picked}" data-custom-font="patrick" data-custom-font-size="15" data-rotation="-1" style="left:\${pos.left}px;top:\${pos.top}px;width:260px;transform:rotate(-1deg);z-index:\${++canvasMaxZIndex};" contenteditable="false">
      \${barHtml}
      <button type="button" class="canvas-sticky-corner-del" onclick="deleteCanvasSticky(this, event)" title="Delete Sticky Note">✕</button>
      <div class="journal-sticky-note \${picked} canvas-sticky-body" contenteditable="true" spellcheck="true" style="font-family:'Patrick Hand',cursive;font-size:15px;">
        <b>📌 Note:</b> Type key study takeaway or formula here...
      </div>`;

  if (content.includes(ipadStickyOldHtml)) {
    content = content.replace(ipadStickyOldHtml, ipadStickyNewHtml);
    console.log('✓ insertIpadStickyPrompt now includes corner delete button');
  } else {
    console.warn('⚠️ ipadStickyOldHtml not found');
  }

  // 6. UPDATE hydrateCanvasElements TO RETROFIT CORNER DELETE ON EXISTING/LOADED STICKIES
  const hydrateLegacyTarget = `    wrapper.innerHTML = \`
      \${buildCanvasItemBar(id, "sticky", {
        isMini: true,
        dragLabel: "Sticky",
        hasFont: true,
        initialPt: 15,
        angle: -1,
        extraBtns: \\\`<button type="button" class="cbar-btn" data-action="sticky-color" title="Cycle Preset Color">🎨 Preset</button><button type="button" class="cbar-btn" data-action="sticky-custom-color" title="Custom Color Dial & Intensity">🌈 Color</button>\\\`
      })}
      <div class="journal-sticky-note \${color} canvas-sticky-body" contenteditable="true" spellcheck="true">\${note.innerHTML}</div>`;

  const hydrateLegacyReplacement = `    wrapper.innerHTML = \`
      \${buildCanvasItemBar(id, "sticky", {
        isMini: true,
        dragLabel: "Sticky",
        hasFont: true,
        initialPt: 15,
        angle: -1,
        extraBtns: \\\`<button type="button" class="cbar-btn" data-action="sticky-color" title="Cycle Preset Color">🎨 Preset</button><button type="button" class="cbar-btn" data-action="sticky-custom-color" title="Custom Color Dial & Intensity">🌈 Color</button>\\\`
      })}
      <button type="button" class="canvas-sticky-corner-del" onclick="deleteCanvasSticky(this, event)" title="Delete Sticky Note">✕</button>
      <div class="journal-sticky-note \${color} canvas-sticky-body" contenteditable="true" spellcheck="true">\${note.innerHTML}</div>`;

  if (content.includes(hydrateLegacyTarget)) {
    content = content.replace(hydrateLegacyTarget, hydrateLegacyReplacement);
    console.log('✓ hydrateCanvasElements legacy upgrade now includes corner delete');
  } else {
    console.warn('⚠️ hydrateLegacyTarget not found');
  }

  // Also in hydrateCanvasElements ensure any loaded canvas-sticky has the button
  const hydrateLoopTarget = `// 3. Corner resize handle
    if(!item.querySelector(".canvas-resize-handle")){
      item.insertAdjacentHTML("beforeend", '<div class="canvas-resize-handle" data-dir="se" title="Drag corner to resize">⤡</div>');
    }`;

  const hydrateLoopReplacement = `// 3. Corner resize handle
    if(!item.querySelector(".canvas-resize-handle")){
      item.insertAdjacentHTML("beforeend", '<div class="canvas-resize-handle" data-dir="se" title="Drag corner to resize">⤡</div>');
    }
    // Direct corner delete on sticky notes
    if(item.classList.contains("canvas-sticky") && !item.querySelector(".canvas-sticky-corner-del")){
      item.insertAdjacentHTML("afterbegin", '<button type="button" class="canvas-sticky-corner-del" onclick="deleteCanvasSticky(this, event)" title="Delete Sticky Note">✕</button>');
    }`;

  if (content.includes(hydrateLoopTarget)) {
    content = content.replace(hydrateLoopTarget, hydrateLoopReplacement);
    console.log('✓ hydrateCanvasElements loop now auto-adds corner delete to all loaded stickies');
  } else {
    console.warn('⚠️ hydrateLoopTarget not found');
  }

  // 7. POINTERDOWN LISTENER: Catch direct delete button
  const pointerdownTarget = `sheet.addEventListener("pointerdown", (e) => {
    const actionBtn = e.target.closest(".cbar-btn");`;

  const pointerdownReplacement = `sheet.addEventListener("pointerdown", (e) => {
    const directDel = e.target.closest(".canvas-sticky-corner-del, .sticky-inline-del-btn");
    if(directDel){
      e.stopPropagation();
      e.preventDefault();
      deleteCanvasSticky(directDel, e);
      return;
    }

    const actionBtn = e.target.closest(".cbar-btn");`;

  if (content.includes(pointerdownTarget)) {
    content = content.replace(pointerdownTarget, pointerdownReplacement);
    console.log('✓ sheet pointerdown handler now intercepts sticky corner delete');
  } else {
    console.warn('⚠️ pointerdownTarget not found');
  }

  // 8. KEYDOWN LISTENER: Auto-remove sticky when backspace is pressed on empty sticky body
  const keydownTarget = `window.addEventListener("keydown", (e) => {
    if(e.key === "Delete" || e.key === "Backspace"){
      const activeEl = document.activeElement;
      if(activeEl && (activeEl.tagName === "INPUT" || activeEl.tagName === "TEXTAREA" || activeEl.isContentEditable)){
        return;
      }
      const selectedItem = sheet.querySelector(".canvas-item.is-selected");
      if(selectedItem){
        e.preventDefault();
        selectedItem.remove();
        queueIpadSave();
        showToast("Item deleted 🗑️");
      }
    }
  });`;

  const keydownReplacement = `window.addEventListener("keydown", (e) => {
    if(e.key === "Delete" || e.key === "Backspace"){
      const activeEl = document.activeElement;
      if(activeEl && activeEl.isContentEditable){
        const stickyBody = activeEl.closest(".canvas-sticky-body");
        if(stickyBody && stickyBody.innerText.trim() === ""){
          const item = stickyBody.closest(".canvas-item");
          if(item){
            e.preventDefault();
            item.remove();
            queueIpadSave();
            showToast("Sticky note deleted 🗑️");
            return;
          }
        }
        return;
      }
      if(activeEl && (activeEl.tagName === "INPUT" || activeEl.tagName === "TEXTAREA")){
        return;
      }
      const selectedItem = sheet.querySelector(".canvas-item.is-selected");
      if(selectedItem){
        e.preventDefault();
        selectedItem.remove();
        queueIpadSave();
        showToast("Item deleted 🗑️");
      }
    }
  });`;

  if (content.includes(keydownTarget)) {
    content = content.replace(keydownTarget, keydownReplacement);
    console.log('✓ keydown listener now deletes sticky when backspace is pressed on empty sticky note');
  } else {
    console.warn('⚠️ keydownTarget not found');
  }

  // 9. QUICK NOTES EDITOR: Update insertStickyNotePrompt with a clean header & delete button
  const quickStickyTarget = `function insertStickyNotePrompt(){
  const colors=['yellow','pink','mint','lavender'];
  const picked=colors[Math.floor(Math.random()*colors.length)];
  setNoteEditMode(true,false);
  const editor=document.getElementById('note-editor');
  if(!editor)return;
  editor.focus();
  const stickyHtml=\`
    <div class="journal-sticky-note \${picked}" contenteditable="true" spellcheck="false">
      ✨ Note to self: Click here to type your aesthetic thought...
    </div>
    <p><br></p>
  \`;
  insertHtmlAtCursor(stickyHtml,editor);
  syncNoteEditorPlaceholder();
  queueNoteSave();
  showToast('Added sticky note 📝');
}`;

  const quickStickyReplacement = `function insertStickyNotePrompt(){
  const colors=['yellow','pink','mint','lavender'];
  const picked=colors[Math.floor(Math.random()*colors.length)];
  setNoteEditMode(true,false);
  const editor=document.getElementById('note-editor');
  if(!editor)return;
  editor.focus();
  const id = 'nsticky_' + Date.now();
  const stickyHtml=\`
    <div class="journal-sticky-note \${picked}" id="\${id}" contenteditable="false" style="position:relative;margin:14px auto;">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;user-select:none;">
        <span style="font-size:11px;font-weight:800;letter-spacing:0.5px;opacity:0.65;font-family:sans-serif;text-transform:uppercase;">📌 Sticky Note</span>
        <button type="button" class="sticky-inline-del-btn" onclick="deleteCanvasSticky(this, event)" title="Delete Sticky Note" style="background:rgba(0,0,0,0.18);border:none;border-radius:50%;width:22px;height:22px;font-size:11px;font-weight:900;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;color:#222;line-height:1;box-shadow:0 1px 3px rgba(0,0,0,0.2);">✕</button>
      </div>
      <div class="sticky-text-content" contenteditable="true" spellcheck="true" style="outline:none;min-height:36px;font-family:'Patrick Hand',cursive;font-size:16px;">
        ✨ Note to self: Click here to type your aesthetic thought...
      </div>
    </div>
    <p><br></p>
  \`;
  insertHtmlAtCursor(stickyHtml,editor);
  syncNoteEditorPlaceholder();
  queueNoteSave();
  showToast('Added sticky note 📝 (Tap ✕ to remove anytime)');
}`;

  if (content.includes(quickStickyTarget)) {
    content = content.replace(quickStickyTarget, quickStickyReplacement);
    console.log('✓ insertStickyNotePrompt now creates easily removable stickies in Quick Notes');
  } else {
    console.warn('⚠️ quickStickyTarget not found');
  }

  fs.writeFileSync(filePath, content, 'utf-8');
  console.log(`Saved: ${filePath}\n`);
}

applyFixes(INDEX_PATH);
applyFixes(APP_PATH);
console.log('All journal fixes applied successfully!');
