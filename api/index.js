// Vercel Serverless 入口：复用 NestJS 应用（API + 服务端渲染 HTML + 静态资源）
const path = require('path');
const express = require('express');

const ROOT = path.join(__dirname, '..');
const DIST_SERVER = path.join(ROOT, 'dist', 'server');
const DIST_CLIENT = path.join(ROOT, 'dist', 'client');
// Vite 构建的 HTML 模板位于 dist/client/client/index.html
const DIST_VIEWS = path.join(DIST_CLIENT, 'client');

const server = express();
let initPromise = null;

async function bootstrap() {
  const { NestFactory } = require('@nestjs/core');
  const { ExpressAdapter } = require('@nestjs/platform-express');
  const { __express: hbsExpress } = require('hbs');
  const { AppModule } = require(path.join(DIST_SERVER, 'app.module.js'));

  // 静态资源（Vite 构建产物：JS/CSS/图片等）
  server.use(express.static(DIST_CLIENT, { index: false }));

  const app = await NestFactory.create(AppModule, new ExpressAdapter(server), {
    logger: ['error', 'warn'],
  });
  app.setBaseViewsDir(DIST_VIEWS);
  app.setViewEngine('html');
  app.engine('html', hbsExpress);
  await app.init();
}

module.exports = async (req, res) => {
  if (!initPromise) initPromise = bootstrap();
  await initPromise;
  server(req, res);
};
