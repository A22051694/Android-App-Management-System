import { useEffect, useMemo, useState } from 'react';
import { AppTable } from './components/AppTable';
import { StatCard } from './components/StatCard';
import { StatusBadge } from './components/StatusBadge';

const navigation = ['Dashboard', 'Apps', 'Ideas', 'Settings'];
const statusOptions = ['Idea', 'In Progress', 'Completed'];
const typeOptions = ['Play Store', 'Personal'];
const defaultApp = {
  name: '',
  type: 'Personal',
  status: 'Idea',
  category: '',
  description: '',
  links: { github: '', playStore: '' },
  notes: '',
  tags: ''
};
const defaultIdea = { title: '', category: '', description: '', tags: '' };

const formatDate = (value) =>
  new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(new Date(value));

const parseTags = (value) =>
  Array.isArray(value) ? value : String(value || '').split(',').map((tag) => tag.trim()).filter(Boolean);

function Sidebar({ page, onNavigate, onAddApp }) {
  return (
    <aside className="rounded-[2rem] border border-slate-800 bg-slate-900/80 p-6">
      <div>
        <p className="text-sm uppercase tracking-[0.4em] text-violet-300">AMS</p>
        <h1 className="mt-3 text-2xl font-semibold text-white">Your app control center</h1>
        <p className="mt-2 text-sm text-slate-400">Keep ideas, builds, and published apps in one clean system.</p>
      </div>

      <nav className="mt-8 space-y-2">
        {navigation.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => onNavigate(item)}
            className={`flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left text-sm transition ${
              page === item ? 'bg-violet-500 text-white' : 'bg-slate-950 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <span>{item}</span>
            <span className="text-xs uppercase tracking-[0.25em] opacity-70">Open</span>
          </button>
        ))}
      </nav>

      <button
        type="button"
        onClick={onAddApp}
        className="mt-8 inline-flex w-full items-center justify-center rounded-2xl bg-white px-4 py-3 font-medium text-slate-950 transition hover:bg-slate-200"
      >
        + Add New App
      </button>
    </aside>
  );
}

function TopBar({ title, subtitle, source }) {
  return (
    <section className="rounded-[2rem] border border-violet-500/20 bg-gradient-to-br from-slate-900 via-slate-950 to-violet-950/40 p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.35em] text-violet-300">Android Management System</p>
          <h2 className="mt-3 text-3xl font-semibold text-white">{title}</h2>
          <p className="mt-2 max-w-3xl text-slate-300">{subtitle}</p>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 px-4 py-3 text-sm text-slate-300">
          Data source: <span className="font-semibold text-white">{source}</span>
        </div>
      </div>
    </section>
  );
}

function Dashboard({ apps, ideas, onOpenApp, onNavigate }) {
  const stats = useMemo(() => ({
    total: apps.length,
    playStore: apps.filter((entry) => entry.type === 'Play Store').length,
    personal: apps.filter((entry) => entry.type === 'Personal').length,
    ideas: apps.filter((entry) => entry.status === 'Idea').length
  }), [apps]);

  const recentApps = [...apps]
    .sort((first, second) => new Date(second.updated_at || second.created_at) - new Date(first.updated_at || first.created_at))
    .slice(0, 5);

  return (
    <div className="space-y-8">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total apps" value={stats.total} helper="Everything you're tracking" accent="violet" />
        <StatCard label="Play Store apps" value={stats.playStore} helper="Published or publishing publicly" accent="sky" />
        <StatCard label="Personal apps" value={stats.personal} helper="Private tools, experiments, internal builds" accent="emerald" />
        <StatCard label="Ideas (not started)" value={stats.ideas} helper="Apps still in concept mode" accent="amber" />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-[2rem] border border-slate-800 bg-slate-900/70 p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-violet-300">Recent apps</p>
              <h3 className="mt-2 text-2xl font-semibold text-white">Latest updates</h3>
            </div>
            <button type="button" onClick={() => onNavigate('Apps')} className="rounded-full border border-slate-700 px-4 py-2 text-sm text-slate-200 transition hover:border-violet-400 hover:text-white">
              Open apps list
            </button>
          </div>

          <div className="mt-6 space-y-3">
            {recentApps.map((app) => (
              <button
                key={app.id}
                type="button"
                onClick={() => onOpenApp(app)}
                className="flex w-full items-center justify-between rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-4 text-left transition hover:border-violet-400/40"
              >
                <div>
                  <p className="font-medium text-white">{app.name}</p>
                  <p className="mt-1 text-sm text-slate-400">{app.category} • {app.type}</p>
                </div>
                <div className="text-right">
                  <StatusBadge status={app.status} />
                  <p className="mt-2 text-xs text-slate-500">Updated {formatDate(app.updated_at || app.created_at)}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-[2rem] border border-slate-800 bg-slate-900/70 p-6">
          <p className="text-sm uppercase tracking-[0.3em] text-violet-300">Idea vault</p>
          <h3 className="mt-2 text-2xl font-semibold text-white">Raw ideas waiting to be promoted</h3>
          <p className="mt-3 text-sm text-slate-400">Keep the main apps list clean by storing rough concepts here until they deserve full app records.</p>

          <div className="mt-6 space-y-3">
            {ideas.slice(0, 4).map((idea) => (
              <div key={idea.id} className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-medium text-white">{idea.title}</p>
                    <p className="mt-1 text-sm text-slate-400">{idea.category}</p>
                  </div>
                  <span className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-300">{formatDate(idea.created_at)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function AppsPage({ apps, filters, setFilters, categories, onAddApp, onOpenApp, onEditApp, onDeleteApp }) {
  const tabs = ['All', ...categories];

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-slate-800 bg-slate-900/70 p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex-1">
            <label className="text-sm text-slate-300">
              Search apps
              <input
                value={filters.search}
                onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))}
                placeholder="Search by app name"
                className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-violet-400"
              />
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-3 lg:w-[420px]">
            <label className="text-sm text-slate-300">
              Status
              <select
                value={filters.status}
                onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value }))}
                className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-violet-400"
              >
                <option value="All">All</option>
                {statusOptions.map((option) => <option key={option}>{option}</option>)}
              </select>
            </label>

            <label className="text-sm text-slate-300">
              Type
              <select
                value={filters.type}
                onChange={(event) => setFilters((current) => ({ ...current, type: event.target.value }))}
                className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-violet-400"
              >
                <option value="All">All</option>
                {typeOptions.map((option) => <option key={option}>{option}</option>)}
              </select>
            </label>

            <label className="text-sm text-slate-300">
              Tag
              <input
                value={filters.tag}
                onChange={(event) => setFilters((current) => ({ ...current, tag: event.target.value }))}
                placeholder="ai, utility, game"
                className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-violet-400"
              />
            </label>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          {tabs.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setFilters((current) => ({ ...current, category: tab }))}
              className={`rounded-full px-4 py-2 text-sm transition ${
                filters.category === tab ? 'bg-violet-500 text-white' : 'bg-slate-950 text-slate-300 hover:bg-slate-800'
              }`}
            >
              {tab}
            </button>
          ))}

          <button type="button" onClick={onAddApp} className="ml-auto rounded-2xl bg-white px-4 py-2.5 text-sm font-medium text-slate-950 transition hover:bg-slate-200">
            + Add New App
          </button>
        </div>
      </section>

      <AppTable apps={apps} onOpen={onOpenApp} onEdit={onEditApp} onDelete={onDeleteApp} />
    </div>
  );
}

function AppFormPage({ title, form, setForm, onSubmit, onCancel, submitLabel }) {
  const updateField = (key, value) => setForm((current) => ({ ...current, [key]: value }));
  const updateLink = (key, value) => setForm((current) => ({ ...current, links: { ...current.links, [key]: value } }));

  return (
    <form onSubmit={onSubmit} className="rounded-[2rem] border border-slate-800 bg-slate-900/70 p-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-violet-300">Add / Edit App</p>
          <h3 className="text-2xl font-semibold text-white">{title}</h3>
        </div>
        <button type="button" onClick={onCancel} className="rounded-full border border-slate-700 px-4 py-2 text-sm text-slate-200 transition hover:border-violet-400 hover:text-white">
          Cancel
        </button>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <label className="text-sm text-slate-300 md:col-span-2">
          App name
          <input value={form.name} onChange={(event) => updateField('name', event.target.value)} required className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-violet-400" />
        </label>

        <label className="text-sm text-slate-300">
          Type
          <select value={form.type} onChange={(event) => updateField('type', event.target.value)} className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-violet-400">
            {typeOptions.map((option) => <option key={option}>{option}</option>)}
          </select>
        </label>

        <label className="text-sm text-slate-300">
          Status
          <select value={form.status} onChange={(event) => updateField('status', event.target.value)} className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-violet-400">
            {statusOptions.map((option) => <option key={option}>{option}</option>)}
          </select>
        </label>

        <label className="text-sm text-slate-300">
          Custom category
          <input value={form.category} onChange={(event) => updateField('category', event.target.value)} placeholder="Utility, AI, Game..." className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-violet-400" />
        </label>

        <label className="text-sm text-slate-300">
          Tags
          <input value={form.tags} onChange={(event) => updateField('tags', event.target.value)} placeholder="ai, utility, game" className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-violet-400" />
        </label>

        <label className="text-sm text-slate-300 md:col-span-2">
          Description
          <textarea value={form.description} onChange={(event) => updateField('description', event.target.value)} className="mt-2 min-h-32 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-violet-400" />
        </label>

        <label className="text-sm text-slate-300">
          GitHub link
          <input value={form.links.github} onChange={(event) => updateLink('github', event.target.value)} placeholder="https://github.com/..." className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-violet-400" />
        </label>

        <label className="text-sm text-slate-300">
          Play Store link
          <input value={form.links.playStore} onChange={(event) => updateLink('playStore', event.target.value)} placeholder="https://play.google.com/..." className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-violet-400" />
        </label>

        <label className="text-sm text-slate-300 md:col-span-2">
          Notes
          <textarea value={form.notes} onChange={(event) => updateField('notes', event.target.value)} className="mt-2 min-h-40 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-violet-400" />
        </label>
      </div>

      <button type="submit" className="mt-6 inline-flex rounded-2xl bg-violet-500 px-5 py-3 font-medium text-white transition hover:bg-violet-400">
        {submitLabel}
      </button>
    </form>
  );
}

function AppDetailPage({ app, onEdit, onDelete }) {
  if (!app) {
    return null;
  }

  return (
    <section className="rounded-[2rem] border border-slate-800 bg-slate-900/70 p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h3 className="text-3xl font-semibold text-white">{app.name}</h3>
            <StatusBadge status={app.status} />
          </div>
          <p className="mt-3 text-slate-400">{app.description || 'No description added yet.'}</p>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={() => onEdit(app)} className="rounded-2xl border border-slate-700 px-4 py-2 text-sm text-slate-200 transition hover:border-violet-400 hover:text-white">Edit</button>
          <button type="button" onClick={() => onDelete(app)} className="rounded-2xl border border-rose-500/30 px-4 py-2 text-sm text-rose-300 transition hover:border-rose-400 hover:text-rose-200">Delete</button>
        </div>
      </div>

      <div className="mt-8 grid gap-4 lg:grid-cols-3">
        <InfoCard label="Type" value={app.type} />
        <InfoCard label="Category" value={app.category} />
        <InfoCard label="Last updated" value={formatDate(app.updated_at || app.created_at)} />
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-6">
          <DetailBlock title="Links">
            <LinkItem label="GitHub" href={app.links?.github} />
            <LinkItem label="Play Store" href={app.links?.playStore} />
          </DetailBlock>

          <DetailBlock title="Tags">
            <div className="flex flex-wrap gap-2">
              {parseTags(app.tags).length ? parseTags(app.tags).map((tag) => (
                <span key={tag} className="rounded-full bg-slate-800 px-3 py-1 text-sm text-slate-200">#{tag}</span>
              )) : <p className="text-sm text-slate-500">No tags yet.</p>}
            </div>
          </DetailBlock>
        </div>

        <DetailBlock title="Notes / Idea Vault">
          <p className="whitespace-pre-wrap text-sm leading-7 text-slate-300">{app.notes || 'No notes yet.'}</p>
        </DetailBlock>
      </div>
    </section>
  );
}

function InfoCard({ label, value }) {
  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-950/70 p-4">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-2 text-lg font-medium text-white">{value || '—'}</p>
    </div>
  );
}

function DetailBlock({ title, children }) {
  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-950/70 p-5">
      <p className="text-sm uppercase tracking-[0.3em] text-violet-300">{title}</p>
      <div className="mt-4 space-y-3">{children}</div>
    </div>
  );
}

function LinkItem({ label, href }) {
  if (!href) {
    return <p className="text-sm text-slate-500">{label}: not added</p>;
  }

  return (
    <a href={href} target="_blank" rel="noreferrer" className="block text-sm text-violet-300 underline-offset-4 hover:underline">
      {label}
    </a>
  );
}

function IdeasPage({ ideas, ideaForm, setIdeaForm, onSubmitIdea, onConvertIdea, onDeleteIdea, onAddApp }) {
  return (
    <div className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
      <form onSubmit={onSubmitIdea} className="rounded-[2rem] border border-slate-800 bg-slate-900/70 p-6">
        <p className="text-sm uppercase tracking-[0.3em] text-violet-300">Idea Vault</p>
        <h3 className="mt-2 text-2xl font-semibold text-white">Capture raw ideas before they become apps</h3>

        <div className="mt-6 space-y-4">
          <label className="text-sm text-slate-300">
            Idea title
            <input value={ideaForm.title} onChange={(event) => setIdeaForm((current) => ({ ...current, title: event.target.value }))} required className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-violet-400" />
          </label>
          <label className="text-sm text-slate-300">
            Category
            <input value={ideaForm.category} onChange={(event) => setIdeaForm((current) => ({ ...current, category: event.target.value }))} className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-violet-400" />
          </label>
          <label className="text-sm text-slate-300">
            Tags
            <input value={ideaForm.tags} onChange={(event) => setIdeaForm((current) => ({ ...current, tags: event.target.value }))} placeholder="ai, utility" className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-violet-400" />
          </label>
          <label className="text-sm text-slate-300">
            Description
            <textarea value={ideaForm.description} onChange={(event) => setIdeaForm((current) => ({ ...current, description: event.target.value }))} className="mt-2 min-h-32 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-violet-400" />
          </label>
        </div>

        <button type="submit" className="mt-6 inline-flex rounded-2xl bg-violet-500 px-5 py-3 font-medium text-white transition hover:bg-violet-400">
          Save idea
        </button>
      </form>

      <section className="rounded-[2rem] border border-slate-800 bg-slate-900/70 p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-violet-300">Stored ideas</p>
            <h3 className="mt-2 text-2xl font-semibold text-white">Keep the main list uncluttered</h3>
          </div>
          <button type="button" onClick={onAddApp} className="rounded-2xl border border-slate-700 px-4 py-2 text-sm text-slate-200 transition hover:border-violet-400 hover:text-white">
            Add app manually
          </button>
        </div>

        <div className="mt-6 space-y-4">
          {ideas.map((idea) => (
            <div key={idea.id} className="rounded-3xl border border-slate-800 bg-slate-950/70 p-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <p className="text-lg font-medium text-white">{idea.title}</p>
                  <p className="mt-1 text-sm text-slate-400">{idea.category || 'General'} • {formatDate(idea.created_at)}</p>
                  <p className="mt-3 text-sm leading-7 text-slate-300">{idea.description || 'No description yet.'}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {parseTags(idea.tags).map((tag) => (
                    <span key={tag} className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-200">#{tag}</span>
                  ))}
                </div>
              </div>

              <div className="mt-4 flex gap-2">
                <button type="button" onClick={() => onConvertIdea(idea.id)} className="rounded-2xl bg-white px-4 py-2 text-sm font-medium text-slate-950 transition hover:bg-slate-200">
                  Convert → Create App
                </button>
                <button type="button" onClick={() => onDeleteIdea(idea.id)} className="rounded-2xl border border-rose-500/30 px-4 py-2 text-sm text-rose-300 transition hover:border-rose-400 hover:text-rose-200">
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function SettingsPage() {
  return (
    <section className="grid gap-6 xl:grid-cols-2">
      <div className="rounded-[2rem] border border-slate-800 bg-slate-900/70 p-6">
        <p className="text-sm uppercase tracking-[0.3em] text-violet-300">Profile</p>
        <h3 className="mt-2 text-2xl font-semibold text-white">Minimal settings only</h3>
        <div className="mt-6 space-y-4 text-sm text-slate-300">
          <label className="block">
            Display name
            <input defaultValue="Founder" className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-violet-400" />
          </label>
          <label className="block">
            Default app owner
            <input defaultValue="You" className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-violet-400" />
          </label>
        </div>
      </div>

      <div className="rounded-[2rem] border border-slate-800 bg-slate-900/70 p-6">
        <p className="text-sm uppercase tracking-[0.3em] text-violet-300">Default templates</p>
        <h3 className="mt-2 text-2xl font-semibold text-white">Keep future policies lightweight</h3>
        <div className="mt-6 space-y-4 text-sm text-slate-300">
          <label className="block">
            Default statuses
            <input defaultValue="Idea, In Progress, Completed" className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-violet-400" />
          </label>
          <label className="block">
            Default tags starter
            <input defaultValue="ai, utility, game" className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-violet-400" />
          </label>
        </div>
      </div>
    </section>
  );
}

export default function App() {
  const [page, setPage] = useState('Dashboard');
  const [apps, setApps] = useState([]);
  const [ideas, setIdeas] = useState([]);
  const [source, setSource] = useState('loading');
  const [filters, setFilters] = useState({ search: '', status: 'All', type: 'All', tag: '', category: 'All' });
  const [selectedAppId, setSelectedAppId] = useState(null);
  const [appForm, setAppForm] = useState(defaultApp);
  const [ideaForm, setIdeaForm] = useState(defaultIdea);
  const [formMode, setFormMode] = useState('create');

  const loadApps = async () => {
    const response = await fetch('/api/apps');
    const payload = await response.json();
    setApps(payload.data ?? []);
    setSource(payload.source ?? 'api');
  };

  const loadIdeas = async () => {
    const response = await fetch('/api/ideas');
    const payload = await response.json();
    setIdeas(payload.data ?? []);
  };

  useEffect(() => {
    Promise.all([loadApps(), loadIdeas()]).catch(() => setSource('offline'));
  }, []);

  const categories = useMemo(() => [...new Set(apps.map((app) => app.category).filter(Boolean))], [apps]);

  const filteredApps = useMemo(() => apps.filter((app) => {
    const matchesSearch = !filters.search || app.name.toLowerCase().includes(filters.search.toLowerCase());
    const matchesStatus = filters.status === 'All' || app.status === filters.status;
    const matchesType = filters.type === 'All' || app.type === filters.type;
    const matchesCategory = filters.category === 'All' || app.category === filters.category;
    const matchesTag = !filters.tag || parseTags(app.tags).some((tag) => tag.toLowerCase().includes(filters.tag.toLowerCase()));

    return matchesSearch && matchesStatus && matchesType && matchesCategory && matchesTag;
  }), [apps, filters]);

  const selectedApp = apps.find((entry) => entry.id === selectedAppId) ?? null;

  const openCreateForm = () => {
    setFormMode('create');
    setAppForm(defaultApp);
    setSelectedAppId(null);
    setPage('App Form');
  };

  const openEditForm = (app) => {
    setFormMode('edit');
    setSelectedAppId(app.id);
    setAppForm({
      ...defaultApp,
      ...app,
      links: { github: app.links?.github || '', playStore: app.links?.playStore || '' },
      tags: parseTags(app.tags).join(', ')
    });
    setPage('App Form');
  };

  const openDetail = (app) => {
    setSelectedAppId(app.id);
    setPage('App Detail');
  };

  const handleSubmitApp = async (event) => {
    event.preventDefault();
    const method = formMode === 'edit' ? 'PUT' : 'POST';
    const endpoint = formMode === 'edit' ? `/api/apps/${selectedAppId}` : '/api/apps';
    const response = await fetch(endpoint, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...appForm, tags: parseTags(appForm.tags) })
    });

    if (!response.ok) {
      return;
    }

    const saved = await response.json();
    setApps((current) => {
      if (formMode === 'edit') {
        return current.map((entry) => (entry.id === saved.id ? saved : entry));
      }
      return [saved, ...current];
    });
    setSelectedAppId(saved.id);
    setPage('App Detail');
  };

  const handleDeleteApp = async (app) => {
    const confirmed = window.confirm(`Delete ${app.name}?`);
    if (!confirmed) {
      return;
    }

    const response = await fetch(`/api/apps/${app.id}`, { method: 'DELETE' });
    if (!response.ok) {
      return;
    }

    setApps((current) => current.filter((entry) => entry.id !== app.id));
    setSelectedAppId((current) => (current === app.id ? null : current));
    setPage('Apps');
  };

  const handleSubmitIdea = async (event) => {
    event.preventDefault();
    const response = await fetch('/api/ideas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...ideaForm, tags: parseTags(ideaForm.tags) })
    });

    if (!response.ok) {
      return;
    }

    const saved = await response.json();
    setIdeas((current) => [saved, ...current]);
    setIdeaForm(defaultIdea);
  };

  const handleDeleteIdea = async (ideaId) => {
    const response = await fetch(`/api/ideas/${ideaId}`, { method: 'DELETE' });
    if (!response.ok) {
      return;
    }

    setIdeas((current) => current.filter((entry) => entry.id !== ideaId));
  };

  const handleConvertIdea = async (ideaId) => {
    const response = await fetch(`/api/ideas/${ideaId}/convert`, { method: 'POST' });
    if (!response.ok) {
      return;
    }

    const appRecord = await response.json();
    setIdeas((current) => current.filter((entry) => entry.id !== ideaId));
    setApps((current) => [appRecord, ...current]);
    setSelectedAppId(appRecord.id);
    setPage('App Detail');
  };

  const titleMap = {
    Dashboard: 'Track all your Android apps without clutter',
    Apps: 'Manage every app with search, filters, edit, and delete actions',
    Ideas: 'Store rough ideas before they become real app records',
    Settings: 'Minimal settings for your personal workflow',
    'App Form': formMode === 'edit' ? 'Edit app details' : 'Create a new app record',
    'App Detail': 'See a full app view with notes, links, and quick actions'
  };

  const subtitleMap = {
    Dashboard: 'Focus on control-center essentials: stats, recent apps, idea capture, and clear navigation.',
    Apps: 'Use custom categories, filter tabs, and quick actions instead of a cluttered dashboard.',
    Ideas: 'This vault keeps the main apps list clean until an idea deserves a full record.',
    Settings: 'No bloat: only profile and default template settings are included.',
    'App Form': 'This is the most important screen: add or edit your app with just the fields that matter.',
    'App Detail': 'Review the full app record, then edit or delete when needed.'
  };

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-4 text-slate-100 md:px-6 md:py-6">
      <div className="mx-auto grid max-w-7xl gap-6 xl:grid-cols-[280px_1fr]">
        <Sidebar page={page} onNavigate={setPage} onAddApp={openCreateForm} />

        <div className="space-y-6">
          <TopBar title={titleMap[page]} subtitle={subtitleMap[page]} source={source} />

          {page === 'Dashboard' && <Dashboard apps={apps} ideas={ideas} onOpenApp={openDetail} onNavigate={setPage} />}
          {page === 'Apps' && (
            <AppsPage
              apps={filteredApps}
              filters={filters}
              setFilters={setFilters}
              categories={categories}
              onAddApp={openCreateForm}
              onOpenApp={openDetail}
              onEditApp={openEditForm}
              onDeleteApp={handleDeleteApp}
            />
          )}
          {page === 'Ideas' && (
            <IdeasPage
              ideas={ideas}
              ideaForm={ideaForm}
              setIdeaForm={setIdeaForm}
              onSubmitIdea={handleSubmitIdea}
              onConvertIdea={handleConvertIdea}
              onDeleteIdea={handleDeleteIdea}
              onAddApp={openCreateForm}
            />
          )}
          {page === 'Settings' && <SettingsPage />}
          {page === 'App Form' && (
            <AppFormPage
              title={formMode === 'edit' ? 'Edit app' : 'Add a new app'}
              form={appForm}
              setForm={setAppForm}
              onSubmit={handleSubmitApp}
              onCancel={() => setPage(selectedAppId ? 'App Detail' : 'Apps')}
              submitLabel={formMode === 'edit' ? 'Save changes' : 'Create app'}
            />
          )}
          {page === 'App Detail' && selectedApp && <AppDetailPage app={selectedApp} onEdit={openEditForm} onDelete={handleDeleteApp} />}
        </div>
      </div>
    </main>
  );
}
