import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { seedApps, seedIdeas } from './data.js';
import { hasSupabaseConfig, supabase } from './supabase.js';
import legalRouter from './routes/legal.js';
import complianceRouter from './routes/compliance.js';
import releasesRouter from './routes/releases.js';

const app = express();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.use('/view', legalRouter);
app.use('/api', complianceRouter);
app.use('/api', releasesRouter);

const fallbackApps = [...seedApps];
const fallbackIdeas = [...seedIdeas];

const createId = (prefix) => `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
const timestamp = () => new Date().toISOString();

const normalizeAppPayload = (payload) => ({
  name: payload.name?.trim(),
  type: payload.type?.trim() || 'Personal',
  status: payload.status?.trim() || 'Idea',
  category: payload.category?.trim() || 'General',
  description: payload.description?.trim() || '',
  links: {
    github: payload.links?.github?.trim() || '',
    playStore: payload.links?.playStore?.trim() || ''
  },
  notes: payload.notes?.trim() || '',
  tags: Array.isArray(payload.tags)
    ? payload.tags.map((tag) => tag.trim()).filter(Boolean)
    : String(payload.tags || '')
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean),
  slug: payload.slug?.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '') || null
});

const normalizeIdeaPayload = (payload) => ({
  title: payload.title?.trim(),
  description: payload.description?.trim() || '',
  category: payload.category?.trim() || 'General',
  tags: Array.isArray(payload.tags)
    ? payload.tags.map((tag) => tag.trim()).filter(Boolean)
    : String(payload.tags || '')
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean)
});

const validateAppPayload = (payload) => {
  if (!payload.name) {
    return 'App name is required.';
  }

  if (!payload.status) {
    return 'Status is required.';
  }

  return null;
};

const validateIdeaPayload = (payload) => {
  if (!payload.title) {
    return 'Idea title is required.';
  }

  return null;
};

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, database: hasSupabaseConfig ? 'supabase' : 'in-memory' });
});

app.get('/api/apps', async (_req, res) => {
  if (!hasSupabaseConfig) {
    return res.json({ source: 'fallback', data: fallbackApps });
  }

  const { data, error } = await supabase.from('apps').select('*').order('updated_at', { ascending: false });

  if (error) {
    return res.status(500).json({ message: 'Failed to load apps.', details: error.message });
  }

  return res.json({ source: 'supabase', data });
});

app.get('/api/apps/:id', async (req, res) => {
  if (!hasSupabaseConfig) {
    const record = fallbackApps.find((entry) => entry.id === req.params.id);
    return record ? res.json(record) : res.status(404).json({ message: 'App not found.' });
  }

  const { data, error } = await supabase.from('apps').select('*').eq('id', req.params.id).single();

  if (error) {
    return res.status(404).json({ message: 'App not found.', details: error.message });
  }

  return res.json(data);
});

app.post('/api/apps', async (req, res) => {
  const payload = normalizeAppPayload(req.body);
  const validationError = validateAppPayload(payload);

  if (validationError) {
    return res.status(400).json({ message: validationError });
  }

  if (!hasSupabaseConfig) {
    const record = {
      id: createId('app'),
      created_at: timestamp(),
      updated_at: timestamp(),
      slug: null,
      ...payload
    };

    fallbackApps.unshift(record);
    return res.status(201).json(record);
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
    return res.status(500).json({ message: 'Failed to create app.', details: error.message });
  }

  return res.status(201).json(data);
});

app.put('/api/apps/:id', async (req, res) => {
  const payload = normalizeAppPayload(req.body);
  const validationError = validateAppPayload(payload);

  if (validationError) {
    return res.status(400).json({ message: validationError });
  }

  if (!hasSupabaseConfig) {
    const index = fallbackApps.findIndex((entry) => entry.id === req.params.id);

    if (index === -1) {
      return res.status(404).json({ message: 'App not found.' });
    }

    fallbackApps[index] = {
      ...fallbackApps[index],
      ...payload,
      updated_at: timestamp()
    };

    return res.json(fallbackApps[index]);
  }

  const { data, error } = await supabase
    .from('apps')
    .update({ ...payload, updated_at: timestamp() })
    .eq('id', req.params.id)
    .select()
    .single();

  if (error) {
    return res.status(500).json({ message: 'Failed to update app.', details: error.message });
  }

  return res.json(data);
});

app.delete('/api/apps/:id', async (req, res) => {
  if (!hasSupabaseConfig) {
    const index = fallbackApps.findIndex((entry) => entry.id === req.params.id);

    if (index === -1) {
      return res.status(404).json({ message: 'App not found.' });
    }

    fallbackApps.splice(index, 1);
    return res.status(204).send();
  }

  const { error } = await supabase.from('apps').delete().eq('id', req.params.id);

  if (error) {
    return res.status(500).json({ message: 'Failed to delete app.', details: error.message });
  }

  return res.status(204).send();
});

app.get('/api/ideas', async (_req, res) => {
  if (!hasSupabaseConfig) {
    return res.json({ source: 'fallback', data: fallbackIdeas });
  }

  const { data, error } = await supabase.from('ideas').select('*').order('created_at', { ascending: false });

  if (error) {
    return res.status(500).json({ message: 'Failed to load ideas.', details: error.message });
  }

  return res.json({ source: 'supabase', data });
});

app.post('/api/ideas', async (req, res) => {
  const payload = normalizeIdeaPayload(req.body);
  const validationError = validateIdeaPayload(payload);

  if (validationError) {
    return res.status(400).json({ message: validationError });
  }

  if (!hasSupabaseConfig) {
    const record = { id: createId('idea'), created_at: timestamp(), ...payload };
    fallbackIdeas.unshift(record);
    return res.status(201).json(record);
  }

  const { data, error } = await supabase.from('ideas').insert(payload).select().single();

  if (error) {
    return res.status(500).json({ message: 'Failed to create idea.', details: error.message });
  }

  return res.status(201).json(data);
});

app.delete('/api/ideas/:id', async (req, res) => {
  if (!hasSupabaseConfig) {
    const index = fallbackIdeas.findIndex((entry) => entry.id === req.params.id);

    if (index === -1) {
      return res.status(404).json({ message: 'Idea not found.' });
    }

    fallbackIdeas.splice(index, 1);
    return res.status(204).send();
  }

  const { error } = await supabase.from('ideas').delete().eq('id', req.params.id);

  if (error) {
    return res.status(500).json({ message: 'Failed to delete idea.', details: error.message });
  }

  return res.status(204).send();
});

app.post('/api/ideas/:id/convert', async (req, res) => {
  if (!hasSupabaseConfig) {
    const ideaIndex = fallbackIdeas.findIndex((entry) => entry.id === req.params.id);

    if (ideaIndex === -1) {
      return res.status(404).json({ message: 'Idea not found.' });
    }

    const idea = fallbackIdeas[ideaIndex];
    const record = {
      id: createId('app'),
      name: idea.title,
      type: 'Personal',
      status: 'Idea',
      category: idea.category,
      description: idea.description,
      links: { github: '', playStore: '' },
      notes: idea.description,
      tags: idea.tags,
      created_at: timestamp(),
      updated_at: timestamp()
    };

    fallbackApps.unshift(record);
    fallbackIdeas.splice(ideaIndex, 1);
    return res.status(201).json(record);
  }

  const { data: idea, error: ideaError } = await supabase.from('ideas').select('*').eq('id', req.params.id).single();

  if (ideaError) {
    return res.status(404).json({ message: 'Idea not found.', details: ideaError.message });
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
    return res.status(500).json({ message: 'Failed to convert idea into app.', details: insertError.message });
  }

  const { error: deleteError } = await supabase.from('ideas').delete().eq('id', req.params.id);

  if (deleteError) {
    return res.status(500).json({ message: 'App was created, but the source idea could not be deleted.', details: deleteError.message });
  }

  return res.status(201).json(appRecord);
});

app.listen(port, () => {
  console.log(`AMS backend listening on http://localhost:${port}`);
});
