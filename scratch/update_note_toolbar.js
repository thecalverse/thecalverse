const fs = require('fs');
const path = require('path');

const root = '/Users/maddhamsolanki/.gemini/antigravity/scratch/thecalverse';
const files = [path.join(root, 'index.html'), path.join(root, 'app.html')];

for (const file of files) {
  let content = fs.readFileSync(file, 'utf-8');

  const oldNoteToolbar = `        <div class="note-toolbar">
          <!-- SEGMENT 1: Typography & Paper Style -->`;

  const newNoteToolbar = `        <div class="note-toolbar">
          <!-- FRONT AESTHETIC GROUP: Background, Stickers & Washi Tape -->
          <div class="note-tool-group" style="background:linear-gradient(135deg,rgba(223,190,149,0.16),rgba(140,126,255,0.12));border:1px solid rgba(223,190,149,0.38);" title="Aesthetic Paper & Decor">
            <button class="note-tool-btn" type="button" onclick="openJournalBackgroundModal()" style="font-weight:900;color:var(--t1);gap:5px;" title="Paper Background">🖼️ Background</button>
            <button class="note-tool-btn" type="button" onclick="openStickersModal()" style="font-weight:800;gap:4px;" title="Add Stickers">🎀 Stickers</button>
            <button class="note-tool-btn" type="button" onclick="insertWashiTapeToJournal('washi-blush')" style="font-weight:800;gap:4px;" title="Add Washi Tape">📌 Washi</button>
          </div>

          <!-- SEGMENT 1: Typography & Paper Style -->`;

  if (content.includes(oldNoteToolbar)) {
    content = content.replace(oldNoteToolbar, newNoteToolbar);
    console.log(`[${path.basename(file)}] Successfully upgraded .note-toolbar with front aesthetic group!`);
    fs.writeFileSync(file, content, 'utf-8');
  } else {
    console.warn(`[${path.basename(file)}] Warning: Could not find exact oldNoteToolbar match.`);
  }
}
