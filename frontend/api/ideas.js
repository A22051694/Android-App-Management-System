import { sendJson, parseBody } from './lib/http.js';
import { fallbackIdeas } from './lib/store.js';
import { hasSupabaseConfig, supabase } from './lib/supabase.js';
import { createId, normalizeIdeaPayload, timestamp, validateIdeaPayload } from './lib/model.js';

export default async function handler(req, res) {
  if (!['GET', 'POST'].includes(req.method)) {
    res.setHeader('Allow', 'GET, POST');
    return sendJson(res, 405, { message: 'Method Not Allowed' });
  }

  if (req.method === 'GET') {
    if (!hasSupabaseConfig) {
      return sendJson(res, 200, { source: 'fallback', data: fallbackIdeas });
    }

    const { data, error } = await supabase.from('ideas').select('*').order('created_at', { ascending: false });

    if (error) {
      return sendJson(res, 500, { message: 'Failed to load ideas.', details: error.message });
    }

    return sendJson(res, 200, { source: 'supabase', data });
  }

  let payload;
  try {
    payload = normalizeIdeaPayload(await parseBody(req));
  } catch (error) {
    return sendJson(res, 400, { message: error.message || 'Invalid JSON body.' });
  }

  const validationError = validateIdeaPayload(payload);
  if (validationError) {
    return sendJson(res, 400, { message: validationError });
  }

  if (!hasSupabaseConfig) {
    const record = { id: createId('idea'), created_at: timestamp(), ...payload };
    fallbackIdeas.unshift(record);
    return sendJson(res, 201, record);
  }

  const { data, error } = await supabase.from('ideas').insert(payload).select().single();

  if (error) {
    return sendJson(res, 500, { message: 'Failed to create idea.', details: error.message });
  }

  return sendJson(res, 201, data);
}
