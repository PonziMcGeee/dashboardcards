import { useState } from 'react';
import { Trash2, Tag, Calendar, StickyNote, Pencil, ShoppingCart, TrendingUp, Link2 } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import Modal from './Modal';
import PurchaseForm from './PurchaseForm';
import SaleForm from './SaleForm';
import { getCollectionColor } from '../collectionColors';
import { getPurchaseROI, getSaleProfit } from '../utils/roi';

function fmt(n) {
  return n.toFixed(2).replace('.', ',') + ' €';
}

function fmtDate(dateStr) {
  try {
    return format(parseISO(dateStr), 'd MMM yyyy', { locale: es });
  } catch {
    return dateStr;
  }
}

function CollectionBadge({ collection, collections }) {
  const color = getCollectionColor(collections, collection);
  return (
    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${color.badge}`}>
      {collection}
    </span>
  );
}

function PurchaseBadge({ category }) {
  const map = {
    'Sobre': 'bg-blue-100 text-blue-700',
    'Caja': 'bg-purple-100 text-purple-700',
    'Carta individual': 'bg-yellow-100 text-yellow-700',
    'Bundle': 'bg-orange-100 text-orange-700',
    'Colección completa': 'bg-pink-100 text-pink-700',
    'Otro': 'bg-stone-100 text-stone-600',
  };
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${map[category] || map['Otro']}`}>
      {category}
    </span>
  );
}

