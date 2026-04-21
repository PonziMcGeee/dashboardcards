import { useState } from 'react';
import SaleForm from './SaleForm';
import ItemList from './ItemList';

export default function SalesView({ sales, onAdd, onRemove, onUpdate }) {
  const [search, setSearch] = useState('');

  const filtered = sales.filter(s =>
    s.description.toLowerCase().includes(search.toLowerCase()) ||
    s.platform.toLowerCase().includes(search.toLowerCase()) ||
    (s.collection || '').toLowerCase().includes(search.toLowerCase()) ||
    (s.notes || '').toLowerCase().includes(search.toLowerCase())
  );

  const totalSales = sales.reduce((s, v) => s + v.total, 0);
  const totalProfit = sales.reduce((s, v) => s + v.profit, 0);

  return (
    <div className="space-y-5">
      <SaleForm onAdd={onAdd} />
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <input
          type="text"
          placeholder="Buscar ventas..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 w-full sm:w-64"
        />
        <div className="text-sm text-gray-500 font-medium whitespace-nowrap flex gap-4">
          <span>
            {filtered.length} {filtered.length === 1 ? 'venta' : 'ventas'}
          </span>
          <span className="text-green-600 font-semibold">
            {totalSales.toFixed(2).replace('.', ',')} € vendido
          </span>
          <span className={totalProfit >= 0 ? 'text-green-500 font-semibold' : 'text-red-500 font-semibold'}>
            {totalProfit >= 0 ? '+' : ''}{totalProfit.toFixed(2).replace('.', ',')} € beneficio
          </span>
        </div>
      </div>
      <ItemList items={filtered} type="sale" onRemove={onRemove} onUpdate={onUpdate} />
    </div>
  );
}
