# 智能任务管理系统

基于 **Node.js (NestJS) + Supabase + React** 的全栈任务管理应用。中文界面，简洁美观，支持任务的添加、优先级管理、完成状态切换、删除与按优先级筛选。

## 功能特性

- 添加任务：输入框 + 优先级下拉（高 / 中 / 低）
- 任务列表：显示标题、优先级标签、完成状态
- 每条任务支持「完成 / 未完成」切换和「删除」
- 按优先级筛选：全部 / 高 / 中 / 低
- 任务按创建时间倒序显示
- 已完成任务标题自动加删除线

## 技术栈

- 后端：Node.js + NestJS + `@supabase/supabase-js`（通过 Supabase REST API 访问 `tasks` 表）
- 数据库：Supabase (PostgreSQL)
- 前端：React + Vite + Tailwind CSS

## 目录结构

```
├── client/    # React 前端
├── server/    # NestJS 后端（含 Supabase 数据层）
├── shared/    # 前后端共享类型
└── package.json
```

## 本地启动

1. 安装依赖：

```bash
npm install
```

2. 配置环境变量：复制 `.env.example` 为 `.env`，填入你的 Supabase 项目信息：

```bash
cp .env.example .env
```

```env
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_ANON_KEY=your-anon-publishable-key
```

3. 启动开发服务：

```bash
npm run dev
```

- 后端 API：`http://localhost:3000/api`
- 前端页面：`http://localhost:5173`

## Supabase 数据表

在 Supabase SQL Editor 中创建 `tasks` 表：

```sql
create table tasks (
  id bigint generated always as identity primary key,
  title text not null,
  priority text not null check (priority in ('高', '中', '低')),
  completed boolean not null default false,
  created_at timestamptz not null default now()
);
```

如需开启行级安全（RLS），可执行：

```sql
alter table tasks enable row level security;

create policy "anon can read tasks" on tasks for select to anon using (true);
create policy "anon can insert tasks" on tasks for insert to anon with check (true);
create policy "anon can update tasks" on tasks for update to anon using (true);
create policy "anon can delete tasks" on tasks for delete to anon using (true);
```

## API 接口

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/tasks?priority=high\|medium\|low` | 查询任务列表（按创建时间倒序，可按优先级筛选） |
| POST | `/api/tasks` | 添加任务（`{ title, priority }`） |
| PATCH | `/api/tasks/:id` | 更新任务（可更新 `title` / `priority` / `completed`） |
| DELETE | `/api/tasks/:id` | 删除任务 |
