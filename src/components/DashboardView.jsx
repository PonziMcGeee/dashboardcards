import { useState, useMemo } from 'react';
import { ShoppingCart, TrendingUp, Wallet } from 'lucide-react';
import { subDays, parseISO, isAfter, isBefore, startOfDay, format } from 'date-fns';
import StatCard from './StatCard';
import SpendingChart from './SpendingChart';
import CategoryChart from './CategoryChart';
import ItemList from './ItemList';
import { COLOR_PALETTE } from '../collectionColors';

function fmt(n) {
  return n.toFixed(2).replace('.', ',') + ' €';
}

const DATE_PRESETS = [
  { key: '7',    label: '7d' },
  { key: '30',   label: '30d' },
  { key: '90',   label: '90d' },
  { key: '365',  label: '1 año' },
  { key: 'all',  label: 'Todo' },
  { key: 'custom', label: 'Personalizado' },
];

function applyListFilters(items, search, sort) {
  const q = search.toLowerCase();
  const result = q
    ? items.filter(i =>
        i.description.toLowerCase().includes(q) ||
        (i.notes || '').toLowerCase().includes(q)
      )
    : [...items];
  if (sort === 'date-asc')    result.sort((a, b) => a.date.localeCompare(b.date));
  if (sort === 'date-desc')   result.sort((a, b) => b.date.localeCompare(a.date));
  if (sort === 'price-desc')  result.sort((a, b) => b.total - a.total);
  if (sort === 'price-asc')   result.sort((a, b) => a.total - b.total);
  return result;
}

