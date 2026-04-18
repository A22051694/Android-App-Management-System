import { sendJson, parseBody } from '../lib/http.js';
import { fallbackApps } from '../lib/store.js';
import { hasSupabaseConfig, supabase } from '../lib/supabase.js';
import { normalizeAppPayload, timestamp, validateAppPayload } from '../lib/model.js';

const getIdFromPath = (req) => req.url?.split('?')[0]?.split('/').filter(Boolean).at(-1);

export default async function handler(req, res) {
  const id = getIdFromPath(req);

  if (!id) {
    return sendJson(res, 400, { message: 'App id is required.' });
  }

  if (!['GET', 'PUT', 'DELETE'].includes(req.method)) {
    res.setHeader('Allow', 'GET, PUT, DELETE');
    return sendJson(res, 405, { message: 'Method Not Allowed' });
  }

  if (req.method === 'GET') {
    if (!hasSupabaseConfig) {
      const record = fallbackApps.find((entry) => entry.id === id);
      return record
        ? sendJson(res, 200, record)
        : sendJson(res, 404, { message: 'App not found.' });
    }

    const { data, error } = await supabase.from('apps').select('*').eq('id', id).single();

    if (error) {
      return sendJson(res, 404, { message: 'App not found.', details: error.message });
    }

    return sendJson(res, 200, data);
  }

  if (req.method === 'DELETE') {
    if (!hasSupabaseConfig) {
      const index = fallbackApps.findIndex((entry) => entry.id === id);
      if (index === -1) {
        return sendJson(res, 404, { message: 'App not found.' });
      }

      fallbackApps.splice(index, 1);
      return sendJson(res, 204, {});
    }

    const { error } = await supabase.from('apps').delete().eq('id', id);

    if (error) {
      return sendJson(res, 500, { message: 'Failed to delete app.', details: error.message });
    }

    return sendJson(res, 204, {});
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
    const index = fallbackApps.findIndex((entry) => entry.id === id);
    if (index === -1) {
      return sendJson(res, 404, { message: 'App not found.' });
    }

    fallbackApps[index] = {
      ...fallbackApps[index],
      ...payload,
      updated_at: timestamp()
    };

    return sendJson(res, 200, fallbackApps[index]);
  }

  const { data, error } = await supabase
    .from('apps')
    .update({ ...payload, updated_at: timestamp() })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return sendJson(res, 500, { message: 'Failed to update app.', details: error.message });
  }

  return sendJson(res, 200, data);
}
