export function StatCard({ label, value, helper, accent = 'violet' }) {
  const accentStyles = {
    violet: 'from-violet-500/20 to-slate-900',
    sky: 'from-sky-500/20 to-slate-900',
    emerald: 'from-emerald-500/20 to-slate-900',
    amber: 'from-amber-500/20 to-slate-900'
  };

  return (
    <div className={`rounded-3xl border border-slate-800 bg-gradient-to-br ${accentStyles[accent]} p-5 shadow-lg shadow-slate-950/20`}>
      <p className="text-sm text-slate-400">{label}</p>
      <p className="mt-3 text-3xl font-semibold text-white">{value}</p>
      <p className="mt-2 text-sm text-slate-500">{helper}</p>
    </div>
  );
}
