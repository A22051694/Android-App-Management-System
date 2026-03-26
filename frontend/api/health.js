import { hasSupabaseConfig } from './lib/supabase.js';

const sendJson = (res, statusCode, payload) => {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(payload));
};

export default function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return sendJson(res, 405, { message: 'Method Not Allowed' });
  }

  return sendJson(res, 200, {
    ok: true,
    database: hasSupabaseConfig ? 'supabase' : 'in-memory'
  });
}
