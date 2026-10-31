const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const INDEX_PATH = path.join(ROOT, 'index.html');
const indexHtml = fs.readFileSync(INDEX_PATH, 'utf-8');

// Extract INFO object from index.html for static rendering
const infoMatch = indexHtml.match(/const INFO\s*=\s*(\{[\s\S]*?\n\};)/);
let INFO = {};
if (infoMatch) {
  try {
    const evalCode = infoMatch[0].replace('const INFO', 'INFO');
    eval(evalCode);
  } catch (e) {
    console.warn('Could not parse INFO object:', e);
  }
}

// Extract folder grids
const mathGridMatch = indexHtml.match(/<div class="mgrid" id="math-grid">([\s\S]*?)<\/div>/);
const physGridMatch = indexHtml.match(/<div class="mgrid" id="phys-grid">([\s\S]*?)<\/div>/);
const chemGridMatch = indexHtml.match(/<div class="mgrid" id="chem-grid">([\s\S]*?)<\/div>/);

const ROUTES = [
  {
    path: 'timer',
    title: 'Focus Study Timer & Pomodoro — Calverse',
    description: 'Free aesthetic online study timer with Pomodoro presets, custom countdown, stopwatch, and ambient study sounds.',
    screenId: 'sTimer',
    tab: 'timer'
  },
  {
    path: 'notes',
    title: 'Study Notes & Revision Workspace — Calverse',
    description: 'Clean, minimalist study notes and revision workspace with tags, notebooks, templates, and instant search.',
    screenId: 'sNotes',
    tab: 'notes'
  },
  {
    path: 'tracker',
    title: 'Study Habit & Daily Goal Tracker — Calverse',
    description: 'Track study habits, daily routines, progress streaks, and task checklists in one connected workspace.',
    screenId: 'sTracker',
    tab: 'tracker'
  },
  {
    path: 'journal',
    title: 'Digital Aesthetic Notebook & Journal — Calverse',
    description: 'Aesthetic digital paper notebook and daily journal with customized covers, pages, stickers, and tags.',
    screenId: 'sJournal',
    tab: 'journal'
  },
  {
    path: 'history',
    title: 'Calculation History & Log — Calverse',
    description: 'Review your past calculations, formulas, math results, and study steps in one persistent log.',
    screenId: 'sHist',
    tab: 'hist'
  },
  {
    path: 'calculators',
    title: 'All Study Calculators & Math Tools — Calverse',
    description: 'Over 24 specialized calculators for students: scientific, algebra, graphing, matrices, trigonometry, physics, and chemistry.',
    screenId: 'sCalcs'
  },
  {
    path: 'maths',
    title: 'Mathematics Formulas & Solvers — Calverse',
    description: 'Math tools, algebra solvers, trigonometry calculators, NCERT Class 11 formulas, and geometry tools.',
    screenId: 'sFolder',
    folderKey: 'math',
    folderTitle: 'Maths',
    folderMeta: 'Math tools and problem solvers',
    folderGrid: mathGridMatch ? mathGridMatch[1] : ''
  },
  {
    path: 'physics',
    title: 'Physics Formulas & Problem Solver — Calverse',
    description: 'Physics formula solvers, kinematics, mechanics, thermodynamics, electromagnetism, and constants.',
    screenId: 'sFolder',
    folderKey: 'phys',
    folderTitle: 'Physics',
    folderMeta: 'Physics tools and formulas',
    folderGrid: physGridMatch ? physGridMatch[1] : ''
  },
  {
    path: 'chemistry',
    title: 'Chemistry Formulas & Problem Solver — Calverse',
    description: 'Chemistry calculators, molar mass, gas laws, stoichiometry, thermochemistry, and equilibrium solvers.',
    screenId: 'sFolder',
    folderKey: 'chem',
    folderTitle: 'Chemistry',
    folderMeta: 'Chemistry tools and formulas',
    folderGrid: chemGridMatch ? chemGridMatch[1] : ''
  },
  {
    path: 'privacy-policy',
    title: 'Privacy Policy — Calverse',
    description: 'Calverse privacy policy explaining local data storage, cookies, third-party services, and user privacy.',
    screenId: 'sInfo',
    infoKey: 'privacy'
  },
  {
    path: 'terms',
    title: 'Terms & Conditions — Calverse',
    description: 'Terms of service and conditions for using the Calverse study workspace and tools.',
    screenId: 'sInfo',
    infoKey: 'terms'
  },
  {
    path: 'disclaimer',
    title: 'Disclaimer — Calverse',
    description: 'Disclaimer and educational use notice for Calverse calculators and study materials.',
    screenId: 'sInfo',
    infoKey: 'disclaimer'
  },
  {
    path: 'contact',
    title: 'Contact Us — Calverse',
    description: 'Get in touch with the Calverse team for feedback, questions, bug reports, and suggestions.',
    screenId: 'sInfo',
    infoKey: 'contact'
  },
  {
    path: 'about',
    title: 'About Calverse — The Calm Study Workspace',
    description: 'The story, philosophy, and features behind Calverse, built for focused student productivity.',
    screenId: 'sInfo',
    infoKey: 'about'
  },
  {
    path: 'scientific-calculator',
    title: 'Scientific Calculator Online — Calverse',
    description: 'Free scientific calculator with advanced functions, trigonometry, logarithms, powers, and calculation history.',
    screenId: 'sSci'
  },
  {
    path: 'graphing-calculator',
    title: 'Graphing Calculator Online — Calverse',
    description: 'Plot math functions, equations, curves, and roots in an interactive 2D coordinate grapher.',
    screenId: 'sGraph'
  },
  {
    path: 'matrix-calculator',
    title: 'Matrix Calculator Online — Calverse',
    description: 'Matrix addition, multiplication, determinants, inverses, eigenvalues, and transposes.',
    screenId: 'sMatrix'
  },
  {
    path: 'unit-converter',
    title: 'Unit Converter Online — Calverse',
    description: 'Convert length, mass, temperature, speed, area, volume, digital storage, and time units instantly.',
    screenId: 'sUnit'
  },
  {
    path: 'bmi-calculator',
    title: 'BMI Calculator — Calverse',
    description: 'Calculate your Body Mass Index (BMI), healthy weight ranges, and fitness status.',
    screenId: 'sBmi'
  },
  {
    path: 'age-calculator',
    title: 'Age Calculator — Calverse',
    description: 'Calculate your exact age in years, months, days, hours, and minutes with upcoming birthday countdown.',
    screenId: 'sAge'
  },
  {
    path: 'emi-calculator',
    title: 'Loan & EMI Calculator — Calverse',
    description: 'Calculate loan EMIs, interest breakdowns, payment schedules, and repayment totals.',
    screenId: 'sEmi'
  }
];

