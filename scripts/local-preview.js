// 本地预览服务：模拟 Vercel 线上形态（静态页面 + /api 函数），用于本地/测试机验证
// 用法：npm run build:client && node scripts/vercel-postbuild.js && node scripts/local-preview.js
// 环境变量：读取根目录 .env（SUPABASE_URL / SUPABASE_ANON_KEY），端口默认 3200
const http = require('http');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
require(path.join(root, 'node_modules', 'dotenv')).config({ path: path.join(root, '.env') });

const STATIC_DIR = path.join(root, 'dist', 'client');
const api = require(path.join(root, 'api', '[...route].js'));
const PORT = Number(process.env.PORT || 3200);

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.map': 'application/json',
};

http
  .createServer((req, res) => {
    const url = new URL(req.url, 'http://localhost');
    if (url.pathname.startsWith('/api/')) return api(req, res);

    let file = path.join(STATIC_DIR, decodeURIComponent(url.pathname));
    if (!fs.existsSync(file) || fs.statSync(file).isDirectory()) {
      file = path.join(STATIC_DIR, 'index.html'); // SPA 路由回退
    }
    res.setHeader('Content-Type', MIME[path.extname(file).toLowerCase()] || 'application/octet-stream');
    fs.createReadStream(file).pipe(res);
  })
  .listen(PORT, '127.0.0.1', () => {
    console.log(`本地预览已启动：http://127.0.0.1:${PORT}`);
  });
