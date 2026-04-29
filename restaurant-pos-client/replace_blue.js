const fs = require('fs');
const path = require('path');
const componentsDir = path.join(__dirname, 'src', 'components');

function replaceInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;
  
  // Replace emerald with blue (KiotViet's signature blue color)
  if (content.includes('emerald')) {
    content = content.replace(/(bg|text|border|ring|shadow|from|to|via|hover:bg|hover:text|hover:border)-emerald-([1-9]00|50)(\/[0-9]+)?/g, (match, p1, p2, p3) => {
      // In Tailwind, blue-600 is very close to KiotViet's primary brand blue
      return `${p1}-blue-${p2}${p3 || ''}`;
    });
    changed = true;
  }

  // Handle case where we might still have 'orange' somewhere that wasn't replaced properly before
  if (content.includes('orange')) {
    const orangeCount = (content.match(/(bg|text|border|ring|shadow|from|to|via|hover:bg|hover:text|hover:border)-orange-([1-9]00|50)(\/[0-9]+)?/g) || []).length;
    if (orangeCount > 0) {
      content = content.replace(/(bg|text|border|ring|shadow|from|to|via|hover:bg|hover:text|hover:border)-orange-([1-9]00|50)(\/[0-9]+)?/g, (match, p1, p2, p3) => {
        return `${p1}-blue-${p2}${p3 || ''}`;
      });
      changed = true;
    }
  }

  if (changed) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Replaced colors with blue in: ' + filePath);
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
