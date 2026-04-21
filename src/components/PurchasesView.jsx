import { useState } from 'react';
import PurchaseForm from './PurchaseForm';
import ItemList from './ItemList';

export default function PurchasesView({ purchases, collections, onAdd, onRemove, onUpdate }) {
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('date-desc');

  const filtered = purchases.filter(p =>
    p.description.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase()) ||
    (p.collection || '').toLowerCase().includes(search.toLowerCase()) ||
    (p.notes || '').toLowerCase().includes(search.toLowerCase())
  );

  const sorted = [...filtered];
  if (sort === 'date-asc')   sorted.sort((a, b) => a.date.localeCompare(b.date));
  if (sort === 'date-desc')  sorted.sort((a, b) => b.date.localeCompare(a.date));
  if (sort === 'price-desc') sorted.sort((a, b) => b.total - a.total);
  if (sort === 'price-asc')  sorted.sort((a, b) => a.total - b.total);

  const total = purchases.reduce((s, p) => s + p.total, 0);

  return (
    <div className="space-y-5">
      <PurchaseForm onAdd={onAdd} collections={collections} />
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex gap-2 flex-1">
          <input
            type="text"
            placeholder="Buscar compras..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 sm:max-w-64 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <select
            value={sort}
            onChange={e => setSort(e.target.value)}
            className="border border-gray-200 rounded-lg px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="date-desc">Fecha ↓</option>
            <option value="date-asc">Fecha ↑</option>
            <option value="price-desc">Precio ↓</option>
            <option value="price-asc">Precio ↑</option>
          </select>
        </div>
        <div className="text-sm text-gray-500 font-medium whitespace-nowrap">
          {filtered.length} {filtered.length === 1 ? 'compra' : 'compras'} ·{' '}
          <span className="text-blue-600 font-semibold">
            {total.toFixed(2).replace('.', ',')} € total
          </span>
        </div>
      </div>
      <ItemList items={sorted} type="purchase" onRemove={onRemove} onUpdate={onUpdate} collections={collections} />
    </div>
  );
}
