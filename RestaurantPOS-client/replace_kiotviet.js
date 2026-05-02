const fs = require('fs');
const path = require('path');
const componentsDir = path.join(__dirname, 'src', 'components');

function replaceInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;
  
  // Replace orange with emerald (KiotViet's signature green color)
  if (content.includes('orange')) {
    content = content.replace(/(bg|text|border|ring|shadow|from|to|via|hover:bg|hover:text|hover:border)-orange-([1-9]00|50)(\/[0-9]+)?/g, (match, p1, p2, p3) => {
      return `${p1}-emerald-${p2}${p3 || ''}`;
    });
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Replaced orange with emerald in: ' + filePath);
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
console.log('Done replacing colors.');
