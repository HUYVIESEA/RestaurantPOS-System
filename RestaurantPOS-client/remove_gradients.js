const fs = require('fs');
const path = require('path');
const componentsDir = path.join(__dirname, 'src', 'components');

function replaceInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;
  
  // Replace text gradients: bg-clip-text text-transparent bg-gradient-to-r from-... to-...
  const textGradientRegex = /bg-clip-text\s+text-transparent\s+bg-gradient-to-[a-z]+\s+from-[a-zA-Z0-9\[\]#-]+\s+to-[a-zA-Z0-9\[\]#-]+(\s+dark:from-[a-zA-Z0-9\[\]#-]+\s+dark:to-[a-zA-Z0-9\[\]#-]+)?/g;
  if (textGradientRegex.test(content)) {
    content = content.replace(textGradientRegex, 'text-orange-600 dark:text-orange-400');
    changed = true;
  }
  
  // Replace VnPay gradient specifically (if any)
  const vnpayRegex = /bg-gradient-to-r\s+from-\[#005C97\]\s+to-\[#363795\]/g;
  if (vnpayRegex.test(content)) {
      content = content.replace(vnpayRegex, 'bg-[#005C97]');
      changed = true;
  }

  // Replace background gradients with hovers: bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800
  const bgGradientWithHoverRegex = /bg-gradient-to-[a-z]+\s+from-orange-([0-9]+)\s+to-[a-z]+-([0-9]+)\s+hover:from-[a-z]+-([0-9]+)\s+hover:to-[a-z]+-([0-9]+)/g;
  if (bgGradientWithHoverRegex.test(content)) {
    content = content.replace(bgGradientWithHoverRegex, (match, from, to, hFrom, hTo) => {
        return `bg-orange-${from} hover:bg-orange-${hFrom}`;
    });
    changed = true;
  }

  // Replace remaining simple bg gradients (like from-orange-400 to-red-500)
  const simpleBgGradientRegex = /bg-gradient-to-[a-z]+\s+from-[a-z]+-([0-9]+)\s+to-[a-z]+-[0-9]+/g;
  if (simpleBgGradientRegex.test(content)) {
    content = content.replace(simpleBgGradientRegex, (match, from) => {
        // Just use the 'from' color weight as the solid orange color, but default to 500 if it looks like a weird value
        const weight = parseInt(from);
        if (weight >= 100 && weight <= 900) {
           return `bg-orange-${weight}`;
        }
        return 'bg-orange-500';
    });
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Removed gradients in: ' + filePath);
  }
}

function walk(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walk(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      replaceInFile(fullPath);
    }
  }
}

walk(componentsDir);
console.log('Done removing gradients.');
