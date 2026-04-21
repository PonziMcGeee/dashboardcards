import { useState } from 'react';
import PurchaseForm from './PurchaseForm';
import ItemList from './ItemList';

export default function PurchasesView({ purchases, onAdd, onRemove, onUpdate }) {
  const [search, setSearch] = useState('');

  const filtered = purchases.filter(p =>
    p.description.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase()) ||
    (p.collection || '').toLowerCase().includes(search.toLowerCase()) ||
    (p.notes || '').toLowerCase().includes(search.toLowerCase())
  );

  const total = purchases.reduce((s, p) => s + p.total, 0);

  return (
    <div className="space-y-5">
      <PurchaseForm onAdd={onAdd} />
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <input
          type="text"
          placeholder="Buscar compras..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 w-full sm:w-64"
        />
        <div className="text-sm text-gray-500 font-medium whitespace-nowrap">
          {filtered.length} {filtered.length === 1 ? 'compra' : 'compras'} ·{' '}
          <span className="text-blue-600 font-semibold">
            {total.toFixed(2).replace('.', ',')} € total
          </span>
        </div>
      </div>
      <ItemList items={filtered} type="purchase" onRemove={onRemove} onUpdate={onUpdate} />
    </div>
  );
}
