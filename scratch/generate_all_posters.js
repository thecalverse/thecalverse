const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const baseOutDir = path.join(process.env.HOME, 'Desktop/Calverse_Instagram_Ads');
const categories = [
  '01_Calculators',
  '02_Timer',
  '03_Journal',
  '04_Habits',
  '05_Notes'
];

for (const c of categories) {
  fs.mkdirSync(path.join(baseOutDir, c), { recursive: true });
}

const artifactDir = '/Users/maddhamsolanki/.gemini/antigravity/brain/be6235b4-47e3-4e08-a3c9-4f2598361eed';

// Load base64 of in-app screenshots
const screenDir = '/tmp/calverse_ad_screens';
const screens = {
  dash_dark: fs.existsSync(`${screenDir}/dash_dark.png`) ? fs.readFileSync(`${screenDir}/dash_dark.png`).toString('base64') : '',
  dash_latte: fs.existsSync(`${screenDir}/dash_latte.png`) ? fs.readFileSync(`${screenDir}/dash_latte.png`).toString('base64') : '',
  calc_sci_dark: fs.existsSync(`${screenDir}/calc_sci_dark.png`) ? fs.readFileSync(`${screenDir}/calc_sci_dark.png`).toString('base64') : '',
  calc_sci_latte: fs.existsSync(`${screenDir}/calc_sci_latte.png`) ? fs.readFileSync(`${screenDir}/calc_sci_latte.png`).toString('base64') : '',
  calc_matrix_dark: fs.existsSync(`${screenDir}/calc_matrix_dark.png`) ? fs.readFileSync(`${screenDir}/calc_matrix_dark.png`).toString('base64') : '',
  timer_dark: fs.existsSync(`${screenDir}/timer_dark.png`) ? fs.readFileSync(`${screenDir}/timer_dark.png`).toString('base64') : '',
  timer_latte: fs.existsSync(`${screenDir}/timer_latte.png`) ? fs.readFileSync(`${screenDir}/timer_latte.png`).toString('base64') : '',
  journal_dark: fs.existsSync(`${screenDir}/journal_dark.png`) ? fs.readFileSync(`${screenDir}/journal_dark.png`).toString('base64') : '',
  journal_latte: fs.existsSync(`${screenDir}/journal_latte.png`) ? fs.readFileSync(`${screenDir}/journal_latte.png`).toString('base64') : '',
  notes_dark: fs.existsSync(`${screenDir}/notes_dark.png`) ? fs.readFileSync(`${screenDir}/notes_dark.png`).toString('base64') : '',
  notes_latte: fs.existsSync(`${screenDir}/notes_latte.png`) ? fs.readFileSync(`${screenDir}/notes_latte.png`).toString('base64') : '',
  tracker_dark: fs.existsSync(`${screenDir}/tracker_dark.png`) ? fs.readFileSync(`${screenDir}/tracker_dark.png`).toString('base64') : '',
  tracker_latte: fs.existsSync(`${screenDir}/tracker_latte.png`) ? fs.readFileSync(`${screenDir}/tracker_latte.png`).toString('base64') : ''
};

