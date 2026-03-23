const badgeStyles = {
  Idea: 'bg-sky-500/15 text-sky-300',
  Research: 'bg-amber-500/15 text-amber-300',
  Prototype: 'bg-violet-500/15 text-violet-300',
  Building: 'bg-emerald-500/15 text-emerald-300',
  Launched: 'bg-pink-500/15 text-pink-300'
};

export function AppTable({ apps }) {
  return (
    <div className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/70">
      <table className="min-w-full divide-y divide-slate-800 text-left text-sm">
        <thead className="bg-slate-900 text-slate-400">
          <tr>
            <th className="px-6 py-4 font-medium">App</th>
            <th className="px-6 py-4 font-medium">Category</th>
            <th className="px-6 py-4 font-medium">Stage</th>
            <th className="px-6 py-4 font-medium">Priority</th>
            <th className="px-6 py-4 font-medium">Summary</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800 text-slate-200">
          {apps.map((app) => (
            <tr key={app.id}>
              <td className="px-6 py-4">
                <div>
                  <p className="font-medium text-white">{app.name}</p>
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-500">{app.platform}</p>
                </div>
              </td>
              <td className="px-6 py-4">{app.category}</td>
              <td className="px-6 py-4">
                <span className={`rounded-full px-3 py-1 text-xs font-medium ${badgeStyles[app.status] ?? 'bg-slate-800 text-slate-300'}`}>
                  {app.status}
                </span>
              </td>
              <td className="px-6 py-4">{app.priority}</td>
              <td className="px-6 py-4 text-slate-400">{app.summary}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