function SaleBadge({ platform }) {
  const map = {
    'Cardmarket': 'bg-blue-100 text-blue-700',
    'eBay': 'bg-yellow-100 text-yellow-700',
    'Wallapop': 'bg-teal-100 text-teal-700',
    'Vinted': 'bg-green-100 text-green-700',
    'Local': 'bg-stone-100 text-stone-600',
    'Otro': 'bg-stone-100 text-stone-600',
  };
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${map[platform] || map['Otro']}`}>
      {platform}
    </span>
  );
}

function EmptyState({ type }) {
  const config = {
    purchase: { Icon: ShoppingCart, title: 'Sin compras registradas', sub: 'Añade tu primera compra usando el formulario.' },
    sale:     { Icon: TrendingUp,   title: 'Sin ventas registradas',  sub: 'Añade tu primera venta usando el formulario.' },
  };
  const { Icon, title, sub } = config[type];
  return (
    <div className="bg-white dark:bg-stone-800 rounded-lg border border-stone-200 dark:border-stone-700 p-10 text-center">
      <div className="inline-flex items-center justify-center w-14 h-14 border border-stone-200 dark:border-stone-600 rounded-lg mb-4">
        <Icon size={22} className="text-stone-400 dark:text-stone-500" />
      </div>
      <p className="font-semibold text-stone-500 dark:text-stone-400 text-sm">{title}</p>
      <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">{sub}</p>
    </div>
  );
}

export default function ItemList({ items, type, onRemove, onUpdate, collections = [], purchases = [], sales = [] }) {
  const [editingItem, setEditingItem] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  function handleSave(id, data) {
    onUpdate(id, data);
    setEditingItem(null);
  }

  if (items.length === 0) return <EmptyState type={type} />;

  return (
    <>
      <div className="bg-white dark:bg-stone-800 rounded-lg border border-stone-200 dark:border-stone-700 overflow-hidden">
        <div className="divide-y divide-stone-100 dark:divide-stone-700">
          {items.map(item => {
            const roi = type === 'purchase' ? getPurchaseROI(item, sales) : null;
            const saleProfit = type === 'sale' ? getSaleProfit(item, purchases) : null;
            const accent = type === 'purchase' ? 'border-l-amber-500' : 'border-l-emerald-500';
            return (
            <div key={item.id} className={`item-fade-in flex items-start justify-between gap-4 p-4 pl-3.5 border-l-2 ${accent} hover:bg-stone-50 dark:hover:bg-stone-700/40 transition-colors group`}>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className="font-medium text-stone-800 dark:text-stone-100 text-sm truncate">{item.description}</span>
                  {item.collection && <CollectionBadge collection={item.collection} collections={collections} />}
                  {type === 'purchase'
                    ? <PurchaseBadge category={item.category} />
                    : <SaleBadge platform={item.platform} />}
                </div>
                <div className="flex flex-wrap gap-3 text-xs text-stone-500 dark:text-stone-400">
                  <span className="flex items-center gap-1">
                    <Calendar size={11} />
                    {fmtDate(item.date)}
                  </span>
                  <span className="figure flex items-center gap-1">
                    <Tag size={11} />
                    {item.quantity} × {fmt(item.price)}
                  </span>
                  {item.notes && (
                    <span className="flex items-center gap-1">
                      <StickyNote size={11} />
                      {item.notes}
                    </span>
                  )}
                </div>
                {type === 'purchase' && roi.soldQty > 0 && (
                  <div className="flex flex-wrap items-center gap-2 mt-1.5 text-xs">
                    <span className="text-stone-500 dark:text-stone-400">Vendido {roi.soldQty}/{item.quantity}</span>
                    <span className={`figure font-semibold ${roi.profit >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'}`}>
                      {roi.profit >= 0 ? '+' : ''}{fmt(roi.profit)}{roi.roiPct !== null && ` · ROI ${roi.roiPct.toFixed(0)}%`}
                    </span>
                  </div>
                )}
                {type === 'sale' && saleProfit && (
                  <div className="flex flex-wrap items-center gap-1.5 mt-1.5 text-xs">
                    <Link2 size={11} className="text-stone-500 dark:text-stone-400 shrink-0" />
                    <span className="text-stone-500 dark:text-stone-400 truncate">de "{saleProfit.purchase.description}"</span>
                    <span className={`figure font-semibold shrink-0 ${saleProfit.profit >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'}`}>
                      {saleProfit.profit >= 0 ? '+' : ''}{fmt(saleProfit.profit)}
                    </span>
                  </div>
                )}
              </div>
              <div className="flex flex-col items-end gap-1 shrink-0">
                <span className={`figure font-bold text-sm ${type === 'sale' ? 'text-emerald-700 dark:text-emerald-400' : 'text-stone-800 dark:text-stone-100'}`}>
                  {fmt(item.total)}
                </span>
                {deletingId === item.id ? (
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="text-xs text-stone-500 dark:text-stone-400">¿Eliminar?</span>
                    <button
                      onClick={() => { onRemove(item.id); setDeletingId(null); }}
                      className="text-xs font-semibold text-white bg-red-500 hover:bg-red-600 px-2 py-0.5 rounded-md transition-colors"
                    >
                      Sí
                    </button>
                    <button
                      onClick={() => setDeletingId(null)}
                      className="text-xs font-semibold text-stone-500 dark:text-stone-300 hover:text-stone-700 px-2 py-0.5 rounded-md bg-stone-100 dark:bg-stone-600 hover:bg-stone-200 dark:hover:bg-stone-500 transition-colors"
                    >
                      No
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-1 mt-1 -mr-1.5">
                    <button
                      onClick={() => setEditingItem(item)}
                      className="p-1.5 text-stone-500 dark:text-stone-400 hover:!text-amber-600 dark:hover:!text-amber-400 transition-colors"
                      title="Editar"
                    >
                      <Pencil size={13} />
                    </button>
                    <button
                      onClick={() => setDeletingId(item.id)}
                      className="p-1.5 text-stone-500 dark:text-stone-400 hover:!text-red-500 dark:hover:!text-red-400 transition-colors"
                      title="Eliminar"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          );})}
        </div>
      </div>

      {editingItem && (
        <Modal
          title={type === 'purchase' ? 'Editar compra' : 'Editar venta'}
          onClose={() => setEditingItem(null)}
        >
          {type === 'purchase' ? (
            <PurchaseForm editItem={editingItem} onSave={handleSave} onCancel={() => setEditingItem(null)} collections={collections} />
          ) : (
            <SaleForm editItem={editingItem} onSave={handleSave} onCancel={() => setEditingItem(null)} collections={collections} purchases={purchases} sales={sales} />
          )}
        </Modal>
      )}
    </>
  );
}