// 50 Poster Definitions
const posters = [
  // --- 01 CALCULATORS (10) ---
  {
    category: '01_Calculators',
    num: 1,
    theme: 'dark',
    badge: 'CALCULATORS & FORMULAS',
    title: 'Stop Doing Math in Ugly Interfaces.',
    sub: 'Why juggle 5 clunky tools when one elegant academic sanctuary holds 25+ scientific, matrix, and formula solvers with zero clutter?',
    pills: ['✦ 25+ Solvers Built-in', '✦ Step-by-Step Breakdown', '✦ 100% Offline & Ad-Free'],
    screenKey: 'calc_sci_dark',
    cta: 'Download Calverse Free • App Store & Play Store'
  },
  {
    category: '01_Calculators',
    num: 2,
    theme: 'latte',
    badge: 'THE SCIENTIFIC SUITE',
    title: 'The Calculator That Respects Your Aesthetic.',
    sub: 'Designed for scholars who appreciate warm parchment tones, tactile inputs, and distraction-free mathematical precision.',
    pills: ['✦ Warm Cream Palette', '✦ Trigonometry & Logs', '✦ Zero Intrusive Ads'],
    screenKey: 'calc_sci_latte',
    cta: 'Experience Latte Mode • thecalverse.com'
  },
  {
    category: '01_Calculators',
    num: 3,
    theme: 'dark',
    badge: 'STEP-BY-STEP WORKING',
    title: 'Never Get Stuck on Homework Again.',
    sub: 'Every equation unfolds into clear, numbered methodological steps. Understand the logic behind the solution, not just the final number.',
    pills: ['✦ Formula Explanations', '✦ High-Contrast Steps', '✦ Clean Breakdown'],
    screenKey: 'calc_matrix_dark',
    cta: 'Master Every Formula with Calverse'
  },
  {
    category: '01_Calculators',
    num: 4,
    theme: 'latte',
    badge: 'LINEAR ALGEBRA & MATRICES',
    title: 'Matrices Solved in Under Five Seconds.',
    sub: 'Determinants, inverses, Gaussian elimination, and matrix multiplications. Clean visual grid layouts tailored for university mathematics.',
    pills: ['✦ Inverses & Determinants', '✦ Instant Eigenvalues', '✦ Fast Cell Navigation'],
    screenKey: 'calc_matrix_dark',
    cta: 'Built for Engineering & Math Majors'
  },
  {
    category: '01_Calculators',
    num: 5,
    theme: 'dark',
    badge: 'PHYSICS & CHEMISTRY SOLVERS',
    title: 'Kinematics to Stoichiometry in One Tap.',
    sub: 'Stop searching random formula websites during study sessions. All major physics and chemistry equations are indexed and ready to compute.',
    pills: ['✦ Mirror & Lens Formulas', '✦ Mole Concepts & Gas Laws', '✦ Unit Auto-Conversion'],
    screenKey: 'calc_sci_dark',
    cta: 'Your Complete STEM Companion'
  },
  {
    category: '01_Calculators',
    num: 6,
    theme: 'latte',
    badge: 'TRIGONOMETRY REIMAGINED',
    title: 'Degrees and Radians Without The Headache.',
    sub: 'Switch between DEG and RAD with a single glance. Full hyperbolic, inverse, and identity breakdowns in a calm, warm layout.',
    pills: ['✦ Instant DEG/RAD Toggle', '✦ Hyperbolic Functions', '✦ Precision Trigonometry'],
    screenKey: 'calc_sci_latte',
    cta: 'Study Smarter with Calverse'
  },
  {
    category: '01_Calculators',
    num: 7,
    theme: 'dark',
    badge: 'INSTANT SEARCH',
    title: 'Type Two Letters. Get The Exact Formula.',
    sub: 'Type "force", "quad", or "stat" into the universal search bar. Instant autocomplete connects you directly to the calculator you need.',
    pills: ['✦ Universal Smart Search', '✦ 35+ Search Keywords', '✦ Instant Jump Navigation'],
    screenKey: 'dash_dark',
    cta: 'Find Any Formula in Seconds'
  },
  {
    category: '01_Calculators',
    num: 8,
    theme: 'latte',
    badge: 'ZERO SUBSCRIPTIONS',
    title: 'A Calculator Shouldn\'t Cost $9.99/Month.',
    sub: 'Calverse is 100% free, runs completely offline, and doesn\'t gate essential academic tools behind paywalls or subscription traps.',
    pills: ['✦ Truly Free & Offline', '✦ No Hidden Paywalls', '✦ Battery Efficient'],
    screenKey: 'dash_latte',
    cta: 'Available Free on Web, iOS & Android'
  },
  {
    category: '01_Calculators',
    num: 9,
    theme: 'dark',
    badge: 'FROM HIGH SCHOOL TO UNI',
    title: 'One App For Every Semester of Your Life.',
    sub: 'From high school algebra and BMI calculations to university matrix algebra, Calverse evolves alongside your academic journey.',
    pills: ['✦ Multi-Disciplinary Suite', '✦ Basic to Advanced', '✦ Lifetime Utility'],
    screenKey: 'dash_dark',
    cta: 'Download Calverse Today'
  },
  {
    category: '01_Calculators',
    num: 10,
    theme: 'latte',
    badge: 'THE HOMEWORK WEAPON',
    title: 'The Ultimate Study Desk Companion.',
    sub: 'Pair your physical textbook with a calculator that matches your stationery. Beautiful, precise, and completely focused on your work.',
    pills: ['✦ Dark Academia & Latte', '✦ High Readability Fonts', '✦ Fast Touch Targets'],
    screenKey: 'calc_sci_latte',
    cta: 'Elevate Your Study Setup with Calverse'
  },

  // --- 02 TIMER (10) ---
  {
    category: '02_Timer',
    num: 1,
    theme: 'dark',
    badge: 'THE STUDY TIMER',
    title: 'Master The Art of Deep Study Flow.',
    sub: 'A tactile, ambient focus dial designed to help you sink into textbooks without notifications, social media dings, or anxiety.',
    pills: ['✦ Tactile Wheel Dial', '✦ Zero Screen Clutter', '✦ Deep Focus Immersion'],
    screenKey: 'timer_dark',
    cta: 'Start Your Flow State • thecalverse.com'
  },
  {
    category: '02_Timer',
    num: 2,
    theme: 'latte',
    badge: 'POMODORO MASTERY',
    title: 'The 50/10 Study Ritual That Saves GPAs.',
    sub: 'Scientifically calibrated study blocks that protect your focus and eliminate mental burnout. Work with intense clarity, rest with ease.',
    pills: ['✦ 25/5 & 50/10 Presets', '✦ Gentle Bell Chimes', '✦ Clean Progress Ring'],
    screenKey: 'timer_latte',
    cta: 'Study Smarter with Calverse'
  },
  {
    category: '02_Timer',
    num: 3,
    theme: 'dark',
    badge: 'TACTILE INTERACTION',
    title: 'Spin The Dial. Set Your Goal. Go.',
    sub: 'Physical feeling meets digital beauty. Smooth haptic wheel adjustments let you dial in your exact study minutes in a fraction of a second.',
    pills: ['✦ Kinetic Wheel Scrolling', '✦ Instant Quick Presets', '✦ Elegant Typography'],
    screenKey: 'timer_dark',
    cta: 'Experience Tactile Focus with Calverse'
  },
  {
    category: '02_Timer',
    num: 4,
    theme: 'latte',
    badge: 'MORNING STUDY AESTHETIC',
    title: 'Gentle Warmth for 6:00 AM Revision.',
    sub: 'Bright blue screens ruin early morning focus. Latte mode brings warm cream and espresso tones that wake your brain up naturally.',
    pills: ['✦ Eye-Friendly Cream Tones', '✦ Morning Study Presets', '✦ Calm Ambient Pace'],
    screenKey: 'timer_latte',
    cta: 'Wake Up to Latte Mode • Download Free'
  },
  {
    category: '02_Timer',
    num: 5,
    theme: 'dark',
    badge: 'DISTRACTION-FREE',
    title: 'No Social Feeds Inside Your Timer.',
    sub: 'Other apps bombard you with leaderboards, ads, and social gamification. Calverse gives you silence, elegance, and pure focus.',
    pills: ['✦ Minimalist Philosophy', '✦ Zero Ad Interruption', '✦ Offline Independence'],
    screenKey: 'timer_dark',
    cta: 'Reclaim Your Attention Span'
  },
  {
    category: '02_Timer',
    num: 6,
    theme: 'latte',
    badge: 'DESK COMPANION',
    title: 'Looks Stunning Beside Your Open Books.',
    sub: 'Prop your phone on your desk and let the vintage academic clock keep you accountable while you read, highlight, and solve.',
    pills: ['✦ Always-On Desk Display', '✦ Aesthetic Ambient Clock', '✦ Battery Optimized'],
    screenKey: 'timer_latte',
    cta: 'Your Ultimate Study Setup Essential'
  },
  {
    category: '02_Timer',
    num: 7,
    theme: 'dark',
    badge: 'BEAT PROCRASTINATION',
    title: 'The Cure for Overwhelming Exam Dread.',
    sub: 'Don\'t think about the 10 chapters. Just set the Calverse timer for 25 minutes. Once you start, momentum takes care of the rest.',
    pills: ['✦ Low-Friction Start', '✦ Psychological Flow', '✦ Milestone Chimes'],
    screenKey: 'timer_dark',
    cta: 'Beat Procrastination Today'
  },
  {
    category: '02_Timer',
    num: 8,
    theme: 'latte',
    badge: 'STUDY TIME TRACKING',
    title: 'Watch Your Focus Hours Accumulate.',
    sub: 'Build proof of your hard work. Every completed focus block reinforces your identity as a dedicated, disciplined scholar.',
    pills: ['✦ Automatic Session Logs', '✦ Daily Time Totals', '✦ Consistency Badges'],
    screenKey: 'timer_latte',
    cta: 'Track Every Minute of Mastery'
  },
  {
    category: '02_Timer',
    num: 9,
    theme: 'dark',
    badge: 'MIDNIGHT LIBRARY VIBE',
    title: 'For The Night Owls Chasing Excellence.',
    sub: 'Pitch-black OLED background with soft antique gold glyphs. Study late into the night without burning your retinas or losing sleep.',
    pills: ['✦ Pure Pitch Black #070708', '✦ Warm Gold Accents', '✦ Zero Blue Light Glare'],
    screenKey: 'timer_dark',
    cta: 'The Night Owl\'s Sanctuary'
  },
  {
    category: '02_Timer',
    num: 10,
    theme: 'latte',
    badge: 'STUDY SMARTER',
    title: 'Stamina Beats Cramming Every Single Time.',
    sub: 'Short, intentional focus intervals preserve cognitive energy. Walk into your exams confident, well-rested, and fully prepared.',
    pills: ['✦ Peak Mental Energy', '✦ Interval Pacing', '✦ High Exam Retention'],
    screenKey: 'timer_latte',
    cta: 'Download Calverse Free Today'
  },

  // --- 03 JOURNAL (10) ---
  {
    category: '03_Journal',
    num: 1,
    theme: 'dark',
    badge: 'THE ACADEMIC JOURNAL',
    title: 'Your Private Sanctuary of Thoughts.',
    sub: 'A dedicated space to record daily breakthroughs, lecture takeaways, campus memories, and philosophical reflections.',
    pills: ['✦ Leather & Velvet Look', '✦ Rich Markdown Support', '✦ 100% Private & Local'],
    screenKey: 'journal_dark',
    cta: 'Begin Your Academic Diary • thecalverse.com'
  },
  {
    category: '03_Journal',
    num: 2,
    theme: 'latte',
    badge: 'VINTAGE PARCHMENT',
    title: 'Digital Inking That Feels Like Real Paper.',
    sub: 'Warm cream paper texture, serif headers, and classic typography give your daily writing the sacred weight of a physical notebook.',
    pills: ['✦ Cream Paper Background', '✦ Cinzel & Playfair Type', '✦ Smooth Flowing Ink'],
    screenKey: 'journal_latte',
    cta: 'Write with Style in Latte Mode'
  },
  {
    category: '03_Journal',
    num: 3,
    theme: 'dark',
    badge: 'CREATIVE EXPRESSION',
    title: 'Vintage Stickers & Washi Tapes Built-In.',
    sub: 'Decorate your thoughts with vintage botanical stamps, wax seals, washi tape headers, and custom aesthetic tags.',
    pills: ['✦ 50+ Custom Stickers', '✦ Vintage Washi Tapes', '✦ Infinite Layout Freedom'],
    screenKey: 'journal_dark',
    cta: 'Express Your Academic Aesthetic'
  },
  {
    category: '03_Journal',
    num: 4,
    theme: 'latte',
    badge: 'NIGHTLY DECOMPRESSION',
    title: 'Dump Your Mental Clutter Before Sleep.',
    sub: 'Empty your brain of exam anxiety and tomorrow\'s to-do list. Five minutes of nightly journaling cuts stress in half.',
    pills: ['✦ Mindful Mental Defrag', '✦ Anxiety Reduction', '✦ Better Sleep Quality'],
    screenKey: 'journal_latte',
    cta: 'Sleep Peacefully with Calverse'
  },
  {
    category: '03_Journal',
    num: 5,
    theme: 'dark',
    badge: 'PRIVACY FIRST',
    title: 'Your Secrets Never Touch a Corporate Cloud.',
    sub: 'Your diary entries stay locked on your device. No analytics trackers, no account mandatory, and complete offline autonomy.',
    pills: ['✦ On-Device Storage', '✦ Zero Cloud Data Mining', '✦ One-Click Backup'],
    screenKey: 'journal_dark',
    cta: 'True Privacy for Your Reflections'
  },
  {
    category: '03_Journal',
    num: 6,
    theme: 'latte',
    badge: 'SEMESTER ARCHIVE',
    title: 'Look Back At How Much You Grew.',
    sub: 'In 3 years, you won\'t remember what you studied in week 4—unless you wrote it down. Build an irreplaceable archive of your university years.',
    pills: ['✦ Searchable Archives', '✦ Date & Tag Filtering', '✦ Memory Timeline'],
    screenKey: 'journal_latte',
    cta: 'Build Your Personal Time Capsule'
  },
  {
    category: '03_Journal',
    num: 7,
    theme: 'dark',
    badge: 'MIDNIGHT REFLECTIONS',
    title: 'When Inspiration Strikes at 2:00 AM.',
    sub: 'Open Calverse, switch to Pitch Black mode, and capture your sudden ideas before they vanish into the dark.',
    pills: ['✦ Fast Instant Launch', '✦ Gentle Low Light UI', '✦ Cloud & Device Sync'],
    screenKey: 'journal_dark',
    cta: 'Capture Every Midnight Epiphany'
  },
  {
    category: '03_Journal',
    num: 8,
    theme: 'latte',
    badge: 'DAILY PROMPTS',
    title: 'Never Stare at a Blank Page Again.',
    sub: 'Thought-provoking academic and mindfulness prompts guide your pen when words don\'t come easily.',
    pills: ['✦ Built-in Study Prompts', '✦ Gratitude & Reflections', '✦ Effortless Writing'],
    screenKey: 'journal_latte',
    cta: 'Start Writing in Seconds'
  },
  {
    category: '03_Journal',
    num: 9,
    theme: 'dark',
    badge: 'MULTI-DEVICE HARMONY',
    title: 'Write on Phone. Review on MacBook.',
    sub: 'Your thoughts flow seamlessly across your iPhone, Android, and Mac desktop app. Instant continuity wherever you sit.',
    pills: ['✦ iOS, Android & macOS', '✦ Unified Experience', '✦ Seamless Portability'],
    screenKey: 'journal_dark',
    cta: 'Cross-Platform Academic Freedom'
  },
  {
    category: '03_Journal',
    num: 10,
    theme: 'latte',
    badge: 'ACADEMIC LIFE BALANCE',
    title: 'You Are More Than Just Your Grades.',
    sub: 'Amidst relentless problem sets and grading curves, your journal keeps your humanity, passions, and dreams front and center.',
    pills: ['✦ Holistic Student Life', '✦ Emotional Clarity', '✦ Lifelong Keepsake'],
    screenKey: 'journal_latte',
    cta: 'Download Calverse Free Today'
  },

  // --- 04 HABITS / TRACKER (10) ---
  {
    category: '04_Habits',
    num: 1,
    theme: 'dark',
    badge: 'HABIT & DISCIPLINE TRACKER',
    title: 'Consistency Is The Only Unfair Advantage.',
    sub: 'Geniuses fail without discipline. Build daily study habits that compound silently until top marks feel completely inevitable.',
    pills: ['✦ Streak Visualizer', '✦ Daily Micro-Checkins', '✦ High Impact Momentum'],
    screenKey: 'tracker_dark',
    cta: 'Build Real Consistency • thecalverse.com'
  },
  {
    category: '04_Habits',
    num: 2,
    theme: 'latte',
    badge: 'GENTLE ACCOUNTABILITY',
    title: 'Track Progress Without Toxic Guilt.',
    sub: 'No annoying push notifications screaming at you. Just clean, aesthetic circles waiting to be filled each productive day.',
    pills: ['✦ Calm Visual Progress', '✦ Custom Study Goals', '✦ Zero Guilt-Tripping'],
    screenKey: 'tracker_latte',
    cta: 'A Healthier Way to Track Habits'
  },
  {
    category: '04_Habits',
    num: 3,
    theme: 'dark',
    badge: 'THE ACADEMIC STACK',
    title: 'Reading. Problem Sets. Active Recall.',
    sub: 'Pre-loaded with habits proven to raise GPAs: 30 minutes of deep reading, daily math problem sets, and targeted flashcards.',
    pills: ['✦ Academic Presets', '✦ Custom Category Tags', '✦ Instant One-Tap Log'],
    screenKey: 'tracker_dark',
    cta: 'Optimize Your Study Routine'
  },
  {
    category: '04_Habits',
    num: 4,
    theme: 'latte',
    badge: 'MORNING & NIGHT RITUALS',
    title: 'Win The Morning. Conquer The Day.',
    sub: 'Anchor your day with two essential routines: a structured morning study sprint and an evening review session.',
    pills: ['✦ Routine Grouping', '✦ Habit Time Stamps', '✦ Daily Completion Score'],
    screenKey: 'tracker_latte',
    cta: 'Design Your Ideal Study Day'
  },
  {
    category: '04_Habits',
    num: 5,
    theme: 'dark',
    badge: 'VISUAL STREAKS',
    title: 'Never Break The Chain.',
    sub: 'Psychology shows visual chains trigger our brain\'s protective instincts. Once you hit day 14, you simply won\'t quit.',
    pills: ['✦ Gold Streak Flames', '✦ Milestone Celebrations', '✦ Habit Longevity'],
    screenKey: 'tracker_dark',
    cta: 'Ignite Your Study Streak Today'
  },
  {
    category: '04_Habits',
    num: 6,
    theme: 'latte',
    badge: 'STUDENT WELLNESS',
    title: 'Sleep and Hydration Fuel Top GPAs.',
    sub: 'You can\'t think clearly on 4 hours of sleep. Track water intake, 8-hour sleep goals, and outdoor walks right next to your study targets.',
    pills: ['✦ Mind & Body Balance', '✦ Water & Sleep Tracking', '✦ Sustained Energy'],
    screenKey: 'tracker_latte',
    cta: 'Protect Your Academic Stamina'
  },
  {
    category: '04_Habits',
    num: 7,
    theme: 'dark',
    badge: 'DISCIPLINE OVER MOTIVATION',
    title: 'Motivation Fades. Habits Endure.',
    sub: 'On days you don\'t feel like studying, your habit tracker reminds you who you are becoming. Show up anyway.',
    pills: ['✦ Identity-Based Habits', '✦ Long-Term Compounding', '✦ Stoic Study Discipline'],
    screenKey: 'tracker_dark',
    cta: 'Build Unshakable Academic Grit'
  },
  {
    category: '04_Habits',
    num: 8,
    theme: 'latte',
    badge: 'AESTHETIC HABIT GRIDS',
    title: 'Pure Satisfaction in Every Filled Circle.',
    sub: 'Watch your monthly calendar turn golden as your consistency solidifies. The most satisfying feeling in university life.',
    pills: ['✦ Monthly Heatmaps', '✦ Latte Color Shading', '✦ Visual Reward Loop'],
    screenKey: 'tracker_latte',
    cta: 'Experience Aesthetic Habit Tracking'
  },
  {
    category: '04_Habits',
    num: 9,
    theme: 'dark',
    badge: 'NO CLUTTER',
    title: 'Zero Over-Engineered Nonsense.',
    sub: 'No convoluted RPG stats, virtual pets dying, or endless menus. Just tap, check, and get back to your real-life books.',
    pills: ['✦ 3-Second Check-ins', '✦ Minimalist Design', '✦ Rapid Responsiveness'],
    screenKey: 'tracker_dark',
    cta: 'Cut The Noise with Calverse'
  },
  {
    category: '04_Habits',
    num: 10,
    theme: 'latte',
    badge: 'TRANSFORM YOUR SEMESTER',
    title: 'Start Small. Dream Monolithic.',
    sub: 'Two habits a day can reshape your entire academic trajectory. Start your streak today on Calverse.',
    pills: ['✦ Accessible to Everyone', '✦ 100% Free Forever', '✦ iOS, Android & Web'],
    screenKey: 'tracker_latte',
    cta: 'Download Calverse Free Now'
  },

  // --- 05 NOTES (10) ---
  {
    category: '05_Notes',
    num: 1,
    theme: 'latte',
    badge: 'DIGITAL NOTEBOOKS',
    title: 'Cream Dotted Paper That Never Runs Out.',
    sub: 'The warmth and tactile comfort of premium Japanese stationery, combined with infinite digital canvas freedom.',
    pills: ['✦ Cream Dotted Grid', '✦ Fluid Inking Engine', '✦ Zero Paper Waste'],
    screenKey: 'notes_latte',
    cta: 'Open Your Dotted Notebook • thecalverse.com'
  },
  {
    category: '05_Notes',
    num: 2,
    theme: 'dark',
    badge: 'DARK ACADEMIA NOTES',
    title: 'Lecture Notes That Look Like Works of Art.',
    sub: 'Dark mode notebook pages with antique gold ink and crisp serif typography. Transform boring class notes into medieval manuscripts.',
    pills: ['✦ Pure Pitch Black Pages', '✦ Gold & White Ink', '✦ Formula Embedding'],
    screenKey: 'notes_dark',
    cta: 'Elevate Your Lecture Notes'
  },
  {
    category: '05_Notes',
    num: 3,
    theme: 'latte',
    badge: 'DRAW, TYPE & ANNOTATE',
    title: 'Complete Freedom for Visual Thinkers.',
    sub: 'Scribble diagrams, type structured bullet points, insert formula screenshots, and highlight key terms with zero friction.',
    pills: ['✦ Freehand Pen & Brush', '✦ Clean Typography', '✦ Infinite Zoom & Pan'],
    screenKey: 'notes_latte',
    cta: 'Unleash Your Study Creativity'
  },
  {
    category: '05_Notes',
    num: 4,
    theme: 'dark',
    badge: 'SUBJECT BINDERS',
    title: 'A Dedicated Notebook for Every Class.',
    sub: 'Keep Physics, Organic Chemistry, Calculus, and Philosophy organized in separate virtual leather binders with custom spine labels.',
    pills: ['✦ Unlimited Notebooks', '✦ Custom Book Covers', '✦ Instant Subject Search'],
    screenKey: 'notes_dark',
    cta: 'Organize Your Entire Semester'
  },
  {
    category: '05_Notes',
    num: 5,
    theme: 'latte',
    badge: 'FORMULA INTEGRATION',
    title: 'Calculate Directly Inside Your Notes.',
    sub: 'Why switch between notes and calculators? Copy equations, results, and step-by-step breakdowns straight into your notebook pages.',
    pills: ['✦ Integrated Math Engine', '✦ One-Tap Paste Working', '✦ Pristine Formatting'],
    screenKey: 'notes_latte',
    cta: 'The Only Unified Study Notebook'
  },
  {
    category: '05_Notes',
    num: 6,
    theme: 'dark',
    badge: 'ZERO EYE STRAIN',
    title: 'Study 6 Hours Without Burning Your Eyes.',
    sub: 'Specially calibrated low-contrast black and sepia ink palettes designed to prevent visual fatigue during finals week all-nighters.',
    pills: ['✦ Ergonomic Contrast', '✦ Low-Blue Light Palette', '✦ Night Mode Reading'],
    screenKey: 'notes_dark',
    cta: 'Protect Your Eyes During Finals'
  },
  {
    category: '05_Notes',
    num: 7,
    theme: 'latte',
    badge: 'INSTANT BACKUP',
    title: 'Never Lose A Page of Study Notes Again.',
    sub: 'Coffee spills and lost spiral binders are history. Export your notebooks to PDF or backup locally with a single tap.',
    pills: ['✦ Instant PDF Export', '✦ Safe Local Backup', '✦ Offline Resilient'],
    screenKey: 'notes_latte',
    cta: 'Carry Your Library Safely'
  },
  {
    category: '05_Notes',
    num: 8,
    theme: 'dark',
    badge: 'THE GOODNOTES ALTERNATIVE',
    title: 'The GoodNotes Aesthetic. Without The Price Tag.',
    sub: 'All the beloved dotted grids, washi tapes, and vintage paper textures you see on studygram, completely free in Calverse.',
    pills: ['✦ Studygram Aesthetic', '✦ High-Res Canvas', '✦ Completely Free'],
    screenKey: 'notes_dark',
    cta: 'Download Calverse for Tablet & Phone'
  },
  {
    category: '05_Notes',
    num: 9,
    theme: 'latte',
    badge: 'HIGHLIGHTER & PRECISION',
    title: 'Color Code Your Exam Revision.',
    sub: 'Soft pastel highlighters in sage mint, vintage rose, warm latte, and soft amber. Turn textbook walls of text into scannable summaries.',
    pills: ['✦ 12 Aesthetic Highlighters', '✦ Layer Transparency', '✦ Precision Eraser'],
    screenKey: 'notes_latte',
    cta: 'Color Code Your Path to Top Marks'
  },
  {
    category: '05_Notes',
    num: 10,
    theme: 'dark',
    badge: 'ALL-IN-ONE HARMONY',
    title: 'Calculator. Timer. Journal. Habits. Notes.',
    sub: 'Everything a modern scholar needs, perfectly unified under one dark academia roof. The only companion you need this semester.',
    pills: ['✦ 5 Apps in One Sanctuary', '✦ Pure Academic Focus', '✦ Free on All Devices'],
    screenKey: 'notes_dark',
    cta: 'Join Thousands of Scholars on Calverse'
  }
];

