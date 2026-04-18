import express from 'express';
import { hasSupabaseConfig, supabase } from '../supabase.js';

const router = express.Router();

const timestamp = () => new Date().toISOString();
const createId = () => `rel-${Math.random().toString(36).slice(2, 10)}`;

const fallbackReleases = {};

const VALID_TRACKS = ['Alpha', 'Beta', 'Production'];

const normalizeRelease = (payload) => ({
  version_name: payload.version_name?.trim() || '',
  version_code: parseInt(payload.version_code, 10) || 0,
  track: VALID_TRACKS.includes(payload.track) ? payload.track : 'Alpha',
  changelog: payload.changelog?.trim() || '',
  storage_path: payload.storage_path?.trim() || ''
});

const validateRelease = (payload) => {
  if (!payload.version_name) return 'version_name is required.';
  if (!payload.version_code) return 'version_code must be a positive integer.';
  return null;
};

router.get('/apps/:id/releases', async (req, res) => {
  if (!hasSupabaseConfig) {
    const records = (fallbackReleases[req.params.id] || []).slice().sort(
      (a, b) => new Date(b.created_at) - new Date(a.created_at)
    );
    return res.json({ data: records });
  }

  const { data, error } = await supabase
    .from('releases')
    .select('*')
    .eq('app_id', req.params.id)
    .order('created_at', { ascending: false });

  if (error) {
    return res.status(500).json({ message: 'Failed to load releases.', details: error.message });
  }

  return res.json({ data });
});

router.post('/apps/:id/releases', async (req, res) => {
  const payload = normalizeRelease(req.body);
  const validationError = validateRelease(payload);

  if (validationError) {
    return res.status(400).json({ message: validationError });
  }

  if (!hasSupabaseConfig) {
    const record = {
      id: createId(),
      app_id: req.params.id,
      ...payload,
      created_at: timestamp()
    };
    if (!fallbackReleases[req.params.id]) {
      fallbackReleases[req.params.id] = [];
    }
    fallbackReleases[req.params.id].unshift(record);
    return res.status(201).json(record);
  }

  const { data, error } = await supabase
    .from('releases')
    .insert({ app_id: req.params.id, ...payload })
    .select()
    .single();

  if (error) {
    return res.status(500).json({ message: 'Failed to create release.', details: error.message });
  }

  return res.status(201).json(data);
});

export default router;
