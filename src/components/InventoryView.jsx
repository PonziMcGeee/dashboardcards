import { useState } from 'react';
import { Package, TrendingUp, Wallet } from 'lucide-react';
import StatCard from './StatCard';
import InventoryForm from './InventoryForm';
import InventoryList from './InventoryList';

function fmt(n) {
  return n.toFixed(2).replace('.', ',') + ' €';
}

export default function InventoryView({ inventory, collections, onAdd, onRemove, onUpdate }) {
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('date-desc');
  const [filterCollection, setFilterCollection] = useState('');

  const filtered = inventory
    .filter(i => !filterCollection || i.collection === filterCollection)
    .filter(i =>
      i.description.toLowerCase().includes(search.toLowerCase()) ||
      (i.notes || '').toLowerCase().includes(search.toLowerCase())
    );

  const sorted = [...filtered];
  if (sort === 'date-asc')   sorted.sort((a, b) => a.date.localeCompare(b.date));
  if (sort === 'date-desc')  sorted.sort((a, b) => b.date.localeCompare(a.date));
  if (sort === 'gain-desc')  sorted.sort((a, b) => (b.currentPrice - b.purchasePrice) * b.quantity - (a.currentPrice - a.purchasePrice) * a.quantity);
  if (sort === 'gain-asc')   sorted.sort((a, b) => (a.currentPrice - a.purchasePrice) * a.quantity - (b.currentPrice - b.purchasePrice) * b.quantity);
  if (sort === 'value-desc') sorted.sort((a, b) => b.currentPrice * b.quantity - a.currentPrice * a.quantity);

  const totalInvested = inventory.reduce((s, i) => s + i.purchasePrice * i.quantity, 0);
  const totalValue    = inventory.reduce((s, i) => s + i.currentPrice  * i.quantity, 0);
  const totalGain     = totalValue - totalInvested;
  const gainPct       = totalInvested > 0 ? (totalGain / totalInvested) * 100 : null;

  const inputCls = 'border border-gray-200 dark:border-gray-600 rounded-lg px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 dark:bg-gray-700 dark:text-gray-100';

  return (
    <div className="space-y-5">

      {/* Stats — only when there's data */}
      {inventory.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
            label="Total invertido"
            value={fmt(totalInvested)}
            sub={`${inventory.length} ${inventory.length === 1 ? 'artículo' : 'artículos'}`}
            color="blue"
            icon={Package}
          />
          <StatCard
            label="Valor actual"
            value={fmt(totalValue)}
            sub="a precios actuales"
            color="purple"
            icon={TrendingUp}
          />
          <StatCard
            label="Ganancia latente"
            value={`${totalGain >= 0 ? '+' : ''}${fmt(totalGain)}`}
            sub={gainPct !== null ? `${gainPct >= 0 ? '+' : ''}${gainPct.toFixed(1)}% sobre lo invertido` : ''}
            color={totalGain >= 0 ? 'green' : 'red'}
            icon={Wallet}
          />
        </div>
      )}

      <InventoryForm onAdd={onAdd} collections={collections} />

      {/* Controls */}
      {inventory.length > 0 && (
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex gap-2 flex-1 flex-wrap">
            <input
              type="text"
              placeholder="Buscar artículos..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className={`flex-1 sm:max-w-56 ${inputCls}`}
            />
            <select value={filterCollection} onChange={e => setFilterCollection(e.target.value)} className={inputCls}>
              <option value="">Todas las colecciones</option>
              {collections.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
            </select>
            <select value={sort} onChange={e => setSort(e.target.value)} className={inputCls}>
              <option value="date-desc">Fecha ↓</option>
              <option value="date-asc">Fecha ↑</option>
              <option value="gain-desc">Ganancia ↓</option>
              <option value="gain-asc">Ganancia ↑</option>
              <option value="value-desc">Valor actual ↓</option>
            </select>
          </div>
          <span className="text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
            {filtered.length} {filtered.length === 1 ? 'artículo' : 'artículos'}
          </span>
        </div>
      )}

      <InventoryList items={sorted} onRemove={onRemove} onUpdate={onUpdate} collections={collections} />
    </div>
  );
}
