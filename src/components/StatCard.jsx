import { ArrowUp, ArrowDown } from 'lucide-react';

// Tratamiento "slab de gradación": banda de etiqueta arriba (como la ficha de una
// carta certificada), cifra en monoespaciada tabular, icono como sello en la esquina
// en vez del chip difuminado + degradado genérico.
export default function StatCard({ label, value, sub, color = 'amber', icon: Icon, trend }) {
  const bands = {
    amber:  'bg-amber-600',
    green:  'bg-emerald-700',
    red:    'bg-red-700',
    purple: 'bg-violet-700',
    orange: 'bg-orange-600',
  };
  const figures = {
    amber:  'text-amber-700 dark:text-amber-400',
    green:  'text-emerald-700 dark:text-emerald-400',
    red:    'text-red-700 dark:text-red-400',
    purple: 'text-violet-700 dark:text-violet-400',
    orange: 'text-orange-700 dark:text-orange-400',
  };

  return (
    <div className="bg-white dark:bg-stone-800 rounded-lg border border-stone-200 dark:border-stone-700 overflow-hidden">
      {/* Label band — como la ficha superior de un slab certificado */}
      <div className={`${bands[color]} px-4 py-1.5 flex items-center justify-between`}>
        <span className="text-[11px] font-bold uppercase tracking-widest text-white/90">{label}</span>
        {Icon && (
          <div className="w-5 h-5 rounded border border-white/40 flex items-center justify-center shrink-0">
            <Icon size={11} className="text-white" />
          </div>
        )}
      </div>

      <div className="px-4 py-3.5">
        <p className={`figure text-[1.75rem] font-bold leading-tight truncate ${figures[color]}`}>{value}</p>
        {trend !== null && trend !== undefined ? (
          <div className={`flex items-center gap-1 mt-1 text-xs font-semibold ${trend >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
            {trend >= 0 ? <ArrowUp size={11} /> : <ArrowDown size={11} />}
            <span className="figure">{Math.abs(trend).toFixed(1)}%</span>
            <span className="text-stone-400 dark:text-stone-500 font-normal">vs anterior</span>
          </div>
        ) : (
          sub && <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">{sub}</p>
        )}
      </div>
    </div>
  );
}
