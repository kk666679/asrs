// Simple script to help identify pages that need theme updates
const fs = require('fs');
const path = require('path');

const appDir = path.join(__dirname, '../app');

function findPageFiles(dir) {
  const files = [];
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory() && !item.startsWith('.') && item !== 'api') {
      files.push(...findPageFiles(fullPath));
    } else if (item === 'page.tsx') {
      files.push(fullPath);
    }
  }
  
  return files;
}

const pageFiles = findPageFiles(appDir);

console.log('Pages that may need theme updates:');
pageFiles.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  const hasMotion = content.includes('motion');
  const hasGlass = content.includes('glass-effect');
  const hasPageWrapper = content.includes('PageWrapper');
  
  if (!hasMotion || !hasGlass) {
    console.log(`- ${file.replace(appDir, '')}`);
    console.log(`  Motion: ${hasMotion ? '✓' : '✗'}, Glass: ${hasGlass ? '✓' : '✗'}, PageWrapper: ${hasPageWrapper ? '✓' : '✗'}`);
  }
});

console.log('\nTheme components available:');
console.log('- PageWrapper: Consistent page layout with glassmorphism header');
console.log('- motion: Framer Motion animations');
console.log('- glass-effect: Glassmorphism styling');
console.log('- neon-border: Neon blue borders');
console.log('- gradient-text: Gradient text effects');