function generatePosterHtml(p) {
  const isDark = p.theme === 'dark';
  const screenB64 = screens[p.screenKey] || screens.dash_dark;

  // Color schemes
  const bg = isDark
    ? 'radial-gradient(circle at 50% 12%, #191c24 0%, #0c0e12 40%, #070708 100%)'
    : 'radial-gradient(circle at 50% 12%, #ffffff 0%, #f7f0e6 45%, #ece0d1 100%)';
  const textColor = isDark ? '#ffffff' : '#2b1b11';
  const subtextColor = isDark ? 'rgba(230,225,215,0.78)' : '#5a4233';
  const accentGold = isDark ? '#dfbe95' : '#8c5932';
  const badgeBg = isDark ? 'rgba(223,190,149,0.12)' : 'rgba(140,89,50,0.12)';
  const badgeBorder = isDark ? 'rgba(223,190,149,0.3)' : 'rgba(140,89,50,0.3)';
  const cardBorder = isDark ? 'rgba(255,255,255,0.12)' : 'rgba(100,65,40,0.14)';
  const pillBg = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.7)';
  const pillText = isDark ? '#e8dccb' : '#3d291c';
  const ctaBg = isDark
    ? 'linear-gradient(135deg, #dfbe95 0%, #b89163 100%)'
    : 'linear-gradient(135deg, #442a1a 0%, #2b180d 100%)';
  const ctaText = isDark ? '#14120e' : '#fcf8f2';
  const shadow = isDark
    ? '0 30px 80px rgba(0,0,0,0.85), 0 0 40px rgba(223,190,149,0.08)'
    : '0 25px 65px rgba(110,80,50,0.22), 0 0 30px rgba(200,160,120,0.15)';

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700;800;900&family=Playfair+Display:ital,wght@0,600;0,700;0,800;1,600&family=Caveat:wght@600;700&display=swap');
* { margin:0; padding:0; box-sizing:border-box; }
body {
  width: 1080px;
  height: 1350px;
  background: ${bg};
  color: ${textColor};
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', sans-serif;
  overflow: hidden;
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 60px 70px 54px;
}

