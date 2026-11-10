const fs = require('fs');
const path = require('path');

const root = '/Users/maddhamsolanki/.gemini/antigravity/scratch/thecalverse';
const files = [path.join(root, 'index.html'), path.join(root, 'app.html')];

for (const file of files) {
  let content = fs.readFileSync(file, 'utf-8');

  // 1. Upgrade .ipad-top-page-tools to place Background, Stickers, Washi right in front
  const oldTopTools = `<div class="ipad-top-page-tools">
              <button type="button" class="ipad-step-btn" id="ipad-pages-toggle-btn" onclick="openIpadPagesDrawer()" title="View All Pages in Notebook" style="padding:0 9px;font-size:11.5px;font-weight:800;gap:4px;display:inline-flex;align-items:center;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.16);height:28px;border-radius:8px;">📑 <span id="ipad-pages-btn-label">Pages (1)</span></button>
              <button type="button" class="ipad-step-btn ipad-edit-only" id="ipad-binder-toggle-btn" onclick="toggleIpadSpiralBinder()" title="Toggle Penly Spiral Binder Spine" style="padding:0 8px;font-size:11.5px;font-weight:800;gap:4px;display:flex;align-items:center;height:28px;border-radius:8px;">📓 Binder</button>
              <button type="button" class="ipad-step-btn ipad-edit-only" id="ipad-templates-btn" onclick="openJournalTemplatesModal()" style="background:linear-gradient(135deg,rgba(140,126,255,0.18),rgba(255,140,200,0.12));border:1px solid rgba(140,126,255,0.3);padding:0 10px;font-size:11.5px;color:var(--t1);height:28px;border-radius:8px;" title="Templates &amp; Backgrounds">✨ Templates</button>
            </div>`;

  const newTopTools = `<div class="ipad-top-page-tools">
              <!-- FRONT ACCESS (Zero Scrolling): Background, Stickers & Washi Tape -->
              <button type="button" class="ipad-step-btn ipad-edit-only" onclick="openJournalBackgroundModal()" style="background:linear-gradient(135deg,rgba(223,190,149,0.24),rgba(140,126,255,0.18));border:1px solid rgba(223,190,149,0.45);color:var(--t1);padding:0 10px;font-size:11.5px;font-weight:900;height:28px;border-radius:8px;display:inline-flex;align-items:center;gap:5px;" title="Choose Paper Background">🖼️ Background</button>
              <button type="button" class="ipad-step-btn ipad-edit-only" onclick="openStickersModal()" style="background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.18);padding:0 9px;font-size:11.5px;font-weight:800;height:28px;border-radius:8px;display:inline-flex;align-items:center;gap:4px;" title="Aesthetic Stickers">🎀 Stickers</button>
              <div class="ipad-edit-only" style="display:inline-flex;align-items:center;">
                <button type="button" class="ipad-step-btn" onclick="insertIpadWashiTape()" style="background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.18);padding:0 8px;font-size:11.5px;font-weight:800;height:28px;border-radius:8px 0 0 8px;display:inline-flex;align-items:center;gap:4px;" title="Insert Washi Tape">📌 Washi</button>
                <button type="button" class="ipad-step-btn" onclick="openWashiPatternPickerModal(null)" style="background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.18);border-left:none;padding:0 5px;font-size:10px;height:28px;border-radius:0 8px 8px 0;" title="Browse all washi tape patterns">▾</button>
              </div>
              <button type="button" class="ipad-step-btn" id="ipad-pages-toggle-btn" onclick="openIpadPagesDrawer()" title="View All Pages in Notebook" style="padding:0 9px;font-size:11.5px;font-weight:800;gap:4px;display:inline-flex;align-items:center;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.16);height:28px;border-radius:8px;">📑 <span id="ipad-pages-btn-label">Pages (1)</span></button>
              <button type="button" class="ipad-step-btn ipad-edit-only" id="ipad-binder-toggle-btn" onclick="toggleIpadSpiralBinder()" title="Toggle Penly Spiral Binder Spine" style="padding:0 8px;font-size:11.5px;font-weight:800;gap:4px;display:flex;align-items:center;height:28px;border-radius:8px;">📓 Binder</button>
              <button type="button" class="ipad-step-btn ipad-edit-only" id="ipad-templates-btn" onclick="openJournalTemplatesModal()" style="background:linear-gradient(135deg,rgba(140,126,255,0.18),rgba(255,140,200,0.12));border:1px solid rgba(140,126,255,0.3);padding:0 10px;font-size:11.5px;color:var(--t1);height:28px;border-radius:8px;" title="Templates">✨ Templates</button>
            </div>`;

  if (content.includes(oldTopTools)) {
    content = content.replace(oldTopTools, newTopTools);
    console.log(`[${path.basename(file)}] Successfully upgraded .ipad-top-page-tools!`);
  } else {
    console.warn(`[${path.basename(file)}] Warning: Could not find exact oldTopTools match.`);
  }

  // 2. Upgrade .ipad-stylus-dock to put Background, Stickers, Washi right at the FRONT
  const oldDockStart = `<div class="ipad-stylus-dock">
          <!-- Primary Tool Switcher (Segmented Dock) -->
          <div class="ipad-tool-segmented">
            <button type="button" class="dock-tool-btn is-active" id="tool-select" onclick="setIpadActiveTool('select')" title="Select & Move (Text, Tape, Shapes, Photos)">✋ Select</button>
            <button type="button" class="dock-tool-btn" id="tool-pen" onclick="setIpadActiveTool('pen')" title="Stylus Pen (Handwriting & Inking)">✏️ Pen</button>
            <button type="button" class="dock-tool-btn" id="tool-highlighter" onclick="setIpadActiveTool('highlighter')" title="Highlighter (Pastel Translucent Glow)">🖍️ Highlight</button>
            <button type="button" class="dock-tool-btn" id="tool-eraser" onclick="setIpadActiveTool('eraser')" title="Eraser (Erase Inking & Drawings)">🧹 Eraser</button>
          </div>

          <div class="dock-divider"></div>

          <!-- Freeform Canvas Insertables -->
          <div class="ipad-tool-grp">
            <button type="button" class="note-tool-btn" onclick="insertIpadTextBox()" style="font-size:11.5px;height:30px;padding:0 8px;gap:4px;display:inline-flex;align-items:center;" title="Insert movable text box anywhere">🔤 Text Box</button>
            <button type="button" class="note-tool-btn" onclick="insertIpadStickyPrompt()" style="font-size:11.5px;height:30px;padding:0 8px;gap:4px;display:inline-flex;align-items:center;" title="Insert aesthetic sticky note">📝 Sticky</button>
            <button type="button" class="note-tool-btn" onclick="toggleIpadShapesMenu(event)" id="ipad-shapes-btn" style="font-size:11.5px;height:30px;padding:0 8px;gap:4px;display:inline-flex;align-items:center;" title="Insert Apple Freeform shapes">📐 Shapes ▾</button>
            <button type="button" class="note-tool-btn" onclick="insertIpadWashiTape()" style="font-size:11.5px;height:30px;padding:0 8px;gap:4px;display:inline-flex;align-items:center;" title="Insert writable washi tape strip">📌 Washi</button><button type="button" class="note-tool-btn" onclick="openWashiPatternPickerModal(null)" style="font-size:10px;height:30px;padding:0 5px;margin-left:-3px;" title="Browse all washi tape patterns">▾</button>
            <button type="button" class="note-tool-btn" onclick="openStickersModal()" style="font-size:11.5px;height:30px;padding:0 8px;gap:4px;display:inline-flex;align-items:center;" title="Movable planner stickers">🎀 Stickers</button>
            <button type="button" class="note-tool-btn" onclick="triggerIpadPhotoUpload()" style="font-size:11.5px;height:30px;padding:0 8px;gap:4px;display:inline-flex;align-items:center;" title="Insert photo or diagram">🖼️ Photo</button>
            <button type="button" class="note-tool-btn" onclick="openMathSymbolsPalette('ipad')" style="font-size:11.5px;height:30px;padding:0 8px;gap:4px;display:inline-flex;align-items:center;" title="Mathematical &amp; STEM Symbols">🔢 Math</button>
          </div>

          <div class="dock-divider"></div>

          <!-- Paper Background Toggle & Typography Selectors -->
          <div class="ipad-tool-grp">
            <button type="button" class="note-tool-btn" id="ipad-bg-btn" onclick="openJournalBackgroundModal()" style="font-size:12px;height:30px;padding:0 12px;gap:6px;display:inline-flex;align-items:center;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.16);border-radius:8px;font-weight:800;color:var(--t1);" title="Background Collection (Grids, Dots, Lined, Kraft, Uploads)">
              <span id="ipad-bg-btn-icon" style="font-size:14px;">🖼️</span> <span>Background</span>
            </button>`;

  const newDockStart = `<div class="ipad-stylus-dock">
          <!-- FRONT AESTHETIC GROUP (Appears Right in Front, Zero Scrolling) -->
          <div class="ipad-tool-grp" style="background:linear-gradient(135deg,rgba(223,190,149,0.18),rgba(140,126,255,0.12));border:1px solid rgba(223,190,149,0.4);border-radius:12px;padding:2px 6px;display:inline-flex;align-items:center;gap:4px;">
            <button type="button" class="note-tool-btn" id="ipad-bg-btn" onclick="openJournalBackgroundModal()" style="font-size:12px;height:30px;padding:0 10px;gap:5px;display:inline-flex;align-items:center;background:rgba(223,190,149,0.22);border:1px solid rgba(223,190,149,0.48);border-radius:8px;font-weight:900;color:var(--t1);" title="Background Collection (Grids, Dots, Kraft, Vintage)">
              <span id="ipad-bg-btn-icon" style="font-size:14px;">🖼️</span> <span>Background</span>
            </button>
            <button type="button" class="note-tool-btn" onclick="openStickersModal()" style="font-size:11.5px;height:30px;padding:0 9px;gap:4px;display:inline-flex;align-items:center;font-weight:800;" title="Movable planner stickers">
              <span>🎀</span> <span>Stickers</span>
            </button>
            <button type="button" class="note-tool-btn" onclick="insertIpadWashiTape()" style="font-size:11.5px;height:30px;padding:0 8px;gap:4px;display:inline-flex;align-items:center;font-weight:800;" title="Insert writable washi tape strip">
              <span>📌</span> <span>Washi</span>
            </button>
            <button type="button" class="note-tool-btn" onclick="openWashiPatternPickerModal(null)" style="font-size:10px;height:30px;padding:0 5px;margin-left:-4px;" title="Browse all washi tape patterns">▾</button>
          </div>

          <div class="dock-divider"></div>

          <!-- Primary Tool Switcher (Segmented Dock) -->
          <div class="ipad-tool-segmented">
            <button type="button" class="dock-tool-btn is-active" id="tool-select" onclick="setIpadActiveTool('select')" title="Select & Move (Text, Tape, Shapes, Photos)">✋ Select</button>
            <button type="button" class="dock-tool-btn" id="tool-pen" onclick="setIpadActiveTool('pen')" title="Stylus Pen (Handwriting & Inking)">✏️ Pen</button>
            <button type="button" class="dock-tool-btn" id="tool-highlighter" onclick="setIpadActiveTool('highlighter')" title="Highlighter (Pastel Translucent Glow)">🖍️ Highlight</button>
            <button type="button" class="dock-tool-btn" id="tool-eraser" onclick="setIpadActiveTool('eraser')" title="Eraser (Erase Inking & Drawings)">🧹 Eraser</button>
          </div>

          <div class="dock-divider"></div>

          <!-- Freeform Canvas Insertables -->
          <div class="ipad-tool-grp">
            <button type="button" class="note-tool-btn" onclick="insertIpadTextBox()" style="font-size:11.5px;height:30px;padding:0 8px;gap:4px;display:inline-flex;align-items:center;" title="Insert movable text box anywhere">🔤 Text Box</button>
            <button type="button" class="note-tool-btn" onclick="insertIpadStickyPrompt()" style="font-size:11.5px;height:30px;padding:0 8px;gap:4px;display:inline-flex;align-items:center;" title="Insert aesthetic sticky note">📝 Sticky</button>
            <button type="button" class="note-tool-btn" onclick="toggleIpadShapesMenu(event)" id="ipad-shapes-btn" style="font-size:11.5px;height:30px;padding:0 8px;gap:4px;display:inline-flex;align-items:center;" title="Insert Apple Freeform shapes">📐 Shapes ▾</button>
            <button type="button" class="note-tool-btn" onclick="triggerIpadPhotoUpload()" style="font-size:11.5px;height:30px;padding:0 8px;gap:4px;display:inline-flex;align-items:center;" title="Insert photo or diagram">🖼️ Photo</button>
            <button type="button" class="note-tool-btn" onclick="openMathSymbolsPalette('ipad')" style="font-size:11.5px;height:30px;padding:0 8px;gap:4px;display:inline-flex;align-items:center;" title="Mathematical &amp; STEM Symbols">🔢 Math</button>
          </div>

          <div class="dock-divider"></div>

          <!-- Typography Selectors -->
          <div class="ipad-tool-grp">`;

  if (content.includes(oldDockStart)) {
    content = content.replace(oldDockStart, newDockStart);
    console.log(`[${path.basename(file)}] Successfully upgraded .ipad-stylus-dock!`);
  } else {
    console.warn(`[${path.basename(file)}] Warning: Could not find exact oldDockStart match.`);
  }

  // 3. Clean up #journal-background-modal to remove waste toggles and keep ONLY the background gallery
  const oldModalRegex = /<!-- JOURNAL PAGE BACKGROUND MODAL -->[\s\S]*?<!-- WASHI TAPE PATTERNS GRID MODAL -->/;
  const newModalHtml = `<!-- JOURNAL PAGE BACKGROUND MODAL (Pure Aesthetic Backgrounds, Zero Waste Toggles) -->
<div id="journal-background-modal" class="app-dialog" onclick="if(event.target===this)closeJournalBackgroundModal()">
  <div class="app-dialog-card" style="width:min(96vw,860px);max-width:860px;padding:20px 22px;max-height:88vh;display:flex;flex-direction:column;gap:12px;" onclick="event.stopPropagation()">
    <!-- Clean Aesthetic Header -->
    <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;border-bottom:1px solid var(--glb);padding-bottom:12px;">
      <div>
        <div class="app-dialog-title" style="margin:0 0 2px;font-size:18px;">📑 Journal Backgrounds</div>
        <div style="font-size:12px;color:var(--t2);">Tap any background to apply it immediately to your page.</div>
      </div>
      <div style="display:flex;align-items:center;gap:8px;">
        <input type="file" id="journal-bg-file-input" accept="image/*" style="display:none;" onchange="handleJournalBgUpload(event)">
        <button type="button" class="app-dialog-btn acc" onclick="triggerJournalBgUpload()" style="font-size:11.5px;height:30px;padding:0 11px;font-weight:800;display:inline-flex;align-items:center;gap:5px;">
          <span>📤</span> <span>Upload</span>
        </button>
        <button type="button" class="app-dialog-btn" onclick="removeJournalPageBackground()" style="font-size:11.5px;height:30px;padding:0 10px;background:rgba(255,75,75,0.12);border:1px solid rgba(255,75,75,0.38);color:#ff5a5a;font-weight:800;display:inline-flex;align-items:center;gap:4px;" title="Reset to clean blank canvas">
          <span>🚫</span> <span>Clear</span>
        </button>
        <button type="button" class="ipad-step-btn" onclick="closeJournalBackgroundModal()" style="font-size:15px;width:30px;height:30px;flex-shrink:0;">✕</button>
      </div>
    </div>

    <!-- Active Background Notification Banner (only if custom image is active) -->
    <div id="journal-active-bg-bar" style="display:none;align-items:center;justify-content:space-between;background:rgba(140,126,255,0.12);border:1px solid rgba(140,126,255,0.3);border-radius:10px;padding:8px 12px;"></div>

    <!-- Clean Category Tabs (Default to All so everything is immediately visible) -->
    <div class="journal-bg-tabs" id="journal-bg-tabs">
      <button type="button" class="journal-bg-tab is-active" data-cat="all" onclick="filterJournalBgTab('all', this)">🌟 All Backgrounds</button>
      <button type="button" class="journal-bg-tab" data-cat="grids" onclick="filterJournalBgTab('grids', this)">🖤 Grids &amp; Dots</button>
      <button type="button" class="journal-bg-tab" data-cat="lined" onclick="filterJournalBgTab('lined', this)">📜 Lined &amp; Cornell</button>
      <button type="button" class="journal-bg-tab" data-cat="kraft" onclick="filterJournalBgTab('kraft', this)">🤎 Kraft &amp; Vintage</button>
      <button type="button" class="journal-bg-tab" data-cat="pastel" onclick="filterJournalBgTab('pastel', this)">🌸 Pastel Papers</button>
      <button type="button" class="journal-bg-tab" data-cat="botanical" onclick="filterJournalBgTab('botanical', this)">🌿 Botanicals</button>
      <button type="button" class="journal-bg-tab" data-cat="scenery" onclick="filterJournalBgTab('scenery', this)">🌅 Scenery</button>
      <button type="button" class="journal-bg-tab" data-cat="celestial" onclick="filterJournalBgTab('celestial', this)">🌌 Celestial</button>
      <button type="button" class="journal-bg-tab" data-cat="uploads" onclick="filterJournalBgTab('uploads', this)">📁 My Uploads</button>
    </div>

    <!-- Cards Grid (Smooth, continuous visual gallery) -->
    <div class="journal-bg-grid" id="journal-bg-grid">
      <!-- Populated dynamically by renderJournalBackgroundGrid() -->
    </div>
  </div>
</div>

<!-- WASHI TAPE PATTERNS GRID MODAL -->`;

  if (oldModalRegex.test(content)) {
    content = content.replace(oldModalRegex, newModalHtml);
    console.log(`[${path.basename(file)}] Successfully replaced #journal-background-modal!`);
  } else {
    console.warn(`[${path.basename(file)}] Warning: Could not match oldModalRegex.`);
  }

  // 4. Update CSS for .journal-bg-grid to be a responsive, continuous grid instead of forced 4-card rows
  const oldGridCss = `.journal-bg-grid{
  display:flex !important;
  flex-direction:column !important;
  gap:0 !important;
  overflow-y:auto !important;
  overflow-x:hidden !important;
  scroll-snap-type:y mandatory !important;
  scroll-behavior:smooth !important;
  scrollbar-width:none !important;
  min-height:0 !important;
  height:clamp(140px, 32vw, 246px) !important;
  max-height:clamp(140px, 32vw, 246px) !important;
  box-sizing:border-box !important;
  padding:0 !important;
  flex:none !important;
}
.journal-bg-grid::-webkit-scrollbar{display:none !important;}

.journal-bg-row{
  display:grid !important;
  grid-template-columns:repeat(4, minmax(0, 1fr)) !important;
  gap:10px !important;
  width:100% !important;
  height:100% !important;
  flex:0 0 100% !important;
  scroll-snap-align:start !important;
  scroll-snap-stop:always !important;
  box-sizing:border-box !important;
  padding:4px 2px !important;
}`;

  const newGridCss = `.journal-bg-grid{
  display:grid !important;
  grid-template-columns:repeat(auto-fill, minmax(136px, 1fr)) !important;
  gap:12px !important;
  max-height:clamp(300px, 58vh, 520px) !important;
  overflow-y:auto !important;
  overflow-x:hidden !important;
  padding:8px 4px !important;
  box-sizing:border-box !important;
  scrollbar-width:thin !important;
}
.journal-bg-grid::-webkit-scrollbar{width:6px;}
.journal-bg-grid::-webkit-scrollbar-thumb{background:rgba(223,190,149,0.35);border-radius:999px;}`;

  if (content.includes(oldGridCss)) {
    content = content.replace(oldGridCss, newGridCss);
    console.log(`[${path.basename(file)}] Successfully upgraded .journal-bg-grid CSS!`);
  } else {
    console.warn(`[${path.basename(file)}] Warning: Could not find exact oldGridCss match.`);
  }

  // 5. Update renderJournalBackgroundGrid JavaScript
  const oldJsFuncRegex = /function filterJournalBgTab\(cat, btn\)[\s\S]*?function updateJournalBgPageIndicator[\s\S]*?\}\n\}/;
  const newJsFunc = `function filterJournalBgTab(cat, btn){
  journalBgActiveCategory = cat;
  document.querySelectorAll('.journal-bg-tab').forEach(b => b.classList.toggle('is-active', b === btn));
  renderJournalBackgroundGrid(cat);
}

function renderJournalBackgroundGrid(category = 'all'){
  const container = document.getElementById('journal-bg-grid');
  if(!container) return;

  const note = getNoteById(currentNoteId);
  const curPaper = note ? (note.paperStyle || 'cream') : 'cream';
  const curBg = note ? note.pageBg : null;
  const curBgId = note ? note.pageBgId : null;

  // Active custom background notification banner
  const activeBar = document.getElementById('journal-active-bg-bar');
  if(activeBar){
    if(curBg){
      activeBar.style.display = 'flex';
      activeBar.innerHTML = \`
        <div style="display:flex;align-items:center;gap:8px;font-size:12px;color:var(--t1);">
          <span style="font-size:16px;">🖼️</span>
          <span><b>Custom Wallpaper / Photo Active</b></span>
        </div>
        <button type="button" onclick="removeJournalPageBackground()" style="background:rgba(255,75,75,0.18);border:1px solid rgba(255,75,75,0.4);color:#ff5a5a;font-size:11px;font-weight:800;padding:4px 10px;border-radius:6px;cursor:pointer;display:inline-flex;align-items:center;gap:4px;">
          <span>✕</span> <span>Remove Background</span>
        </button>
      \`;
    } else {
      activeBar.style.display = 'none';
      activeBar.innerHTML = '';
    }
  }

  const customs = getJournalCustomBackgrounds();
  const allBgs = [...JOURNAL_BACKGROUNDS, ...customs];

  const filtered = (category === 'uploads')
    ? customs
    : (category === 'all')
      ? allBgs
      : allBgs.filter(b => b.category === category);

  if(!filtered.length){
    if(category === 'uploads'){
      container.innerHTML = \`
        <div style="grid-column:1/-1;text-align:center;padding:36px 14px;color:var(--t2);">
          <div style="font-size:32px;margin-bottom:8px;">📁</div>
          <div style="font-size:14px;font-weight:800;color:var(--t1);">No custom backgrounds uploaded yet</div>
          <div style="font-size:12px;margin-top:4px;">Click "Upload" above to add your own wallpaper, scrapbook photo, or scan!</div>
          <button type="button" class="app-dialog-btn acc" onclick="triggerJournalBgUpload()" style="margin-top:14px;font-size:12px;height:32px;display:inline-flex;align-items:center;gap:6px;">📤 Upload Custom Image</button>
        </div>
      \`;
      return;
    }
  }

  let cardHtmls = [];
  filtered.forEach(bg => {
    const resolvedThumb = resolveCalverseAsset(bg.thumb || bg.value);
    const resolvedVal = resolveCalverseAsset(bg.value);
    const isCur = bg.styleKey 
      ? (!curBg && curPaper === bg.styleKey)
      : (curBgId === bg.id || (curBg && (curBg === bg.value || curBg === bg.rawLocalValue || resolveCalverseAsset(curBg) === resolvedVal)));

    const bgCss = bg.previewCss 
      ? (bg.previewCss.startsWith('background') ? bg.previewCss : \`background:\${bg.previewCss};\`)
      : (resolvedThumb || resolvedVal)
        ? \`background-image:url('\${resolvedThumb || resolvedVal}'); background-size:cover; background-position:center; background-repeat:no-repeat;\`
        : \`background:\${resolvedVal || '#fff'};\`;

    const delBtn = bg.isCustom 
      ? \`<button type="button" onclick="removeJournalCustomBackground('\${bg.id}', event)" title="Delete from grid completely" style="background:rgba(0,0,0,0.65);border:none;color:#ff5252;width:22px;height:22px;border-radius:50%;font-size:12px;font-weight:900;cursor:pointer;display:grid;place-items:center;box-shadow:0 2px 6px rgba(0,0,0,0.4);">✕</button>\` 
      : '';

    cardHtmls.push(\`
      <div class="journal-bg-card \${isCur ? 'is-active' : ''}" onclick="selectJournalBackgroundItem('\${escapeHtml(bg.id)}')">
        <div class="journal-bg-card-preview" style="\${bgCss}"></div>
        <div class="journal-bg-card-footer">
          <span title="\${escapeHtml(bg.name)}">\${escapeHtml(bg.badge || bg.name)}</span>
          <div style="display:flex;align-items:center;gap:4px;">
            \${delBtn}
            <div class="journal-bg-card-check">✓</div>
          </div>
        </div>
      </div>
    \`);
  });

  // In 'uploads' tab or 'all' tab, show an "Upload Custom Image" tile
  if(category === 'uploads' || category === 'all'){
    cardHtmls.push(\`
      <div class="journal-bg-card" onclick="triggerJournalBgUpload()" title="Upload custom wallpaper or background from device" style="border:1.5px dashed var(--glb);background:rgba(255,255,255,0.02);min-height:110px;">
        <div class="journal-bg-card-preview" style="display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;padding:6px;text-align:center;">
          <span style="font-size:24px;">📤</span>
          <span style="font-size:10.5px;font-weight:900;color:var(--act);">UPLOAD IMAGE</span>
          <span style="font-size:9px;color:var(--t3);">JPG, PNG, WebP</span>
        </div>
        <div class="journal-bg-card-footer" style="background:rgba(0,0,0,0.4);">
          <span>📁 Add Custom</span>
          <span style="font-size:13px;color:var(--act);font-weight:900;">+</span>
        </div>
      </div>
    \`);
  }

  container.innerHTML = cardHtmls.join('');
  container.scrollTop = 0;
}`;

  if (oldJsFuncRegex.test(content)) {
    content = content.replace(oldJsFuncRegex, newJsFunc);
    console.log(`[${path.basename(file)}] Successfully replaced renderJournalBackgroundGrid JS!`);
  } else {
    console.warn(`[${path.basename(file)}] Warning: Could not match oldJsFuncRegex.`);
  }

  fs.writeFileSync(file, content, 'utf-8');
  console.log(`Updated ${file} successfully!\n`);
}
