import { hasSupabaseConfig, supabase } from './lib/supabase.js';

const seedApps = [
  {
    id: '1',
    name: 'Focus Forge',
    platform: 'Android',
    status: 'Idea',
    category: 'Productivity',
    priority: 'High',
    owner: 'You',
    summary: 'Gamified focus sessions with streaks, rewards, and deep work analytics.'
  },
  {
    id: '2',
    name: 'Fit Pantry',
    platform: 'Android',
    status: 'Research',
    category: 'Health',
    priority: 'Medium',
    owner: 'You',
    summary: 'AI meal planner that builds recipes from groceries already at home.'
  },
  {
    id: '3',
    name: 'Pocket PM',
    platform: 'Android',
    status: 'Prototype',
    category: 'Business',
    priority: 'High',
    owner: 'You',
    summary: 'Simple project manager for solo founders shipping multiple app ideas.'
  }
];

const fallbackApps = [...seedApps];

const sendJson = (res, statusCode, payload) => {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(payload));
};

const parseBody = (req) =>
  new Promise((resolve, reject) => {
    if (req.body && typeof req.body === 'object') {
      resolve(req.body);
      return;
    }

    let raw = '';
    req.on('data', (chunk) => {
      raw += chunk;
    });

    req.on('end', () => {
      if (!raw) {
        resolve({});
        return;
      }

      try {
        resolve(JSON.parse(raw));
      } catch {
        reject(new Error('Invalid JSON body.'));
      }
    });

    req.on('error', reject);
  });

const isNonEmptyString = (value) => typeof value === 'string' && value.trim().length > 0;

export default async function handler(req, res) {
  if (!['GET', 'POST'].includes(req.method)) {
    res.setHeader('Allow', 'GET, POST');
    return sendJson(res, 405, { message: 'Method Not Allowed' });
  }

  if (req.method === 'GET') {
    if (!hasSupabaseConfig) {
      return sendJson(res, 200, { source: 'fallback', data: fallbackApps });
    }

    const { data, error } = await supabase.from('apps').select('*').order('created_at', { ascending: false });

    if (error) {
      return sendJson(res, 500, { message: 'Failed to load apps.', details: error.message });
    }

    return sendJson(res, 200, { source: 'supabase', data });
  }

  let payload;
  try {
    payload = await parseBody(req);
  } catch (error) {
    return sendJson(res, 400, { message: error.message || 'Invalid JSON body.' });
  }

  if (!isNonEmptyString(payload.name) || !isNonEmptyString(payload.status) || !isNonEmptyString(payload.category)) {
    return sendJson(res, 400, { message: 'name, status, and category must be non-empty strings.' });
  }

  if (!hasSupabaseConfig) {
    const record = {
      id: String(fallbackApps.length + 1),
      platform: 'Android',
      priority: 'Medium',
      owner: 'You',
      summary: '',
      ...payload
    };

    fallbackApps.unshift(record);
    return sendJson(res, 201, record);
  }

  const { data, error } = await supabase
    .from('apps')
    .insert({
      platform: 'Android',
      priority: 'Medium',
      owner: 'You',
      summary: '',
      ...payload
    })
    .select()
    .single();

  if (error) {
    return sendJson(res, 500, { message: 'Failed to create app.', details: error.message });
  }

  return sendJson(res, 201, data);
}
