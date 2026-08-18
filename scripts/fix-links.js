const fs = require('fs');
const path = require('path');

function fixHtmlFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');

  // Fix index.html links
  content = content.replace(/href=["']index\.html["']/g, 'href="/"');

  const pages = [
    'signin', 'register', 'dashboard', 'forgot-password', 'reset-password',
    'my-garden', 'settings', 'study-notes', 'advanced-filters', 'advanced-search'
  ];

  pages.forEach(p => {
    const regex1 = new RegExp('href=["\']' + p + '\\.html["\']', 'g');
    content = content.replace(regex1, 'href="/' + p + '"');
  });

  // Fix image src
  content = content.replace(/src=["']assets\/images\//g, 'src="/assets/images/');

  fs.writeFileSync(filePath, content, 'utf8');
  console.log('✅ Fixed links & image paths in:', filePath);
}

fixHtmlFile('index.html');
fs.readdirSync('pages').forEach(f => {
  if (f.endsWith('.html')) {
    fixHtmlFile(path.join('pages', f));
  }
});
