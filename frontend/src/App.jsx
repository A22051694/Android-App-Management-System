import { useEffect, useMemo, useState } from 'react';
import { AppTable } from './components/AppTable';
import { StatCard } from './components/StatCard';

const emptyForm = {
  name: '',
  category: '',
  status: 'Idea',
  priority: 'Medium',
  summary: ''
};

export default function App() {
  const [apps, setApps] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [source, setSource] = useState('loading');

  useEffect(() => {
    fetch('/api/apps')
      .then((response) => response.json())
      .then((payload) => {
        setApps(payload.data ?? []);
        setSource(payload.source ?? 'api');
      })
      .catch(() => setSource('offline'));
  }, []);

  const stats = useMemo(() => {
    const ideas = apps.filter((app) => app.status === 'Idea').length;
    const active = apps.filter((app) => ['Research', 'Prototype', 'Building'].includes(app.status)).length;
    const highPriority = apps.filter((app) => app.priority === 'High').length;

    return { total: apps.length, ideas, active, highPriority };
  }, [apps]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    const response = await fetch('/api/apps', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });

    if (!response.ok) {
      return;
    }

    const record = await response.json();
    setApps((current) => [record, ...current]);
    setForm(emptyForm);
  };

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-8 text-slate-100 md:px-10">
      <div className="mx-auto flex max-w-7xl flex-col gap-8">
        <section className="rounded-3xl border border-violet-500/20 bg-gradient-to-br from-slate-900 via-slate-950 to-violet-950/40 p-8">
          <p className="text-sm uppercase tracking-[0.35em] text-violet-300">Android Management System</p>
          <div className="mt-4 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <h1 className="text-4xl font-semibold text-white md:text-5xl">Track every Android app idea in one focused dashboard.</h1>
              <p className="mt-4 text-lg text-slate-300">
                AMS helps you capture, prioritize, and move your app ideas from messy notes into a working shipping pipeline.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-900/80 px-4 py-3 text-sm text-slate-300">
              Data source: <span className="font-semibold text-white">{source}</span>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Total apps" value={stats.total} helper="Everything in your current pipeline" />
          <StatCard label="Fresh ideas" value={stats.ideas} helper="Concepts not yet researched" />
          <StatCard label="In progress" value={stats.active} helper="Ideas with validation or prototype work" />
          <StatCard label="High priority" value={stats.highPriority} helper="Apps worth building next" />
        </section>

        <section className="grid gap-8 xl:grid-cols-[1.4fr_0.8fr]">
          <AppTable apps={apps} />

          <form onSubmit={handleSubmit} className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-violet-300">Capture a new app</p>
              <h2 className="mt-2 text-2xl font-semibold text-white">Add your next Android idea</h2>
            </div>

            <div className="mt-6 space-y-4">
              <label className="block text-sm text-slate-300">
                App name
                <input
                  className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-violet-400"
                  value={form.name}
                  onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                  placeholder="Example: Habit Hero"
                  required
                />
              </label>

              <label className="block text-sm text-slate-300">
                Category
                <input
                  className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-violet-400"
                  value={form.category}
                  onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))}
                  placeholder="Health, Finance, Education..."
                  required
                />
              </label>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="block text-sm text-slate-300">
                  Stage
                  <select
                    className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-violet-400"
                    value={form.status}
                    onChange={(event) => setForm((current) => ({ ...current, status: event.target.value }))}
                  >
                    <option>Idea</option>
                    <option>Research</option>
                    <option>Prototype</option>
                    <option>Building</option>
                    <option>Launched</option>
                  </select>
                </label>

                <label className="block text-sm text-slate-300">
                  Priority
                  <select
                    className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-violet-400"
                    value={form.priority}
                    onChange={(event) => setForm((current) => ({ ...current, priority: event.target.value }))}
                  >
                    <option>Low</option>
                    <option>Medium</option>
                    <option>High</option>
                  </select>
                </label>
              </div>

              <label className="block text-sm text-slate-300">
                Summary
                <textarea
                  className="mt-2 min-h-32 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-violet-400"
                  value={form.summary}
                  onChange={(event) => setForm((current) => ({ ...current, summary: event.target.value }))}
                  placeholder="What problem does it solve?"
                  required
                />
              </label>
            </div>

            <button
              type="submit"
              className="mt-6 inline-flex w-full items-center justify-center rounded-2xl bg-violet-500 px-4 py-3 font-medium text-white transition hover:bg-violet-400"
            >
              Save app idea
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}
