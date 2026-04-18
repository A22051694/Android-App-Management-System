import { useState, useEffect } from 'react';

const DATA_SAFETY_OPTIONS = [
  'Location',
  'Coarse Location',
  'Device ID',
  'Email',
  'Name',
  'Photos',
  'Contacts',
  'Camera / Microphone',
  'Usage Data',
  'Crash Logs',
  'Payment Info'
];

const TRACK_OPTIONS = ['Alpha', 'Beta', 'Production'];

const defaultCompliance = {
  support_email: '',
  collected_data: [],
  third_party_sdks: '',
  has_user_accounts: false
};

const defaultRelease = {
  version_name: '',
  version_code: '',
  track: 'Alpha',
  changelog: '',
  storage_path: ''
};

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard API unavailable
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="rounded-full border border-slate-700 px-3 py-1 text-xs text-slate-300 transition hover:border-violet-400 hover:text-white"
    >
      {copied ? 'Copied!' : 'Copy'}
    </button>
  );
}

function LiveLinks({ appSlug, baseUrl }) {
  if (!appSlug) {
    return (
      <div className="rounded-3xl border border-slate-800 bg-slate-950/70 p-5">
        <p className="text-sm uppercase tracking-[0.3em] text-violet-300">Live Legal Links</p>
        <p className="mt-4 text-sm text-slate-500">Set a unique slug for this app (in the Edit form) to generate public legal page URLs for the Play Console.</p>
      </div>
    );
  }

  const links = [
    { label: 'Privacy Policy', type: 'privacy' },
    { label: 'Data Deletion', type: 'data-deletion' },
    { label: 'Terms of Service', type: 'terms' }
  ].map(({ label, type }) => ({
    label,
    url: `${baseUrl}/view/legal/${appSlug}/${type}`
  }));

  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-950/70 p-5">
      <p className="text-sm uppercase tracking-[0.3em] text-violet-300">Live Legal Links</p>
      <p className="mt-2 text-xs text-slate-500">Copy these URLs into the Google Play Console for your policy requirements.</p>
      <div className="mt-4 space-y-3">
        {links.map(({ label, url }) => (
          <div key={url} className="flex items-center justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3">
            <div className="min-w-0">
              <p className="text-xs text-slate-400">{label}</p>
              <a href={url} target="_blank" rel="noreferrer" className="block truncate text-sm text-violet-300 underline-offset-2 hover:underline">{url}</a>
            </div>
            <CopyButton text={url} />
          </div>
        ))}
      </div>
    </div>
  );
}

