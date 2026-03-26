const badgeStyles = {
  Idea: 'bg-sky-500/15 text-sky-300 border-sky-400/20',
  'In Progress': 'bg-amber-500/15 text-amber-300 border-amber-400/20',
  Completed: 'bg-emerald-500/15 text-emerald-300 border-emerald-400/20',
  Building: 'bg-violet-500/15 text-violet-300 border-violet-400/20',
  Published: 'bg-pink-500/15 text-pink-300 border-pink-400/20'
};

export function StatusBadge({ status }) {
  return (
    <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${badgeStyles[status] ?? 'border-slate-700 bg-slate-800 text-slate-300'}`}>
      {status}
    </span>
  );
}
