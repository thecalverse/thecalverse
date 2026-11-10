const fs = require('fs');
const path = require('path');

const root = '/Users/maddhamsolanki/.gemini/antigravity/scratch/thecalverse';
const files = [path.join(root, 'index.html'), path.join(root, 'app.html')];

for (const file of files) {
  let content = fs.readFileSync(file, 'utf-8');

  // 1. Upgrade CSS for .journal-bg-card, .journal-bg-grid, .journal-bg-card-footer
  const oldCssTarget = `.journal-bg-grid{
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
.journal-bg-grid::-webkit-scrollbar-thumb{background:rgba(223,190,149,0.35);border-radius:999px;}

.journal-bg-card{
  position:relative;
  width:100%;
  height:100%;
  aspect-ratio:210 / 297 !important;
  border-radius:12px;
  border:1.5px solid var(--glb);
  overflow:hidden;
  cursor:pointer;
  background:rgba(255,255,255,0.05);
  transition:transform .16s ease,border-color .16s ease,box-shadow .16s ease;
  display:flex;
  flex-direction:column;
  justify-content:flex-end;
  user-select:none;
  box-sizing:border-box;
}
.journal-bg-card:hover{transform:translateY(-3px) scale(1.02);border-color:var(--act);box-shadow:0 8px 20px rgba(0,0,0,0.3);}
.journal-bg-card.is-active{border-color:var(--act) !important;box-shadow:0 0 0 2.5px var(--act),0 8px 24px rgba(0,0,0,0.35) !important;}
.journal-bg-card-preview{position:absolute;inset:0;background-size:cover;background-position:center;background-repeat:no-repeat;transition:transform .2s ease;}
.journal-bg-card:hover .journal-bg-card-preview{transform:scale(1.04);}
.journal-bg-card-footer{
  position:relative;
  z-index:2;
  background:linear-gradient(180deg,transparent,rgba(0,0,0,0.82) 75%);
  padding:5px 7px;
  color:#fff;
  font-size:10.5px;
  font-weight:800;
  display:flex;
  align-items:center;
  justify-content:space-between;
  line-height:1.2;
  text-shadow:0 1px 2px rgba(0,0,0,0.85);
}`;

  const newCss = `.journal-bg-grid{
  display:grid !important;
  grid-template-columns:repeat(auto-fill, minmax(142px, 1fr)) !important;
  gap:14px !important;
  max-height:clamp(320px, 62vh, 580px) !important;
  overflow-y:auto !important;
  overflow-x:hidden !important;
  padding:10px 4px 20px !important;
  box-sizing:border-box !important;
  scrollbar-width:thin !important;
}
.journal-bg-grid::-webkit-scrollbar{width:6px;}
.journal-bg-grid::-webkit-scrollbar-thumb{background:rgba(223,190,149,0.4);border-radius:999px;}

.journal-bg-card{
  position:relative;
  width:100%;
  aspect-ratio:3 / 4.15 !important;
  min-height:190px !important;
  height:auto !important;
  border-radius:12px;
  border:1.5px solid rgba(255,255,255,0.12);
  background:#141720;
  box-shadow:0 4px 14px rgba(0,0,0,0.28), 0 1px 3px rgba(0,0,0,0.18);
  cursor:pointer;
  overflow:hidden;
  display:flex;
  flex-direction:column;
  justify-content:flex-end;
  user-select:none;
  box-sizing:border-box;
  transition:transform .18s cubic-bezier(0.16, 1, 0.3, 1), box-shadow .18s ease, border-color .18s ease;
}
.journal-bg-card:hover{
  transform:translateY(-4px) scale(1.02);
  border-color:var(--act);
  box-shadow:0 12px 28px rgba(0,0,0,0.45), 0 0 0 1px var(--act);
}
.journal-bg-card.is-active{
  border-color:var(--act) !important;
  box-shadow:0 0 0 2.5px var(--act), 0 8px 24px rgba(140,126,255,0.4) !important;
}
.journal-bg-card-preview{
  position:absolute;
  inset:0;
  width:100%;
  height:100%;
  background-size:cover;
  background-position:center;
  background-repeat:no-repeat;
  transition:transform .22s ease;
  overflow:hidden;
}
.journal-bg-card-img{
  width:100%;
  height:100%;
  object-fit:cover;
  display:block;
  pointer-events:none;
}
.journal-bg-card:hover .journal-bg-card-preview,
.journal-bg-card:hover .journal-bg-card-img{
  transform:scale(1.04);
}
.journal-bg-card-footer{
  position:relative;
  z-index:3;
  background:linear-gradient(180deg,transparent 0%, rgba(7,7,8,0.85) 30%, rgba(5,5,6,0.96) 100%);
  padding:8px 8px 6px;
  color:#fff;
  font-size:11px;
  font-weight:800;
  display:flex;
  align-items:center;
  justify-content:space-between;
  line-height:1.25;
  text-shadow:0 1px 3px rgba(0,0,0,0.9);
}`;

  if (content.includes(oldCssTarget)) {
    content = content.replace(oldCssTarget, newCss);
    console.log(`[${path.basename(file)}] Upgraded .journal-bg-card CSS!`);
  } else {
    console.warn(`[${path.basename(file)}] Warning: Could not find exact oldCssTarget match.`);
  }

  // 2. Upgrade renderJournalBackgroundGrid card generation to render <img> for image papers
  const oldCardGen = `    const bgCss = bg.previewCss 
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
    \`);`;

  const newCardGen = `    const isCssPaper = !!bg.previewCss;
    const bgCss = isCssPaper 
      ? (bg.previewCss.startsWith('background') ? bg.previewCss : \`background:\${bg.previewCss};\`)
      : '';

    const previewInner = isCssPaper
      ? \`<div class="journal-bg-card-preview" style="\${bgCss}"></div>\`
      : \`<div class="journal-bg-card-preview"><img src="\${resolvedThumb || resolvedVal}" class="journal-bg-card-img" alt="\${escapeHtml(bg.name)}" onerror="if(!this.dataset.fallback){this.dataset.fallback=1;this.src='\${bg.rawLocalValue || bg.value}';}"></div>\`;

    const delBtn = bg.isCustom 
      ? \`<button type="button" onclick="removeJournalCustomBackground('\${bg.id}', event)" title="Delete from grid completely" style="background:rgba(0,0,0,0.65);border:none;color:#ff5252;width:22px;height:22px;border-radius:50%;font-size:12px;font-weight:900;cursor:pointer;display:grid;place-items:center;box-shadow:0 2px 6px rgba(0,0,0,0.4);">✕</button>\` 
      : '';

    cardHtmls.push(\`
      <div class="journal-bg-card \${isCur ? 'is-active' : ''}" onclick="selectJournalBackgroundItem('\${escapeHtml(bg.id)}')" title="\${escapeHtml(bg.name)} - Click to apply">
        \${previewInner}
        <div class="journal-bg-card-footer">
          <span title="\${escapeHtml(bg.name)}">\${escapeHtml(bg.badge || bg.name)}</span>
          <div style="display:flex;align-items:center;gap:4px;">
            \${delBtn}
            <div class="journal-bg-card-check">✓</div>
          </div>
        </div>
      </div>
    \`);`;

  if (content.includes(oldCardGen)) {
    content = content.replace(oldCardGen, newCardGen);
    console.log(`[${path.basename(file)}] Upgraded card generation to render <img> for textures!`);
  } else {
    console.warn(`[${path.basename(file)}] Warning: Could not find exact oldCardGen match.`);
  }

  // 3. Update media query max-width:600px to not break height
  const oldMediaCss = `@media (max-width:600px){
  .journal-bg-grid{
    height:130px !important;
    max-height:130px !important;
  }
  .journal-bg-row{
    gap:6px !important;
    padding:2px 1px !important;
  }
  .journal-bg-card{
    border-radius:8px !important;
  }
  .journal-bg-card-footer{
    padding:4px 5px !important;
    font-size:9.5px !important;
  }
  .journal-bg-card-footer span{
    max-width:calc(100% - 17px) !important;
  }
  .journal-bg-card-check{
    width:15px !important;
    height:15px !important;
    font-size:9px !important;
  }
}`;

  const newMediaCss = `@media (max-width:600px){
  .journal-bg-grid{
    grid-template-columns:repeat(2, minmax(0, 1fr)) !important;
    gap:10px !important;
    max-height:58vh !important;
    padding:6px 2px 16px !important;
  }
  .journal-bg-card{
    border-radius:10px !important;
    min-height:160px !important;
    aspect-ratio:3 / 4 !important;
  }
  .journal-bg-card-footer{
    padding:5px 6px !important;
    font-size:10px !important;
  }
  .journal-bg-card-footer span{
    max-width:calc(100% - 18px) !important;
  }
  .journal-bg-card-check{
    width:17px !important;
    height:17px !important;
    font-size:10px !important;
  }
}`;

  if (content.includes(oldMediaCss)) {
    content = content.replace(oldMediaCss, newMediaCss);
    console.log(`[${path.basename(file)}] Upgraded mobile media query for .journal-bg-grid!`);
  }

  fs.writeFileSync(file, content, 'utf-8');
  console.log(`[${path.basename(file)}] Done!\n`);
}
