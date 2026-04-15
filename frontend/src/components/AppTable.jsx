import { StatusBadge } from './StatusBadge';

const formatDate = (value) =>
  new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(new Date(value));

export function AppTable({ apps, onOpen, onEdit, onDelete }) {
  if (!apps.length) {
    return (
      <div className="rounded-3xl border border-dashed border-slate-700 bg-slate-900/40 p-10 text-center text-slate-400">
        No apps match your current search or filter.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/70">
      <table className="min-w-full divide-y divide-slate-800 text-left text-sm">
        <thead className="bg-slate-900 text-slate-400">
          <tr>
            <th className="px-6 py-4 font-medium">App name</th>
            <th className="px-6 py-4 font-medium">Type</th>
            <th className="px-6 py-4 font-medium">Category</th>
            <th className="px-6 py-4 font-medium">Status</th>
            <th className="px-6 py-4 font-medium">Last updated</th>
            <th className="px-6 py-4 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800 text-slate-200">
          {apps.map((app) => (
            <tr key={app.id} className="align-top">
              <td className="px-6 py-4">
                <button type="button" onClick={() => onOpen(app)} className="text-left">
                  <p className="font-medium text-white transition hover:text-violet-300">{app.name}</p>
                  <p className="mt-1 max-w-md text-sm text-slate-400">{app.description || 'No description yet.'}</p>
                </button>
              </td>
              <td className="px-6 py-4 text-slate-300">{app.type}</td>
              <td className="px-6 py-4 text-slate-300">{app.category}</td>
              <td className="px-6 py-4"><StatusBadge status={app.status} /></td>
              <td className="px-6 py-4 text-slate-400">{formatDate(app.updated_at || app.created_at)}</td>
              <td className="px-6 py-4">
                <div className="flex flex-wrap gap-2">
                  <button type="button" onClick={() => onEdit(app)} className="rounded-full border border-slate-700 px-3 py-1.5 text-xs text-slate-200 transition hover:border-violet-400 hover:text-white">
                    Edit
                  </button>
                  <button type="button" onClick={() => onDelete(app)} className="rounded-full border border-rose-500/30 px-3 py-1.5 text-xs text-rose-300 transition hover:border-rose-400 hover:text-rose-200">
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
