import { ArrowUp, ArrowDown } from 'lucide-react';

export default function StatCard({ label, value, sub, color = 'blue', icon: Icon, trend }) {
  const colors = {
    blue:   'from-blue-500 to-blue-600',
    green:  'from-green-500 to-green-600',
    red:    'from-red-500 to-red-600',
    purple: 'from-purple-500 to-purple-600',
    orange: 'from-orange-500 to-orange-600',
  };

  return (
    <div className={`bg-gradient-to-br ${colors[color]} rounded-2xl p-5 text-white shadow-lg`}>
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium opacity-80">{label}</p>
          <p className="text-3xl font-bold mt-1 truncate">{value}</p>
          {sub && <p className="text-xs opacity-70 mt-1">{sub}</p>}
          {trend !== null && trend !== undefined && (
            <div className="flex items-center gap-1 mt-2 text-xs font-semibold opacity-90">
              {trend >= 0
                ? <ArrowUp size={12} />
                : <ArrowDown size={12} />}
              <span>{Math.abs(trend).toFixed(1)}% vs período anterior</span>
            </div>
          )}
        </div>
        {Icon && (
          <div className="bg-white/20 rounded-xl p-2 shrink-0 ml-2">
            <Icon size={22} />
          </div>
        )}
      </div>
    </div>
  );
}
