import { ShoppingCart, TrendingUp, TrendingDown, Wallet } from 'lucide-react';
import StatCard from './StatCard';
import SpendingChart from './SpendingChart';
import CategoryChart from './CategoryChart';
import { format, startOfMonth } from 'date-fns';

function fmt(n) {
  return n.toFixed(2).replace('.', ',') + ' €';
}

export default function DashboardView({ purchases, sales }) {
  const totalSpent = purchases.reduce((s, p) => s + p.total, 0);
  const totalSales = sales.reduce((s, v) => s + v.total, 0);
  const totalProfit = sales.reduce((s, v) => s + v.profit, 0);
  const balance = totalSales - totalSpent;

  const monthKey = format(startOfMonth(new Date()), 'yyyy-MM');
  const monthSpent = purchases
    .filter(p => p.date.startsWith(monthKey))
    .reduce((s, p) => s + p.total, 0);
  const monthSales = sales
    .filter(v => v.date.startsWith(monthKey))
    .reduce((s, v) => s + v.total, 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Gasto total"
          value={fmt(totalSpent)}
          sub={`Este mes: ${fmt(monthSpent)}`}
          color="blue"
          icon={ShoppingCart}
        />
        <StatCard
          label="Ventas totales"
          value={fmt(totalSales)}
          sub={`Este mes: ${fmt(monthSales)}`}
          color="green"
          icon={TrendingUp}
        />
        <StatCard
          label="Beneficio neto"
          value={fmt(totalProfit)}
          sub="Con coste de compra"
          color={totalProfit >= 0 ? 'green' : 'red'}
          icon={TrendingDown}
        />
        <StatCard
          label="Balance"
          value={fmt(balance)}
          sub="Ventas − Compras"
          color={balance >= 0 ? 'purple' : 'orange'}
          icon={Wallet}
        />
      </div>

      <SpendingChart purchases={purchases} sales={sales} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <CategoryChart purchases={purchases} />
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-3">Resumen rápido</h2>
          <div className="space-y-3 text-sm">
            <Row label="Compras registradas" value={purchases.length} />
            <Row label="Ventas registradas" value={sales.length} />
            <Row label="Artículos comprados" value={purchases.reduce((s, p) => s + p.quantity, 0)} />
            <Row label="Artículos vendidos" value={sales.reduce((s, v) => s + v.quantity, 0)} />
            <div className="border-t border-gray-100 pt-3">
              <Row label="Gasto promedio/compra" value={purchases.length ? fmt(totalSpent / purchases.length) : '—'} />
              <Row label="Precio promedio/venta" value={sales.length ? fmt(totalSales / sales.length) : '—'} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between items-center text-sm">
      <span className="text-gray-500">{label}</span>
      <span className="font-semibold text-gray-800">{value}</span>
    </div>
  );
}