export function ComplianceTab({ app, baseUrl }) {
  const [compliance, setCompliance] = useState(null);
  const [form, setForm] = useState(defaultCompliance);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [releases, setReleases] = useState([]);
  const [releaseForm, setReleaseForm] = useState(defaultRelease);
  const [addingRelease, setAddingRelease] = useState(false);

  useEffect(() => {
    if (!app?.id) return;
    setLoading(true);

    Promise.allSettled([
      fetch(`/api/apps/${app.id}/compliance`).then((r) => (r.ok ? r.json() : null)),
      fetch(`/api/apps/${app.id}/releases`).then((r) => (r.ok ? r.json() : { data: [] }))
    ]).then(([complianceResult, releasesResult]) => {
      if (complianceResult.status === 'fulfilled' && complianceResult.value) {
        const c = complianceResult.value;
        setCompliance(c);
        setForm({
          support_email: c.support_email || '',
          collected_data: Array.isArray(c.collected_data) ? c.collected_data : [],
          third_party_sdks: Array.isArray(c.third_party_sdks) ? c.third_party_sdks.join(', ') : '',
          has_user_accounts: c.has_user_accounts ?? false
        });
      }
      if (releasesResult.status === 'fulfilled' && releasesResult.value) {
        setReleases(releasesResult.value.data || []);
      }
      setLoading(false);
    });
  }, [app?.id]);

  const toggleDataItem = (item) => {
    setForm((current) => ({
      ...current,
      collected_data: current.collected_data.includes(item)
        ? current.collected_data.filter((d) => d !== item)
        : [...current.collected_data, item]
    }));
  };

  const handleSaveCompliance = async (event) => {
    event.preventDefault();
    setSaving(true);

    const payload = {
      support_email: form.support_email,
      collected_data: form.collected_data,
      third_party_sdks: form.third_party_sdks.split(',').map((s) => s.trim()).filter(Boolean),
      has_user_accounts: form.has_user_accounts
    };

    const method = compliance ? 'PUT' : 'POST';
    const response = await fetch(`/api/apps/${app.id}/compliance`, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (response.ok) {
      const saved = await response.json();
      setCompliance(saved);
    }

    setSaving(false);
  };

  const handleAddRelease = async (event) => {
    event.preventDefault();
    setAddingRelease(true);

    const payload = {
      ...releaseForm,
      version_code: parseInt(releaseForm.version_code, 10)
    };

    const response = await fetch(`/api/apps/${app.id}/releases`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (response.ok) {
      const saved = await response.json();
      setReleases((current) => [saved, ...current]);
      setReleaseForm(defaultRelease);
    }

    setAddingRelease(false);
  };

  if (loading) {
    return <p className="text-sm text-slate-400">Loading compliance data…</p>;
  }

  const formatDate = (value) =>
    new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(value));

  return (
    <div className="space-y-8">
      <div className="grid gap-6 xl:grid-cols-2">
        <form onSubmit={handleSaveCompliance} className="rounded-3xl border border-slate-800 bg-slate-950/70 p-5 space-y-4">
          <p className="text-sm uppercase tracking-[0.3em] text-violet-300">Compliance Profile</p>

          <label className="block text-sm text-slate-300">
            Support email
            <input
              type="email"
              value={form.support_email}
              onChange={(e) => setForm((c) => ({ ...c, support_email: e.target.value }))}
              placeholder="support@example.com"
              className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-violet-400"
            />
          </label>

          <div>
            <p className="text-sm text-slate-300">Data collected (Data Safety checklist)</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {DATA_SAFETY_OPTIONS.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => toggleDataItem(item)}
                  className={`rounded-full px-3 py-1 text-xs transition ${
                    form.collected_data.includes(item)
                      ? 'bg-violet-500 text-white'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <label className="block text-sm text-slate-300">
            Third-party SDKs (comma-separated)
            <input
              value={form.third_party_sdks}
              onChange={(e) => setForm((c) => ({ ...c, third_party_sdks: e.target.value }))}
              placeholder="Firebase, AdMob, Facebook SDK"
              className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-violet-400"
            />
          </label>

          <label className="flex items-center gap-3 text-sm text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={form.has_user_accounts}
              onChange={(e) => setForm((c) => ({ ...c, has_user_accounts: e.target.checked }))}
              className="h-4 w-4 rounded border-slate-700 accent-violet-500"
            />
            App has user accounts
          </label>

          <button
            type="submit"
            disabled={saving}
            className="rounded-2xl bg-violet-500 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-violet-400 disabled:opacity-60"
          >
            {saving ? 'Saving…' : 'Save compliance profile'}
          </button>
        </form>

        <LiveLinks appSlug={app.slug} baseUrl={baseUrl} />
      </div>

      <div className="rounded-3xl border border-slate-800 bg-slate-950/70 p-5 space-y-6">
        <p className="text-sm uppercase tracking-[0.3em] text-violet-300">Release History</p>

        <form onSubmit={handleAddRelease} className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <label className="text-sm text-slate-300">
            Version name
            <input
              value={releaseForm.version_name}
              onChange={(e) => setReleaseForm((c) => ({ ...c, version_name: e.target.value }))}
              placeholder="1.0.0"
              required
              className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-violet-400"
            />
          </label>

          <label className="text-sm text-slate-300">
            Version code
            <input
              type="number"
              min="1"
              value={releaseForm.version_code}
              onChange={(e) => setReleaseForm((c) => ({ ...c, version_code: e.target.value }))}
              placeholder="1"
              required
              className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-violet-400"
            />
          </label>

          <label className="text-sm text-slate-300">
            Track
            <select
              value={releaseForm.track}
              onChange={(e) => setReleaseForm((c) => ({ ...c, track: e.target.value }))}
              className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-violet-400"
            >
              {TRACK_OPTIONS.map((t) => <option key={t}>{t}</option>)}
            </select>
          </label>

          <label className="text-sm text-slate-300">
            Storage path (.aab / .apk)
            <input
              value={releaseForm.storage_path}
              onChange={(e) => setReleaseForm((c) => ({ ...c, storage_path: e.target.value }))}
              placeholder="builds/v1.0.0.aab"
              className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-violet-400"
            />
          </label>

          <label className="text-sm text-slate-300 sm:col-span-2 xl:col-span-3">
            Changelog
            <textarea
              value={releaseForm.changelog}
              onChange={(e) => setReleaseForm((c) => ({ ...c, changelog: e.target.value }))}
              placeholder="What changed in this release?"
              className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-violet-400"
              rows={2}
            />
          </label>

          <div className="flex items-end">
            <button
              type="submit"
              disabled={addingRelease}
              className="w-full rounded-2xl bg-violet-500 px-5 py-3 text-sm font-medium text-white transition hover:bg-violet-400 disabled:opacity-60"
            >
              {addingRelease ? 'Adding…' : '+ Add Release'}
            </button>
          </div>
        </form>

        {releases.length === 0 ? (
          <p className="text-sm text-slate-500">No releases recorded yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800 text-left text-xs uppercase tracking-wider text-slate-500">
                  <th className="pb-3 pr-4">Version</th>
                  <th className="pb-3 pr-4">Code</th>
                  <th className="pb-3 pr-4">Track</th>
                  <th className="pb-3 pr-4">Storage Path</th>
                  <th className="pb-3 pr-4">Changelog</th>
                  <th className="pb-3">Released</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {releases.map((release) => (
                  <tr key={release.id} className="text-slate-300">
                    <td className="py-3 pr-4 font-medium text-white">{release.version_name}</td>
                    <td className="py-3 pr-4">{release.version_code}</td>
                    <td className="py-3 pr-4">
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        release.track === 'Production' ? 'bg-emerald-500/20 text-emerald-300' :
                        release.track === 'Beta' ? 'bg-sky-500/20 text-sky-300' :
                        'bg-amber-500/20 text-amber-300'
                      }`}>
                        {release.track}
                      </span>
                    </td>
                    <td className="py-3 pr-4 font-mono text-xs text-slate-400">{release.storage_path || '—'}</td>
                    <td className="py-3 pr-4 max-w-xs truncate text-slate-400">{release.changelog || '—'}</td>
                    <td className="py-3 whitespace-nowrap text-slate-500">{formatDate(release.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
