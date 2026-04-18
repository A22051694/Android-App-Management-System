import express from 'express';
import { hasSupabaseConfig, supabase } from '../supabase.js';

const router = express.Router();

const timestamp = () => new Date().toISOString();

const fallbackCompliance = {};

const normalizeCompliance = (payload) => ({
  support_email: payload.support_email?.trim() || '',
  collected_data: Array.isArray(payload.collected_data) ? payload.collected_data : [],
  third_party_sdks: Array.isArray(payload.third_party_sdks) ? payload.third_party_sdks : [],
  has_user_accounts: Boolean(payload.has_user_accounts)
});

router.get('/apps/:id/compliance', async (req, res) => {
  if (!hasSupabaseConfig) {
    const record = fallbackCompliance[req.params.id];
    return record ? res.json(record) : res.status(404).json({ message: 'Compliance profile not found.' });
  }

  const { data, error } = await supabase
    .from('compliance_profiles')
    .select('*')
    .eq('app_id', req.params.id)
    .single();

  if (error) {
    return res.status(404).json({ message: 'Compliance profile not found.', details: error.message });
  }

  return res.json(data);
});

router.post('/apps/:id/compliance', async (req, res) => {
  const payload = normalizeCompliance(req.body);

  if (!hasSupabaseConfig) {
    const record = {
      id: `compliance-${Math.random().toString(36).slice(2, 10)}`,
      app_id: req.params.id,
      ...payload,
      created_at: timestamp(),
      updated_at: timestamp()
    };
    fallbackCompliance[req.params.id] = record;
    return res.status(201).json(record);
  }

  const { data, error } = await supabase
    .from('compliance_profiles')
    .upsert({ app_id: req.params.id, ...payload, updated_at: timestamp() }, { onConflict: 'app_id' })
    .select()
    .single();

  if (error) {
    return res.status(500).json({ message: 'Failed to save compliance profile.', details: error.message });
  }

  return res.status(201).json(data);
});

router.put('/apps/:id/compliance', async (req, res) => {
  const payload = normalizeCompliance(req.body);

  if (!hasSupabaseConfig) {
    if (!fallbackCompliance[req.params.id]) {
      return res.status(404).json({ message: 'Compliance profile not found.' });
    }
    fallbackCompliance[req.params.id] = {
      ...fallbackCompliance[req.params.id],
      ...payload,
      updated_at: timestamp()
    };
    return res.json(fallbackCompliance[req.params.id]);
  }

  const { data, error } = await supabase
    .from('compliance_profiles')
    .update({ ...payload, updated_at: timestamp() })
    .eq('app_id', req.params.id)
    .select()
    .single();

  if (error) {
    return res.status(500).json({ message: 'Failed to update compliance profile.', details: error.message });
  }

  return res.json(data);
});

export default router;
