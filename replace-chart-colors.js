const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  // Replace #F5426A and #f52d68 with var(--primary) in string contexts
  // We match cases like fill="#F5426A", stopColor="#F5426A", fill: '#F5426A', stroke: "#F5426A", color: '#F5426A'
  
  content = content.replace(/["']#F5426A["']/gi, '`var(--primary)`');
  content = content.replace(/["']#f52d68["']/gi, '`var(--primary)`');
  // if it's already inside a string like `cell-${index}` fill={index % 2 === 0 ? '#F5426A' : '#fbcfe8'}
  // Wait, `var(--primary)` needs to be used as a string literal, e.g., 'var(--primary)' or "var(--primary)".
  
  // Let's do a safer string replace:
  content = originalContent.replace(/#F5426A/gi, 'var(--primary)');
  content = content.replace(/#f52d68/gi, 'var(--primary)');

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated: ${filePath}`);
  }
}

function traverseDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      traverseDir(fullPath);
    } else if (stat.isFile() && /\.(tsx|ts|js|jsx)$/.test(file)) {
      // Don't modify the layout or models where defaults are defined
      if (fullPath.includes('StoreSettings.ts') || fullPath.includes('layout.tsx') || fullPath.includes('appearance')) {
        continue;
      }
      processFile(fullPath);
    }
  }
}

traverseDir(srcDir);
console.log("Done replacing chart colors.");
