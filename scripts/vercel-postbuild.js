// 构建后处理：把 Vite 输出的 index.html 放到站点根目录，并替换服务端模板占位符
const fs = require('fs');
const path = require('path');

const outDir = path.resolve(__dirname, '..', 'dist', 'client');
const candidates = [path.join(outDir, 'client', 'index.html'), path.join(outDir, 'index.html')];
const src = candidates.find((p) => fs.existsSync(p));

if (!src) {
  console.error('[vercel-postbuild] 未找到构建出的 index.html');
  process.exit(1);
}

let html = fs.readFileSync(src, 'utf8');
// 服务端模板占位符在静态托管时替换为空对象，避免前端 JSON.parse 报错
html = html.replace(/\{\{\{__platform__\}\}\}/g, '{}');

const dst = path.join(outDir, 'index.html');
fs.writeFileSync(dst, html);
console.log(`[vercel-postbuild] 已生成 ${dst}`);
