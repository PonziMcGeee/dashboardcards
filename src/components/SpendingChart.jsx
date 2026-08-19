import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { format, parseISO, eachDayOfInterval, eachMonthOfInterval, differenceInDays, startOfMonth, endOfMonth } from 'date-fns';
import { es } from 'date-fns/locale';

function buildDailyData(purchases, sales, start, end) {
  const range = eachDayOfInterval({ start, end });
  return range.map(day => {
    const key = format(day, 'yyyy-MM-dd');
    const label = format(day, 'd MMM', { locale: es });
    const compras = purchases.filter(p => p.date === key).reduce((s, p) => s + p.total, 0);
    const ventas = sales.filter(s => s.date === key).reduce((s, v) => s + v.total, 0);
    return { date: label, Compras: +compras.toFixed(2), Ventas: +ventas.toFixed(2) };
  });
}

function buildMonthlyData(purchases, sales, start, end) {
  const range = eachMonthOfInterval({ start: startOfMonth(start), end: startOfMonth(end) });
  return range.map(month => {
    const monthKey = format(month, 'yyyy-MM');
    const label = format(month, 'MMM yy', { locale: es });
    const compras = purchases.filter(p => p.date.startsWith(monthKey)).reduce((s, p) => s + p.total, 0);
    const ventas = sales.filter(s => s.date.startsWith(monthKey)).reduce((s, v) => s + v.total, 0);
    return { date: label, Compras: +compras.toFixed(2), Ventas: +ventas.toFixed(2) };
  });
}

function buildChartData(purchases, sales, dateFrom, dateTo) {
  const end = dateTo || new Date();

  let start;
  if (!dateFrom) {
    const allDates = [...purchases.map(p => p.date), ...sales.map(s => s.date)].sort();
    if (!allDates.length) return [];
    start = parseISO(allDates[0]);
  } else {
    start = dateFrom;
  }

  const diff = differenceInDays(end, start);
  return diff > 90 ? buildMonthlyData(purchases, sales, start, end) : buildDailyData(purchases, sales, start, end);
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-stone-700 border border-stone-200 dark:border-stone-600 rounded-xl shadow-lg p-3 text-xs">
      <p className="font-semibold text-stone-700 dark:text-stone-200 mb-2">{label}</p>
      {payload.map(p => (
        <p key={p.name} style={{ color: p.color }} className="font-medium">
          {p.name}: {p.value.toFixed(2)} €
        </p>
      ))}
    </div>
  );
};

export default function SpendingChart({ purchases, sales, dateFrom, dateTo, label }) {
  const data = buildChartData(purchases, sales, dateFrom, dateTo);

  return (
    <div className="bg-white dark:bg-stone-800 rounded-lg border border-stone-200 dark:border-stone-700 p-6">
      <h2 className="text-base font-bold text-stone-800 dark:text-stone-100 mb-4">{label || 'Últimos 30 días'}</h2>
      {data.length === 0 ? (
        <div className="flex items-center justify-center h-[220px] text-stone-500 dark:text-stone-400 text-sm">
          Sin datos para el período seleccionado
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={data} margin={{ top: 4, right: 8, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="gradCompras" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#d97706" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#d97706" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradVentas" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 10, fill: '#a8a29e' }}
              interval="preserveStartEnd"
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 10, fill: '#a8a29e' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={v => v + '€'}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Area type="monotone" dataKey="Compras" stroke="#d97706" strokeWidth={2} fill="url(#gradCompras)" />
            <Area type="monotone" dataKey="Ventas" stroke="#22c55e" strokeWidth={2} fill="url(#gradVentas)" />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
