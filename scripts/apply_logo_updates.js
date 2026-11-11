const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const INDEX_PATH = path.join(ROOT, 'index.html');
const APP_PATH = path.join(ROOT, 'app.html');

function updateLogoInFile(filePath) {
  console.log(`Updating paths in: ${filePath}`);
  let content = fs.readFileSync(filePath, 'utf-8');

  // Replace /assets/calverse-logo.png with assets/calverse-logo.png
  content = content.replaceAll('/assets/calverse-logo.png', 'assets/calverse-logo.png');

  // In head meta, keep full https:// for open graph
  content = content.replace('content="assets/calverse-logo.png"', 'content="https://thecalverse.com/assets/calverse-logo.png"');

  fs.writeFileSync(filePath, content, 'utf-8');
  console.log(`Saved: ${filePath}\n`);
}

updateLogoInFile(INDEX_PATH);
updateLogoInFile(APP_PATH);
console.log('Paths updated successfully!');