/* Subtle decorative grain & vintage borders */
.v-frame {
  position: absolute;
  inset: 22px;
  border: 1px solid ${isDark ? 'rgba(223,190,149,0.2)' : 'rgba(140,89,50,0.22)'};
  pointer-events: none;
  border-radius: 12px;
}
.v-frame-inner {
  position: absolute;
  inset: 28px;
  border: 1px dashed ${isDark ? 'rgba(223,190,149,0.1)' : 'rgba(140,89,50,0.12)'};
  pointer-events: none;
  border-radius: 8px;
}

/* Header */
.header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
  z-index: 5;
}
.brand {
  display: flex;
  align-items: center;
  gap: 12px;
}
.brand-mark {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  background: ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(80,50,30,0.08)'};
  border: 1px solid ${cardBorder};
  display: grid;
  place-items: center;
  font-size: 20px;
  color: ${accentGold};
}
.brand-name {
  font-family: 'Cinzel', serif;
  font-size: 22px;
  font-weight: 800;
  letter-spacing: 5px;
  color: ${textColor};
}
.header-tag {
  font-family: 'Cinzel', serif;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 2.5px;
  color: ${accentGold};
  text-transform: uppercase;
}

/* Copy Block */
.copy-block {
  margin-top: 24px;
  position: relative;
  z-index: 5;
  max-width: 940px;
}
.badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: ${badgeBg};
  border: 1px solid ${badgeBorder};
  color: ${accentGold};
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 2px;
  text-transform: uppercase;
  margin-bottom: 16px;
}
.title {
  font-family: 'Playfair Display', serif;
  font-size: 52px;
  font-weight: 800;
  line-height: 1.14;
  letter-spacing: -0.5px;
  color: ${textColor};
  margin-bottom: 14px;
}
.subtitle {
  font-size: 19px;
  line-height: 1.48;
  color: ${subtextColor};
  max-width: 880px;
  font-weight: 450;
}

