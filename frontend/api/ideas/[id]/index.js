import { sendJson } from '../../lib/http.js';
import { fallbackIdeas } from '../../lib/store.js';
import { hasSupabaseConfig, supabase } from '../../lib/supabase.js';

const getIdFromPath = (req) => req.url?.split('?')[0]?.split('/').filter(Boolean).at(-1);

export default async function handler(req, res) {
  if (req.method !== 'DELETE') {
    res.setHeader('Allow', 'DELETE');
    return sendJson(res, 405, { message: 'Method Not Allowed' });
  }

  const id = getIdFromPath(req);

  if (!id) {
    return sendJson(res, 400, { message: 'Idea id is required.' });
  }

  if (!hasSupabaseConfig) {
    const index = fallbackIdeas.findIndex((entry) => entry.id === id);
    if (index === -1) {
      return sendJson(res, 404, { message: 'Idea not found.' });
    }

    fallbackIdeas.splice(index, 1);
    return sendJson(res, 204, {});
  }

  const { error } = await supabase.from('ideas').delete().eq('id', id);

  if (error) {
    return sendJson(res, 500, { message: 'Failed to delete idea.', details: error.message });
  }

  return sendJson(res, 204, {});
}
