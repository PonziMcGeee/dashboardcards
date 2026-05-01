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

function calcTrend(current, prev) {
  if (prev === null || prev === undefined || prev === 0) return null;
  return ((current - prev) / prev) * 100;
}

const DATE_PRESETS = [
  { key: '7',      label: '7d' },
  { key: '30',     label: '30d' },
  { key: '90',     label: '90d' },
  { key: '365',    label: '1 año' },
  { key: 'all',    label: 'Todo' },
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
  if (sort === 'date-asc')   result.sort((a, b) => a.date.localeCompare(b.date));
  if (sort === 'date-desc')  result.sort((a, b) => b.date.localeCompare(a.date));
  if (sort === 'price-desc') result.sort((a, b) => b.total - a.total);
  if (sort === 'price-asc')  result.sort((a, b) => a.total - b.total);
  return result;
}

function filterByDate(items, dateFrom, dateTo) {
  if (!dateFrom) return items;
  return items.filter(i => {
    const d = parseISO(i.date);
    return !isBefore(d, dateFrom) && !isAfter(d, dateTo);
  });
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

  // Previous period (same duration, shifted back) — only for numeric presets
  const prevDateFrom = useMemo(() => {
    if (!dateFrom || datePreset === 'all' || datePreset === 'custom') return null;
    const duration = dateTo.getTime() - dateFrom.getTime();
    return new Date(dateFrom.getTime() - duration);
  }, [dateFrom, dateTo, datePreset]);

  const byCollectionFilter = p => !filterCollection || p.collection === filterCollection;

  const filteredPurchases = useMemo(() =>
    filterByDate(purchases.filter(byCollectionFilter), dateFrom, dateTo),
    [purchases, filterCollection, dateFrom, dateTo]
  );

  const filteredSales = useMemo(() =>
    filterByDate(sales.filter(byCollectionFilter), dateFrom, dateTo),
    [sales, filterCollection, dateFrom, dateTo]
  );

  const prevPurchases = useMemo(() =>
    prevDateFrom
      ? filterByDate(purchases.filter(byCollectionFilter), prevDateFrom, dateFrom)
      : null,
    [purchases, filterCollection, prevDateFrom, dateFrom]
  );

  const prevSales = useMemo(() =>
    prevDateFrom
      ? filterByDate(sales.filter(byCollectionFilter), prevDateFrom, dateFrom)
      : null,
    [sales, filterCollection, prevDateFrom, dateFrom]
  );

  const totalSpent  = filteredPurchases.reduce((s, p) => s + p.total, 0);
  const totalSales  = filteredSales.reduce((s, v) => s + v.total, 0);
  const balance     = totalSales - totalSpent;

  const prevSpent   = prevPurchases?.reduce((s, p) => s + p.total, 0) ?? null;
  const prevSalesTotal = prevSales?.reduce((s, v) => s + v.total, 0) ?? null;
  const prevBalance = prevSpent !== null && prevSalesTotal !== null ? prevSalesTotal - prevSpent : null;

  const selectedPresetLabel = DATE_PRESETS.find(p => p.key === datePreset)?.label ?? '';

  const byCollection = collections.map(col => {
    const spent = filterByDate(purchases.filter(p => p.collection === col.name), dateFrom, dateTo)
      .reduce((s, p) => s + p.total, 0);
    const sold = filterByDate(sales.filter(v => v.collection === col.name), dateFrom, dateTo)
      .reduce((s, v) => s + v.total, 0);
    const pct = spent > 0 ? Math.min((sold / spent) * 100, 100) : 0;
    return { name: col.name, color: COLOR_PALETTE[col.colorIndex % COLOR_PALETTE.length], spent, sold, pct };
  });

  const inputCls = 'border border-gray-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-400';

  return (
    <div className="space-y-6">

      {/* Filter bar */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 space-y-3">
        <div className="flex flex-wrap gap-3 items-center">
          {/* Collection selector */}
          <select
            value={filterCollection}
            onChange={e => setFilterCollection(e.target.value)}
            className={`${inputCls} pr-7 font-medium`}
          >
            <option value="">Todas las colecciones</option>
            {collections.map(c => (
              <option key={c.id} value={c.name}>{c.name}</option>
            ))}
          </select>

          {/* Segmented date control */}
          <div className="flex bg-gray-100 rounded-xl p-1 gap-0.5">
            {DATE_PRESETS.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setDatePreset(key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  datePreset === key
                    ? 'bg-white text-gray-800 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {datePreset === 'custom' && (
          <div className="flex items-center gap-2 flex-wrap pt-1 border-t border-gray-50">
            <span className="text-xs font-medium text-gray-400">Desde</span>
            <input type="date" value={customFrom} onChange={e => setCustomFrom(e.target.value)} className={inputCls} />
            <span className="text-xs font-medium text-gray-400">hasta</span>
            <input type="date" value={customTo} onChange={e => setCustomTo(e.target.value)} className={inputCls} />
          </div>
        )}
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Gasto total"    value={fmt(totalSpent)} sub={selectedPresetLabel} color="blue"                           icon={ShoppingCart} trend={calcTrend(totalSpent, prevSpent)} />
        <StatCard label="Ventas totales" value={fmt(totalSales)} sub={selectedPresetLabel} color="green"                          icon={TrendingUp}   trend={calcTrend(totalSales, prevSalesTotal)} />
        <StatCard label="Beneficio neto" value={fmt(balance)}    sub="Ventas − Compras"    color={balance >= 0 ? 'green' : 'red'} icon={Wallet}       trend={calcTrend(balance, prevBalance)} />
      </div>

      <SpendingChart
        purchases={filteredPurchases}
        sales={filteredSales}
        dateFrom={dateFrom}
        dateTo={dateTo}
        label={
          datePreset === 'custom' && customFrom
            ? `${customFrom} → ${customTo}`
            : datePreset === 'all' ? 'Todo el tiempo'
            : `Últimos ${selectedPresetLabel}`
        }
      />

      {/* Collection breakdown */}
      {!filterCollection && byCollection.length > 0 && (
        <>
          <SectionLabel>Mis colecciones</SectionLabel>
          <div className={`grid grid-cols-1 gap-4 ${byCollection.length >= 3 ? 'md:grid-cols-3' : byCollection.length === 2 ? 'md:grid-cols-2' : 'md:grid-cols-1 max-w-sm'}`}>
            {byCollection.map(({ name, color, spent, sold, pct }) => (
              <div key={name} className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
                <div className={`h-1.5 ${color.dot}`} />
                <div className="p-5">
                  <h3 className="font-bold text-gray-800 mb-3">{name}</h3>
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
                  <div className="mt-3">
                    <div className="flex justify-between text-xs text-gray-400 mb-1">
                      <span>Recuperado</span>
                      <span className="font-medium">{pct.toFixed(0)}%</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${pct}%`, backgroundColor: pct >= 100 ? '#22c55e' : '#60a5fa' }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <SectionLabel>Análisis</SectionLabel>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <CategoryChart purchases={filteredPurchases} />
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-base font-bold text-gray-800 mb-3">Resumen rápido</h2>
          <div className="space-y-3 text-sm">
            <Row label="Compras registradas" value={filteredPurchases.length} />
            <Row label="Ventas registradas"  value={filteredSales.length} />
            <Row label="Artículos comprados" value={filteredPurchases.reduce((s, p) => s + p.quantity, 0)} />
            <Row label="Artículos vendidos"  value={filteredSales.reduce((s, v) => s + v.quantity, 0)} />
            <div className="border-t border-gray-100 pt-3">
              <Row label="Gasto promedio/compra" value={filteredPurchases.length ? fmt(totalSpent / filteredPurchases.length) : '—'} />
              <Row label="Precio promedio/venta" value={filteredSales.length ? fmt(totalSales / filteredSales.length) : '—'} />
            </div>
          </div>
        </div>
      </div>

      <SectionLabel>Historial</SectionLabel>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <ListControls title="Compras" count={filteredPurchases.length} search={purchaseSearch} onSearch={setPurchaseSearch} sort={purchaseSort} onSort={setPurchaseSort} />
          <ItemList items={applyListFilters(filteredPurchases, purchaseSearch, purchaseSort)} type="purchase" onRemove={onRemovePurchase} onUpdate={onUpdatePurchase} collections={collections} />
        </div>
        <div>
          <ListControls title="Ventas" count={filteredSales.length} search={saleSearch} onSearch={setSaleSearch} sort={saleSort} onSort={setSaleSort} />
          <ItemList items={applyListFilters(filteredSales, saleSearch, saleSort)} type="sale" onRemove={onRemoveSale} onUpdate={onUpdateSale} collections={collections} />
        </div>
      </div>
    </div>
  );
}

function SectionLabel({ children }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap">{children}</span>
      <div className="flex-1 h-px bg-gray-200" />
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