/* Visual Mockup Container */
.mockup-container {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1;
  margin: 18px 0;
  z-index: 4;
}
.phone-chassis {
  width: 375px;
  height: 610px;
  border-radius: 44px;
  background: #000;
  padding: 10px;
  box-shadow: ${shadow};
  border: 4px solid ${isDark ? '#2d2e33' : '#d2c0ab'};
  position: relative;
  overflow: hidden;
}
.phone-notch {
  position: absolute;
  top: 14px;
  left: 50%;
  transform: translateX(-50%);
  width: 90px;
  height: 18px;
  background: #000;
  border-radius: 10px;
  z-index: 10;
}
.phone-screen {
  width: 100%;
  height: 100%;
  border-radius: 36px;
  overflow: hidden;
  background: ${isDark ? '#070708' : '#e4d2bf'};
  position: relative;
}
.phone-screen img {
  width: 100%;
  height: auto;
  display: block;
}

/* Side aesthetic stamp / note */
.side-stamp {
  position: absolute;
  right: 40px;
  bottom: 120px;
  background: ${isDark ? 'rgba(25,27,33,0.85)' : 'rgba(255,252,248,0.92)'};
  border: 1px solid ${cardBorder};
  backdrop-filter: blur(16px);
  padding: 16px 20px;
  border-radius: 16px;
  box-shadow: 0 16px 36px rgba(0,0,0,0.18);
  max-width: 260px;
  transform: rotate(3deg);
  z-index: 8;
}
.stamp-quote {
  font-family: 'Caveat', cursive;
  font-size: 21px;
  line-height: 1.25;
  color: ${isDark ? '#f0dfcb' : '#4a2f1c'};
}

