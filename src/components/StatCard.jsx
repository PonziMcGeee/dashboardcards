import { ArrowUp, ArrowDown } from 'lucide-react';

export default function StatCard({ label, value, sub, color = 'blue', icon: Icon, trend }) {
  const colors = {
    blue:   'from-blue-500 to-blue-700',
    green:  'from-emerald-500 to-emerald-700',
    red:    'from-red-500 to-red-700',
    purple: 'from-violet-500 to-violet-700',
    orange: 'from-orange-500 to-orange-600',
  };

  return (
    <div className={`bg-gradient-to-br ${colors[color]} rounded-2xl p-5 text-white shadow-lg relative overflow-hidden`}>
      {/* Background decoration */}
      <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/5 rounded-full" />
      <div className="absolute -bottom-6 -right-2 w-16 h-16 bg-white/5 rounded-full" />

      <div className="relative flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold uppercase tracking-widest opacity-75">{label}</p>
          <p className="text-3xl font-extrabold mt-1 tracking-tight truncate">{value}</p>
          {trend !== null && trend !== undefined ? (
            <div className={`flex items-center gap-1 mt-1.5 text-xs font-semibold ${trend >= 0 ? 'text-white/80' : 'text-white/80'}`}>
              {trend >= 0 ? <ArrowUp size={11} /> : <ArrowDown size={11} />}
              <span>{Math.abs(trend).toFixed(1)}% vs anterior</span>
            </div>
          ) : (
            sub && <p className="text-xs opacity-60 mt-1">{sub}</p>
          )}
        </div>
        {Icon && (
          <div className="bg-white/20 rounded-xl p-2.5 shrink-0 ml-3 backdrop-blur-sm">
            <Icon size={20} />
          </div>
        )}
      </div>
    </div>
  );
}
