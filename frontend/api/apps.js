import { sendJson, parseBody } from './lib/http.js';
import { fallbackApps } from './lib/store.js';
import { hasSupabaseConfig, supabase } from './lib/supabase.js';
import { createId, normalizeAppPayload, timestamp, validateAppPayload } from './lib/model.js';

export default async function handler(req, res) {
  if (!['GET', 'POST'].includes(req.method)) {
    res.setHeader('Allow', 'GET, POST');
    return sendJson(res, 405, { message: 'Method Not Allowed' });
  }

  if (req.method === 'GET') {
    if (!hasSupabaseConfig) {
      return sendJson(res, 200, { source: 'fallback', data: fallbackApps });
    }

    const { data, error } = await supabase.from('apps').select('*').order('updated_at', { ascending: false });

    if (error) {
      return sendJson(res, 500, { message: 'Failed to load apps.', details: error.message });
    }

    return sendJson(res, 200, { source: 'supabase', data });
  }

  let payload;
  try {
    payload = normalizeAppPayload(await parseBody(req));
  } catch (error) {
    return sendJson(res, 400, { message: error.message || 'Invalid JSON body.' });
  }

  const validationError = validateAppPayload(payload);
  if (validationError) {
    return sendJson(res, 400, { message: validationError });
  }

  if (!hasSupabaseConfig) {
    const record = {
      id: createId('app'),
      created_at: timestamp(),
      updated_at: timestamp(),
      ...payload
    };

    fallbackApps.unshift(record);
    return sendJson(res, 201, record);
  }

  const { data, error } = await supabase
    .from('apps')
    .insert({
      ...payload,
      updated_at: timestamp()
    })
    .select()
    .single();

  if (error) {
    return sendJson(res, 500, { message: 'Failed to create app.', details: error.message });
  }

  return sendJson(res, 201, data);
}
