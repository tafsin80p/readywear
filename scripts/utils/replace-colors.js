const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

const colorRegexes = [
  /\[#F5426A\]/gi,
  /\[#F52D68\]/gi,
  /\[#ff6b8b\]/gi
];

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  // Replace primary colors
  content = content.replace(/\[#F5426A\]/gi, 'primary');
  content = content.replace(/\[#F52D68\]/gi, 'primary');
  
  // Replace the secondary gradient color with primary/80
  content = content.replace(/\[#ff6b8b\]/gi, 'primary/80');

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
      processFile(fullPath);
    }
  }
}

traverseDir(srcDir);
console.log("Done replacing colors.");
