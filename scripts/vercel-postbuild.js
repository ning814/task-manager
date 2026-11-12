// 构建后处理：把 Vite 输出的 index.html 放到站点根目录，并替换服务端模板占位符
const fs = require('fs');
const path = require('path');

const outDir = path.resolve(__dirname, '..', 'dist', 'client');
// 优先用原始模板 dist/client/client/index.html，避免对已替换过的文件重复处理
const candidates = [path.join(outDir, 'client', 'index.html'), path.join(outDir, 'index.html')];
const src = candidates.find((p) => fs.existsSync(p));

if (!src) {
  console.error('[vercel-postbuild] 未找到构建出的 index.html');
  process.exit(1);
}

// 静态托管没有平台服务端，这里给所有模板占位符填上安全默认值
const VALUES = {
  appName: '智能任务管理系统',
  appDescription: '智能任务管理系统：任务增删改查、优先级筛选、完成状态管理',
  appAvatar: '',
  appId: '',
  userId: '',
  tenantId: '',
  userName: '',
  csrfToken: '',
  environment: 'production',
  basename: '',
  __platform__: '{}',
};

let html = fs.readFileSync(src, 'utf8');
const resolve = (key) => (key in VALUES ? VALUES[key] : '');

// 先处理三花括号（原样输出），再处理双花括号
html = html.replace(/\{\{\{(.*?)\}\}\}/g, (_m, key) => resolve(key.trim()));
html = html.replace(/\{\{(.*?)\}\}/g, (_m, key) => resolve(key.trim()));

const dst = path.join(outDir, 'index.html');
fs.writeFileSync(dst, html);
console.log(`[vercel-postbuild] 已生成 ${dst}`);
