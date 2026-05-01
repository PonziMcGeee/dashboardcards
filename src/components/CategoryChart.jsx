import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const COLORS = ['#3b82f6', '#8b5cf6', '#f59e0b', '#f97316', '#ec4899', '#6b7280'];

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
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-center justify-center h-48 text-sm text-gray-400">
        Sin datos de categorías
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <h2 className="text-base font-bold text-gray-800 mb-4">Gasto por categoría</h2>
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
