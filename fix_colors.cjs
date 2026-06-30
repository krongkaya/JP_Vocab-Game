const fs = require('fs');
const path = require('path');

const cssPath = path.join(__dirname, 'src', 'BattleScreen.css');
let css = fs.readFileSync(cssPath, 'utf8');

// Replace background
css = css.replace(/linear-gradient\(160deg, #0f0c1a 0%, #1a1128 50%, #0d1a2e 100%\)/g, 'transparent');
css = css.replace(/\.battle-dark \{([\s\S]*?)\}/g, '.battle-dark {\n  /* Removed dark bg */\n}');

// Replace text colors
css = css.replace(/#f0eaff/ig, 'var(--text-main)');
css = css.replace(/#e9d5ff/ig, 'var(--text-main)');
css = css.replace(/#c9b8ff/ig, 'var(--text-muted)');
css = css.replace(/#a78bfa/ig, 'var(--text-muted)');

// Replace panel/card backgrounds
css = css.replace(/rgba\(255,\s*255,\s*255,\s*0\.0[45678]\)/g, 'var(--bg-card)');
css = css.replace(/rgba\(255,\s*255,\s*255,\s*0\.1\)/g, 'var(--border)');

// Replace borders
css = css.replace(/rgba\(255,\s*255,\s*255,\s*0\.[123][0-5]?\)/g, 'var(--border-strong)');

// Replace purples with primary/secondary variables if needed, but let's keep them as is for now 
// since the neon theme might still look okay on light mode if it's purplish, OR we can map them:
// css = css.replace(/#c084fc/ig, 'var(--purple)');
// css = css.replace(/#818cf8/ig, 'var(--primary)');
// css = css.replace(/rgba\(192,132,252,/g, 'rgba(176,124,255,'); // roughly purple

// Replace pure white text in buttons to adapt
css = css.replace(/color: white;/g, 'color: #fff;'); // Keep primary buttons white text

fs.writeFileSync(cssPath, css);
console.log('Replaced colors in BattleScreen.css');