function buildPage(route) {
  let html = indexHtml;

  // Set page-specific Title
  html = html.replace(/<title>.*?<\/title>/, `<title>${route.title}</title>`);

  // Insert Meta Description & Canonical URL right after <base href="/">
  const metaTags = `
<meta name="description" content="${route.description}">
<link rel="canonical" href="https://thecalverse.com/${route.path}">
<meta property="og:title" content="${route.title}">
<meta property="og:description" content="${route.description}">
<meta property="og:url" content="https://thecalverse.com/${route.path}">
<meta property="og:type" content="website">`;

  html = html.replace('<base href="/">', `<base href="/">${metaTags}`);

  // Bypass splash immediately for crawlers and direct visits
  html = html.replace('<div id="sp" class="splash">', '<div id="sp" class="splash hide" style="display:none!important">');
  html = html.replace('<div id="app" class="app">', '<div id="app" class="app show">');

  // Deactivate Home screen
  html = html.replace('<div class="screen active" id="sHome">', '<div class="screen" id="sHome">');

  // Activate the route's screen
  if (route.screenId) {
    const targetScreenRegex = new RegExp(`<div class="screen" id="${route.screenId}">`);
    html = html.replace(targetScreenRegex, `<div class="screen active" id="${route.screenId}">`);
  }

  // Pre-render Info content for legal / about pages
  if (route.infoKey && INFO[route.infoKey]) {
    const infoData = INFO[route.infoKey];
    html = html.replace('<div class="stitle" id="info-title">About</div>', `<div class="stitle" id="info-title">${infoData.title}</div>`);
    html = html.replace('<div class="gp" id="info-body"></div>', `<div class="gp" id="info-body">${infoData.html}</div>`);
  }

  // Pre-render Folder content for Maths, Physics, Chemistry
  if (route.folderKey && route.folderGrid) {
    html = html.replace('<div class="stitle" id="folder-page-title">Folder</div>', `<div class="stitle" id="folder-page-title">${route.folderTitle}</div>`);
    html = html.replace('<div class="folder-page-meta" id="folder-page-meta">Tracker tools</div>', `<div class="folder-page-meta" id="folder-page-meta">${route.folderMeta}</div>`);
    html = html.replace('<div class="mgrid" id="folder-page-grid"></div>', `<div class="mgrid" id="folder-page-grid">${route.folderGrid}</div>`);
  }

  // Update Bottom Tab if route maps to a bottom tab
  if (route.tab) {
    html = html.replace('<div class="bni on" id="bn-home"', '<div class="bni" id="bn-home"');
    const tabRegex = new RegExp(`id="bn-${route.tab}"`);
    html = html.replace(tabRegex, `id="bn-${route.tab}" class="bni on"`);
  }

  const outDir = path.join(ROOT, route.path);
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }
  const outFile = path.join(outDir, 'index.html');
  fs.writeFileSync(outFile, html, 'utf-8');
  console.log(`Generated: /${route.path}/index.html (${(html.length / 1024).toFixed(1)} KB)`);
}

// Build all pages
console.log('Building dedicated Calverse pages for AdSense & SEO...');
ROUTES.forEach(buildPage);

// Generate sitemap.xml
const today = new Date().toISOString().split('T')[0];
const sitemapUrls = [
  { loc: 'https://thecalverse.com/', priority: '1.0' },
  ...ROUTES.map(r => ({
    loc: `https://thecalverse.com/${r.path}`,
    priority: r.path === 'timer' || r.path === 'notes' || r.path === 'maths' || r.path === 'physics' ? '0.9' : '0.8'
  }))
];

const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapUrls.map(u => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${u.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

fs.writeFileSync(path.join(ROOT, 'sitemap.xml'), sitemapXml, 'utf-8');
console.log(`Generated: sitemap.xml (${sitemapUrls.length} URLs)`);

// Generate robots.txt
const robotsTxt = `User-agent: *
Allow: /

Sitemap: https://thecalverse.com/sitemap.xml
`;

fs.writeFileSync(path.join(ROOT, 'robots.txt'), robotsTxt, 'utf-8');
console.log('Generated: robots.txt');

console.log('Multi-page build completed successfully!');
