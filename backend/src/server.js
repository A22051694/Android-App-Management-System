import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { seedApps } from './data.js';
import { hasSupabaseConfig, supabase } from './supabase.js';

const app = express();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

const fallbackApps = [...seedApps];

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, database: hasSupabaseConfig ? 'supabase' : 'in-memory' });
});

app.get('/api/apps', async (_req, res) => {
  if (!hasSupabaseConfig) {
    return res.json({ source: 'fallback', data: fallbackApps });
  }

  const { data, error } = await supabase
    .from('apps')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    return res.status(500).json({ message: 'Failed to load apps.', details: error.message });
  }

  return res.json({ source: 'supabase', data });
});

app.post('/api/apps', async (req, res) => {
  const payload = req.body;

  if (!payload.name || !payload.status || !payload.category) {
    return res.status(400).json({ message: 'name, status, and category are required.' });
  }

  if (!hasSupabaseConfig) {
    const record = {
      id: String(fallbackApps.length + 1),
      platform: 'Android',
      priority: 'Medium',
      owner: 'You',
      ...payload
    };

    fallbackApps.unshift(record);
    return res.status(201).json(record);
  }

  const { data, error } = await supabase
    .from('apps')
    .insert({
      platform: 'Android',
      priority: 'Medium',
      owner: 'You',
      ...payload
    })
    .select()
    .single();

  if (error) {
    return res.status(500).json({ message: 'Failed to create app.', details: error.message });
  }

  return res.status(201).json(data);
});

app.listen(port, () => {
  console.log(`AMS backend listening on http://localhost:${port}`);
});