export default function DashboardView({ purchases, sales, collections, onRemovePurchase, onUpdatePurchase, onRemoveSale, onUpdateSale }) {
  const [filterCollection, setFilterCollection] = useState('');
  const [datePreset, setDatePreset] = useState('30');
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState(format(new Date(), 'yyyy-MM-dd'));

  const [purchaseSearch, setPurchaseSearch] = useState('');
  const [purchaseSort, setPurchaseSort] = useState('date-desc');
  const [saleSearch, setSaleSearch] = useState('');
  const [saleSort, setSaleSort] = useState('date-desc');

  const today = startOfDay(new Date());

  const dateFrom = useMemo(() => {
    if (datePreset === 'all') return null;
    if (datePreset === 'custom') return customFrom ? parseISO(customFrom) : null;
    return subDays(today, parseInt(datePreset) - 1);
  }, [datePreset, customFrom]);

  const dateTo = useMemo(() => {
    if (datePreset === 'custom' && customTo) return parseISO(customTo);
    return today;
  }, [datePreset, customTo]);

  const filteredPurchases = useMemo(() => {
    return purchases
      .filter(p => !filterCollection || p.collection === filterCollection)
      .filter(p => {
        if (!dateFrom) return true;
        const d = parseISO(p.date);
        return !isBefore(d, dateFrom) && !isAfter(d, dateTo);
      });
  }, [purchases, filterCollection, dateFrom, dateTo]);

  const filteredSales = useMemo(() => {
    return sales
      .filter(s => !filterCollection || s.collection === filterCollection)
      .filter(s => {
        if (!dateFrom) return true;
        const d = parseISO(s.date);
        return !isBefore(d, dateFrom) && !isAfter(d, dateTo);
      });
  }, [sales, filterCollection, dateFrom, dateTo]);

  const totalSpent = filteredPurchases.reduce((s, p) => s + p.total, 0);
  const totalSales = filteredSales.reduce((s, v) => s + v.total, 0);
  const balance = totalSales - totalSpent;

  const selectedPresetLabel = DATE_PRESETS.find(p => p.key === datePreset)?.label ?? '';

  const byCollection = collections.map(col => ({
    name: col.name,
    color: COLOR_PALETTE[col.colorIndex % COLOR_PALETTE.length],
    spent: purchases
      .filter(p => p.collection === col.name)
      .filter(p => {
        if (!dateFrom) return true;
        const d = parseISO(p.date);
        return !isBefore(d, dateFrom) && !isAfter(d, dateTo);
      })
      .reduce((s, p) => s + p.total, 0),
    sold: sales
      .filter(v => v.collection === col.name)
      .filter(v => {
        if (!dateFrom) return true;
        const d = parseISO(v.date);
        return !isBefore(d, dateFrom) && !isAfter(d, dateTo);
      })
      .reduce((s, v) => s + v.total, 0),
  }));

  const inputCls = 'border border-gray-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-400';

  return (
    <div className="space-y-6">

      {/* Filter bar */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 space-y-3">
        <div className="flex flex-wrap gap-3 items-center">
          <select
            value={filterCollection}
            onChange={e => setFilterCollection(e.target.value)}
            className={`${inputCls} pr-7`}
          >
            <option value="">Todas las colecciones</option>
            {collections.map(c => (
              <option key={c.id} value={c.name}>{c.name}</option>
            ))}
          </select>

          <div className="flex gap-1 flex-wrap">
            {DATE_PRESETS.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setDatePreset(key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  datePreset === key
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {datePreset === 'custom' && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-gray-500">Desde</span>
            <input
              type="date"
              value={customFrom}
              onChange={e => setCustomFrom(e.target.value)}
              className={inputCls}
            />
            <span className="text-xs text-gray-500">hasta</span>
            <input
              type="date"
              value={customTo}
              onChange={e => setCustomTo(e.target.value)}
              className={inputCls}
            />
          </div>
        )}
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="Gasto total"
          value={fmt(totalSpent)}
          sub={selectedPresetLabel}
          color="blue"
          icon={ShoppingCart}
        />
        <StatCard
          label="Ventas totales"
          value={fmt(totalSales)}
          sub={selectedPresetLabel}
          color="green"
          icon={TrendingUp}
        />
        <StatCard
          label="Beneficio neto"
          value={fmt(balance)}
          sub="Ventas − Compras"
          color={balance >= 0 ? 'green' : 'red'}
          icon={Wallet}
        />
      </div>

      <SpendingChart
        purchases={filteredPurchases}
        sales={filteredSales}
        dateFrom={dateFrom}
        dateTo={dateTo}
        label={
          datePreset === 'custom' && customFrom
            ? `${customFrom} → ${customTo}`
            : datePreset === 'all'
            ? 'Todo el tiempo'
            : `Últimos ${selectedPresetLabel}`
        }
      />

      {/* Collection breakdown — only when not filtering by a single collection */}
      {!filterCollection && byCollection.length > 0 && (
        <div className={`grid grid-cols-1 gap-4 ${byCollection.length >= 3 ? 'md:grid-cols-3' : byCollection.length === 2 ? 'md:grid-cols-2' : 'md:grid-cols-1 max-w-sm'}`}>
          {byCollection.map(({ name, color, spent, sold }) => (
            <div key={name} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <div className="flex items-center gap-2 mb-3">
                <span className={`w-2.5 h-2.5 rounded-full ${color.dot}`} />
                <h3 className="font-semibold text-gray-800">{name}</h3>
              </div>
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Gastado</span>
                  <span className="font-semibold text-gray-800">{fmt(spent)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Vendido</span>
                  <span className="font-semibold text-green-600">{fmt(sold)}</span>
                </div>
                <div className="flex justify-between border-t border-gray-50 pt-1.5">
                  <span className="text-gray-400">Balance</span>
                  <span className={`font-bold ${sold - spent >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                    {sold - spent >= 0 ? '+' : ''}{fmt(sold - spent)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <CategoryChart purchases={filteredPurchases} />
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-3">Resumen rápido</h2>
          <div className="space-y-3 text-sm">
            <Row label="Compras registradas" value={filteredPurchases.length} />
            <Row label="Ventas registradas" value={filteredSales.length} />
            <Row label="Artículos comprados" value={filteredPurchases.reduce((s, p) => s + p.quantity, 0)} />
            <Row label="Artículos vendidos" value={filteredSales.reduce((s, v) => s + v.quantity, 0)} />
            <div className="border-t border-gray-100 pt-3">
              <Row label="Gasto promedio/compra" value={filteredPurchases.length ? fmt(totalSpent / filteredPurchases.length) : '—'} />
              <Row label="Precio promedio/venta" value={filteredSales.length ? fmt(totalSales / filteredSales.length) : '—'} />
            </div>
          </div>
        </div>
      </div>

      {/* Purchases & sales lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <ListControls
            title="Compras"
            count={filteredPurchases.length}
            search={purchaseSearch}
            onSearch={setPurchaseSearch}
            sort={purchaseSort}
            onSort={setPurchaseSort}
          />
          <ItemList
            items={applyListFilters(filteredPurchases, purchaseSearch, purchaseSort)}
            type="purchase"
            onRemove={onRemovePurchase}
            onUpdate={onUpdatePurchase}
            collections={collections}
          />
        </div>
        <div>
          <ListControls
            title="Ventas"
            count={filteredSales.length}
            search={saleSearch}
            onSearch={setSaleSearch}
            sort={saleSort}
            onSort={setSaleSort}
          />
          <ItemList
            items={applyListFilters(filteredSales, saleSearch, saleSort)}
            type="sale"
            onRemove={onRemoveSale}
            onUpdate={onUpdateSale}
            collections={collections}
          />
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

function ListControls({ title, count, search, onSearch, sort, onSort }) {
  return (
    <div className="mb-3 space-y-2">
      <div className="flex items-center gap-2">
        <h2 className="text-base font-semibold text-gray-800">{title}</h2>
        {count > 0 && <span className="text-xs text-gray-400">{count}</span>}
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={search}
          onChange={e => onSearch(e.target.value)}
          placeholder="Buscar descripción o notas..."
          className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <select
          value={sort}
          onChange={e => onSort(e.target.value)}
          className="border border-gray-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          <option value="date-desc">Fecha ↓</option>
          <option value="date-asc">Fecha ↑</option>
          <option value="price-desc">Precio ↓</option>
          <option value="price-asc">Precio ↑</option>
        </select>
      </div>
    </div>
  );
}
