import { useState } from 'react';
import SaleForm from './SaleForm';
import ItemList from './ItemList';

export default function SalesView({ sales, collections, onAdd, onRemove, onUpdate }) {
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('date-desc');

  const filtered = sales.filter(s =>
    s.description.toLowerCase().includes(search.toLowerCase()) ||
    s.platform.toLowerCase().includes(search.toLowerCase()) ||
    (s.collection || '').toLowerCase().includes(search.toLowerCase()) ||
    (s.notes || '').toLowerCase().includes(search.toLowerCase())
  );

  const sorted = [...filtered];
  if (sort === 'date-asc')   sorted.sort((a, b) => a.date.localeCompare(b.date));
  if (sort === 'date-desc')  sorted.sort((a, b) => b.date.localeCompare(a.date));
  if (sort === 'price-desc') sorted.sort((a, b) => b.total - a.total);
  if (sort === 'price-asc')  sorted.sort((a, b) => a.total - b.total);

  const totalSales = sales.reduce((s, v) => s + v.total, 0);

  return (
    <div className="space-y-5">
      <SaleForm onAdd={onAdd} collections={collections} />
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex gap-2 flex-1">
          <input
            type="text"
            placeholder="Buscar ventas..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 sm:max-w-64 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
          />
          <select
            value={sort}
            onChange={e => setSort(e.target.value)}
            className="border border-gray-200 rounded-lg px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
          >
            <option value="date-desc">Fecha ↓</option>
            <option value="date-asc">Fecha ↑</option>
            <option value="price-desc">Precio ↓</option>
            <option value="price-asc">Precio ↑</option>
          </select>
        </div>
        <div className="text-sm text-gray-500 font-medium whitespace-nowrap flex gap-4">
          <span>{filtered.length} {filtered.length === 1 ? 'venta' : 'ventas'}</span>
          <span className="text-green-600 font-semibold">
            {totalSales.toFixed(2).replace('.', ',')} € vendido
          </span>
        </div>
      </div>
      <ItemList items={sorted} type="sale" onRemove={onRemove} onUpdate={onUpdate} collections={collections} />
    </div>
  );
}
