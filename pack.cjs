const fs = require('fs');
const path = require('path');

let html = fs.readFileSync('dist/index.html', 'utf-8');

// 1. Inline the CSS
const cssLinkMatch = html.match(/<link[^>]+href="(\/_astro\/[^"]+\.css)"/);
if (cssLinkMatch) {
  const cssPath = path.join('dist', cssLinkMatch[1]);
  const css = fs.readFileSync(cssPath, 'utf-8');
  html = html.replace(cssLinkMatch[0], '<style>' + css + '</style>');
}

// 2. Inline all images as base64 data URIs
const imgPaths = new Set();
const imgRegex = /(src|srcset)="(\/images\/[^"]+)"/g;
let match;
while ((match = imgRegex.exec(html)) !== null) {
  imgPaths.add(match[2]);
}

for (const imgPath of imgPaths) {
  const fullPath = path.join('dist', imgPath);
  if (fs.existsSync(fullPath)) {
    const ext = path.extname(imgPath).slice(1);
    const mimeMap = { png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', webp: 'image/webp', svg: 'image/svg+xml' };
    const mime = mimeMap[ext] || 'application/octet-stream';
    const b64 = fs.readFileSync(fullPath).toString('base64');
    const dataUri = 'data:' + mime + ';base64,' + b64;
    // Replace all occurrences
    while (html.includes(imgPath)) {
      html = html.replace(imgPath, dataUri);
    }
  }
}

// 3. Inline favicon
const faviconMatch = html.match(/href="(\/favicon\.svg)"/);
if (faviconMatch) {
  const favPath = path.join('dist', faviconMatch[1]);
  if (fs.existsSync(favPath)) {
    const favB64 = fs.readFileSync(favPath).toString('base64');
    html = html.replace(faviconMatch[1], 'data:image/svg+xml;base64,' + favB64);
  }
}

// 4. Neutralize internal-page links (e.g. /x) that don't resolve in a flat file.
//    Becomes href="#" so clicks scroll to top rather than 404.
html = html.replace(/href="\/x"/g, 'href="#"');

// Write single file
const outPath = path.resolve('..', 'Vexienne_website_preview.html');
fs.writeFileSync(outPath, html);
const size = fs.statSync(outPath).size;
console.log('Created: ' + outPath);
console.log('Size: ' + Math.round(size / 1024) + ' KB');
