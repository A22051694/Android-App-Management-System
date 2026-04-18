import { sendJson } from '../../lib/http.js';
import { fallbackApps, fallbackIdeas } from '../../lib/store.js';
import { hasSupabaseConfig, supabase } from '../../lib/supabase.js';
import { createId, timestamp } from '../../lib/model.js';

const getIdFromPath = (req) => {
  const parts = req.url?.split('?')[0]?.split('/').filter(Boolean) || [];
  return parts.at(-2);
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return sendJson(res, 405, { message: 'Method Not Allowed' });
  }

  const id = getIdFromPath(req);

  if (!id) {
    return sendJson(res, 400, { message: 'Idea id is required.' });
  }

  if (!hasSupabaseConfig) {
    const ideaIndex = fallbackIdeas.findIndex((entry) => entry.id === id);

    if (ideaIndex === -1) {
      return sendJson(res, 404, { message: 'Idea not found.' });
    }

    const idea = fallbackIdeas[ideaIndex];
    const appRecord = {
      id: createId('app'),
      name: idea.title,
      type: 'Personal',
      status: 'Idea',
      category: idea.category || 'General',
      description: idea.description || '',
      links: { github: '', playStore: '' },
      notes: idea.description || '',
      tags: idea.tags || [],
      created_at: timestamp(),
      updated_at: timestamp()
    };

    fallbackApps.unshift(appRecord);
    fallbackIdeas.splice(ideaIndex, 1);

    return sendJson(res, 201, appRecord);
  }

  const { data: idea, error: ideaError } = await supabase.from('ideas').select('*').eq('id', id).single();

  if (ideaError) {
    return sendJson(res, 404, { message: 'Idea not found.', details: ideaError.message });
  }

  const { data: appRecord, error: insertError } = await supabase
    .from('apps')
    .insert({
      name: idea.title,
      type: 'Personal',
      status: 'Idea',
      category: idea.category || 'General',
      description: idea.description || '',
      links: { github: '', playStore: '' },
      notes: idea.description || '',
      tags: idea.tags || [],
      updated_at: timestamp()
    })
    .select()
    .single();

  if (insertError) {
    return sendJson(res, 500, { message: 'Failed to convert idea into app.', details: insertError.message });
  }

  const { error: deleteError } = await supabase.from('ideas').delete().eq('id', id);

  if (deleteError) {
    return sendJson(res, 500, {
      message: 'App was created, but the source idea could not be deleted.',
      details: deleteError.message
    });
  }

  return sendJson(res, 201, appRecord);
}
