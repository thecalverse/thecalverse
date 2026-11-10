const fs = require('fs');
const path = require('path');

const root = '/Users/maddhamsolanki/.gemini/antigravity/scratch/thecalverse';
const files = [path.join(root, 'index.html'), path.join(root, 'app.html')];

for (const file of files) {
  let content = fs.readFileSync(file, 'utf-8');

  const oldFunc = `function openJournalBackgroundModal(){
  const m = document.getElementById('journal-background-modal');
  if(!m) return;
  const note = getNoteById(currentNoteId);
  const slider = document.getElementById('journal-bg-dim-slider');
  const label = document.getElementById('journal-bg-dim-label');
  const dim = (note && note.pageBgDim !== undefined) ? Number(note.pageBgDim) : 100;
  if(slider) slider.value = dim;
  if(label) label.textContent = dim + '%';
  renderJournalBackgroundGrid(journalBgActiveCategory || 'grids');
  m.classList.add('show');
}`;

  const newFunc = `function openJournalBackgroundModal(){
  const m = document.getElementById('journal-background-modal');
  if(!m) return;
  const activeCat = journalBgActiveCategory || 'all';
  document.querySelectorAll('.journal-bg-tab').forEach(b => {
    b.classList.toggle('is-active', b.getAttribute('data-cat') === activeCat);
  });
  renderJournalBackgroundGrid(activeCat);
  m.classList.add('show');
}`;

  if (content.includes(oldFunc)) {
    content = content.replace(oldFunc, newFunc);
    fs.writeFileSync(file, content, 'utf-8');
    console.log(`[${path.basename(file)}] Updated openJournalBackgroundModal!`);
  } else {
    console.warn(`[${path.basename(file)}] Warning: Could not find exact oldFunc match.`);
  }
}
