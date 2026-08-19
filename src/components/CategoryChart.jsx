import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const COLORS = ['#d97706', '#8b5cf6', '#f59e0b', '#0d9488', '#ec4899', '#78716c'];

export default function CategoryChart({ purchases }) {
  const totals = purchases.reduce((acc, p) => {
    acc[p.category] = (acc[p.category] || 0) + p.total;
    return acc;
  }, {});

  const data = Object.entries(totals)
    .map(([name, value]) => ({ name, value: +value.toFixed(2) }))
    .sort((a, b) => b.value - a.value);

  if (data.length === 0) {
    return (
      <div className="bg-white dark:bg-stone-800 rounded-2xl shadow-sm border border-stone-100 dark:border-stone-700 p-6 flex items-center justify-center h-48 text-sm text-stone-500 dark:text-stone-400">
        Sin datos de categorías
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-stone-800 rounded-2xl shadow-sm border border-stone-100 dark:border-stone-700 p-6">
      <h2 className="text-base font-bold text-stone-800 dark:text-stone-100 mb-4">Gasto por categoría</h2>
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={80}
            paddingAngle={3}
            dataKey="value"
          >
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={v => v.toFixed(2) + ' €'} />
          <Legend wrapperStyle={{ fontSize: 11 }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
