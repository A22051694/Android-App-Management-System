import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import Handlebars from 'handlebars';
import express from 'express';
import { hasSupabaseConfig, supabase } from '../supabase.js';

const router = express.Router();

const __dirname = dirname(fileURLToPath(import.meta.url));
const templatesDir = join(__dirname, '..', 'templates');

const templateCache = {};

function loadTemplate(name) {
  if (!templateCache[name]) {
    const source = readFileSync(join(templatesDir, `${name}.hbs`), 'utf8');
    templateCache[name] = Handlebars.compile(source);
  }
  return templateCache[name];
}

const VALID_TYPES = ['privacy', 'data-deletion', 'terms'];

const templateNameMap = {
  privacy: 'privacy-policy',
  'data-deletion': 'data-deletion',
  terms: 'terms-of-service'
};

const DATA_SAFETY_MAP = {
  Location: { label: 'Precise location', purpose: 'Used to provide location-based features' },
  'Coarse Location': { label: 'Approximate location', purpose: 'Used for region-based content' },
  'Device ID': { label: 'Device identifiers', purpose: 'Used for analytics and crash reporting' },
  Email: { label: 'Email address', purpose: 'Used for account creation and communication' },
  Name: { label: 'Name', purpose: 'Used to personalize your experience' },
  Photos: { label: 'Photos and videos', purpose: 'Accessed when you upload images' },
  Contacts: { label: 'Contacts', purpose: 'Used to enable sharing features' },
  'Camera / Microphone': { label: 'Camera and microphone', purpose: 'Used to capture photos or audio in-app' },
  'Usage Data': { label: 'App interaction data', purpose: 'Used to improve app performance' },
  'Crash Logs': { label: 'Crash logs and diagnostics', purpose: 'Used to diagnose and fix issues' },
  'Payment Info': { label: 'Payment information', purpose: 'Processed securely for in-app purchases' }
};

function buildCollectedDataItems(rawList) {
  if (!Array.isArray(rawList)) return [];
  return rawList.map((item) => DATA_SAFETY_MAP[item] || { label: item, purpose: '' });
}

router.get('/legal/:slug/:type', async (req, res) => {
  const { slug, type } = req.params;

  if (!VALID_TYPES.includes(type)) {
    return res.status(404).send('<h1>404 \u2013 Legal page type not found</h1>');
  }

  if (!hasSupabaseConfig) {
    return res.status(503).send('<h1>Service unavailable \u2013 database not configured</h1>');
  }

  const { data: app, error: appError } = await supabase
    .from('apps')
    .select('id, name, slug')
    .eq('slug', slug)
    .single();

  if (appError || !app) {
    return res.status(404).send('<h1>404 \u2013 App not found</h1>');
  }

  const { data: compliance } = await supabase
    .from('compliance_profiles')
    .select('*')
    .eq('app_id', app.id)
    .single();

  const collectedDataRaw = compliance?.collected_data ?? [];
  const collectedDataItems = buildCollectedDataItems(collectedDataRaw);
  const thirdPartySDKs = Array.isArray(compliance?.third_party_sdks) ? compliance.third_party_sdks : [];
  const baseUrl = `${req.protocol}://${req.get('host')}`;

  const context = {
    appName: app.name,
    lastUpdated: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
    supportEmail: compliance?.support_email || 'support@example.com',
    hasUserAccounts: compliance?.has_user_accounts ?? false,
    hasCollectedData: collectedDataItems.length > 0,
    collectedData: collectedDataItems,
    hasThirdPartySDKs: thirdPartySDKs.length > 0,
    thirdPartySDKs,
    dataDeletionUrl: `${baseUrl}/view/legal/${slug}/data-deletion`
  };

  try {
    const template = loadTemplate(templateNameMap[type]);
    const html = template(context);
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.send(html);
  } catch {
    return res.status(500).send('<h1>Template rendering error</h1>');
  }
});

export default router;