/* Feature Pills Row */
.pills-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 14px;
  margin-bottom: 24px;
  position: relative;
  z-index: 5;
}
.pill {
  background: ${pillBg};
  border: 1px solid ${cardBorder};
  color: ${pillText};
  padding: 10px 18px;
  border-radius: 30px;
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 0.4px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.06);
}

/* Footer CTA */
.footer-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 18px;
  border-top: 1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(100,65,40,0.12)'};
  position: relative;
  z-index: 5;
}
.cta-btn {
  background: ${ctaBg};
  color: ${ctaText};
  font-family: 'Cinzel', serif;
  font-size: 14px;
  font-weight: 800;
  letter-spacing: 2px;
  padding: 14px 28px;
  border-radius: 30px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.2);
}
.footer-meta {
  font-size: 14px;
  color: ${subtextColor};
  font-weight: 550;
  letter-spacing: 0.5px;
}
</style>
</head>
<body>
  <div class="v-frame"></div>
  <div class="v-frame-inner"></div>

  <!-- Header -->
  <div class="header-row">
    <div class="brand">
      <div class="brand-mark">∿</div>
      <div class="brand-name">CALVERSE</div>
    </div>
    <div class="header-tag">THE ACADEMIA SANCTUARY • VOL. ${String(p.num).padStart(2, '0')}/10</div>
  </div>

  <!-- Headline & Value Prop -->
  <div class="copy-block">
    <div class="badge">${p.badge}</div>
    <h1 class="title">${p.title}</h1>
    <p class="subtitle">${p.sub}</p>
  </div>

  <!-- Device Mockup Showcase -->
  <div class="mockup-container">
    <div class="phone-chassis">
      <div class="phone-notch"></div>
      <div class="phone-screen">
        <img src="data:image/png;base64,${screenB64}" alt="Calverse App Screenshot">
      </div>
    </div>
    <div class="side-stamp">
      <div class="stamp-quote">"The sanctuary where serious study feels effortless & beautiful."</div>
    </div>
  </div>

  <!-- Feature Pills -->
  <div class="pills-row">
    ${p.pills.map(pill => `<div class="pill">${pill}</div>`).join('')}
  </div>

  <!-- Footer CTA -->
  <div class="footer-row">
    <div class="cta-btn">GET CALVERSE FREE</div>
    <div class="footer-meta">${p.cta}</div>
  </div>
