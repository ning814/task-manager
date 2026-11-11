// Vercel Serverless API：轻量实现（不启动 NestJS，冷启动快）
// 路由：GET/POST /api/tasks、PATCH/DELETE /api/tasks/:id
const { createClient } = require('@supabase/supabase-js');

const PRIORITY_TO_DB = { high: '高', medium: '中', low: '低' };
const PRIORITY_FROM_DB = { 高: 'high', 中: 'medium', 低: 'low' };

let client = null;

function getClient() {
  if (!client) {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_ANON_KEY;
    if (!url || !key) {
      throw new Error('缺少环境变量 SUPABASE_URL / SUPABASE_ANON_KEY，请在 Vercel 项目设置中配置');
    }
    client = createClient(url, key, { auth: { persistSession: false } });
  }
  return client;
}

function mapRow(row) {
  return {
    id: String(row.id),
    title: row.title,
    priority: PRIORITY_FROM_DB[row.priority] ?? 'medium',
    completed: row.completed,
    createdAt: new Date(row.created_at).toISOString(),
  };
}

function send(res, status, body) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(body));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', (chunk) => (raw += chunk));
    req.on('end', () => {
      try {
        resolve(raw ? JSON.parse(raw) : {});
      } catch {
        reject(new Error('请求体不是合法的 JSON'));
      }
    });
    req.on('error', reject);
  });
}

module.exports = async (req, res) => {
  try {
    const url = new URL(req.url, 'http://localhost');
    const path = url.pathname.replace(/^\/api\/index$/, '/api/tasks');
    // 允许 /api/tasks 与 /api/tasks/:id
    const m = path.match(/^\/api\/tasks(?:\/(\d+))?$/);
    if (!m) return send(res, 404, { message: '接口不存在' });

    const id = m[1];
    const sb = getClient();

    // 查询列表
    if (req.method === 'GET' && !id) {
      const priority = url.searchParams.get('priority');
      let query = sb.from('tasks').select('*').order('created_at', { ascending: false });
      if (priority && PRIORITY_TO_DB[priority]) {
        query = query.eq('priority', PRIORITY_TO_DB[priority]);
      }
      const { data, error } = await query;
      if (error) throw error;
      return send(res, 200, { items: (data || []).map(mapRow) });
    }

    // 新增任务
    if (req.method === 'POST' && !id) {
      const body = await readBody(req);
      const title = String(body.title ?? '').trim();
      if (!title) return send(res, 400, { message: '任务标题不能为空' });
      const { data, error } = await sb
        .from('tasks')
        .insert({ title, priority: PRIORITY_TO_DB[body.priority] ?? '中' })
        .select()
        .single();
      if (error) throw error;
      return send(res, 200, mapRow(data));
    }

    // 更新任务
    if (req.method === 'PATCH' && id) {
      const body = await readBody(req);
      const patch = {};
      if (body.title !== undefined) patch.title = String(body.title);
      if (body.priority !== undefined) patch.priority = PRIORITY_TO_DB[body.priority] ?? '中';
      if (body.completed !== undefined) patch.completed = Boolean(body.completed);
      const { data, error } = await sb
        .from('tasks')
        .update(patch)
        .eq('id', Number(id))
        .select()
        .single();
      if (error) {
        if (error.code === 'PGRST116') return send(res, 404, { message: '任务不存在' });
        throw error;
      }
      return send(res, 200, mapRow(data));
    }

    // 删除任务
    if (req.method === 'DELETE' && id) {
      const { error } = await sb.from('tasks').delete().eq('id', Number(id));
      if (error) throw error;
      return send(res, 200, { success: true });
    }

    return send(res, 405, { message: '不支持的请求方法' });
  } catch (err) {
    const message = err && err.message ? err.message : '服务器内部错误';
    return send(res, 500, { message });
  }
};