</body>
</html>`;
}

// Master rendering loop
async function run() {
  console.log(`Starting generation of ${posters.length} Instagram Posters (1080x1350)...`);

  const chromePort = 9348;
  const chrome = spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', [
    '--headless=new',
    `--remote-debugging-port=${chromePort}`,
    '--no-first-run',
    '--disable-gpu',
    '--user-data-dir=/tmp/chrome_posters_profile'
  ]);
  await new Promise(r => setTimeout(r, 1500));

  try {
    const tabRes = await fetch(`http://127.0.0.1:${chromePort}/json/new?about:blank`, { method: 'PUT' });
    const tab = await tabRes.json();
    const ws = new WebSocket(tab.webSocketDebuggerUrl);

    const send = (method, params = {}) => new Promise((resolve, reject) => {
      const id = Math.floor(Math.random() * 100000);
      const handler = (e) => {
        const m = JSON.parse(e.data);
        if (m.id === id) {
          ws.removeEventListener('message', handler);
          if (m.error) reject(new Error(JSON.stringify(m.error)));
          else resolve(m.result);
        }
      };
      ws.addEventListener('message', handler);
      ws.send(JSON.stringify({ id, method, params }));
    });

    ws.addEventListener('open', async () => {
      console.log('Connected to Chrome DevTools Protocol for Poster Rendering');
      await send('Page.enable');
      await send('DOM.enable');

      // Set standard Instagram 4:5 vertical portrait: 1080x1350
      await send('Emulation.setDeviceMetricsOverride', {
        width: 1080,
        height: 1350,
        deviceScaleFactor: 1,
        mobile: false
      });

      for (let i = 0; i < posters.length; i++) {
        const p = posters[i];
        const html = generatePosterHtml(p);

        // Load HTML via Page.setDocumentContent or data URL
        const dataUrl = 'data:text/html;charset=utf-8,' + encodeURIComponent(html);
        await send('Page.navigate', { url: dataUrl });

        // Allow web fonts & layout to render
        await new Promise(r => setTimeout(r, 140));

        const screenshot = await send('Page.captureScreenshot', { format: 'png' });
        const fileName = `Poster_${String(p.num).padStart(2, '0')}.png`;
        const filePath = path.join(baseOutDir, p.category, fileName);
        fs.writeFileSync(filePath, Buffer.from(screenshot.data, 'base64'));

        // Copy first poster of each category to artifact directory for presentation
        if (p.num === 1) {
          const sampleArtifact = path.join(artifactDir, `ad_sample_${p.category.toLowerCase()}.png`);
          fs.writeFileSync(sampleArtifact, Buffer.from(screenshot.data, 'base64'));
        }

        console.log(`[${i + 1}/${posters.length}] Generated: ${p.category}/${fileName} (${p.theme.toUpperCase()})`);
      }

      console.log('ALL 50 POSTERS GENERATED SUCCESSFULLY!');
      chrome.kill();
      process.exit(0);
    });
  } catch (err) {
    console.error('Error in poster generator:', err);
    chrome.kill();
    process.exit(1);
  }
}

run();
