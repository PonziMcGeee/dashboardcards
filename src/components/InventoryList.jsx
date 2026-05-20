import { useState } from 'react';
import { Trash2, Calendar, StickyNote, Pencil, Package, RefreshCw, Check, X } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import Modal from './Modal';
import InventoryForm from './InventoryForm';
import { getCollectionColor } from '../collectionColors';

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

function EmptyState() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-10 text-center">
      <div className="inline-flex items-center justify-center w-14 h-14 bg-gray-50 dark:bg-gray-700 rounded-2xl mb-4">
        <Package size={24} className="text-gray-300 dark:text-gray-600" />
      </div>
      <p className="font-semibold text-gray-500 dark:text-gray-400 text-sm">Sin artículos en el inventario</p>
      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Añade tu primer artículo para empezar a trackear precios.</p>
    </div>
  );
}

export default function InventoryList({ items, onRemove, onUpdate, collections = [] }) {
  const [editingItem, setEditingItem] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [editingPriceId, setEditingPriceId] = useState(null);
  const [priceInput, setPriceInput] = useState('');

  function handleSave(id, data) {
    onUpdate(id, data);
    setEditingItem(null);
  }

  function startEditPrice(item) {
    setEditingPriceId(item.id);
    setPriceInput(item.currentPrice.toString());
  }

  function savePrice(item) {
    const price = parseFloat(priceInput);
    if (!isNaN(price) && price >= 0) {
      onUpdate(item.id, { ...item, currentPrice: price });
    }
    setEditingPriceId(null);
  }

  if (items.length === 0) return <EmptyState />;

  return (
    <>
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="divide-y divide-gray-50 dark:divide-gray-700">
          {items.map(item => {
            const invested = item.quantity * item.purchasePrice;
            const currentValue = item.quantity * item.currentPrice;
            const gain = currentValue - invested;
            const gainPct = invested > 0 ? (gain / invested) * 100 : 0;
            const isEditingPrice = editingPriceId === item.id;

            return (
              <div key={item.id} className="item-fade-in p-4 hover:bg-slate-50 dark:hover:bg-gray-700/40 transition-colors group">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    {/* Name + collection */}
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="font-medium text-gray-800 dark:text-gray-100 text-sm">{item.description}</span>
                      {item.collection && <CollectionBadge collection={item.collection} collections={collections} />}
                    </div>
                    {/* Meta */}
                    <div className="flex flex-wrap gap-3 text-xs text-gray-400 mb-2.5">
                      <span className="flex items-center gap-1">
                        <Calendar size={11} />
                        {fmtDate(item.date)}
                      </span>
                      <span>{item.quantity} {item.quantity === 1 ? 'unidad' : 'unidades'}</span>
                      {item.notes && (
                        <span className="flex items-center gap-1">
                          <StickyNote size={11} />
                          {item.notes}
                        </span>
                      )}
                    </div>
                    {/* Price comparison */}
                    <div className="flex flex-wrap items-center gap-1.5 text-xs">
                      <span className="text-gray-400 dark:text-gray-500">Comprado:</span>
                      <span className="font-medium text-gray-600 dark:text-gray-300">
                        {item.quantity > 1 ? `${item.quantity} × ${fmt(item.purchasePrice)} = ` : ''}{fmt(invested)}
                      </span>
                      <span className="text-gray-300 dark:text-gray-600 mx-1">→</span>
                      <span className="text-gray-400 dark:text-gray-500">Ahora:</span>
                      {isEditingPrice ? (
                        <span className="flex items-center gap-1">
                          <input
                            autoFocus
                            type="number"
                            step="0.01"
                            min="0"
                            value={priceInput}
                            onChange={e => setPriceInput(e.target.value)}
                            onKeyDown={e => { if (e.key === 'Enter') savePrice(item); if (e.key === 'Escape') setEditingPriceId(null); }}
                            className="w-20 border border-violet-300 dark:border-violet-600 rounded-lg px-2 py-0.5 text-xs focus:outline-none focus:ring-2 focus:ring-violet-400 dark:bg-gray-700 dark:text-gray-100"
                          />
                          <button onClick={() => savePrice(item)} className="text-green-500 hover:text-green-600 transition-colors">
                            <Check size={13} />
                          </button>
                          <button onClick={() => setEditingPriceId(null)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                            <X size={13} />
                          </button>
                        </span>
                      ) : (
                        <button
                          onClick={() => startEditPrice(item)}
                          className="font-medium text-violet-600 hover:text-violet-800 dark:text-violet-400 dark:hover:text-violet-300 transition-colors"
                          title="Clic para actualizar precio"
                        >
                          {item.quantity > 1 ? `${item.quantity} × ${fmt(item.currentPrice)} = ` : ''}{fmt(currentValue)}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Right: gain + actions */}
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span className={`font-bold text-sm ${gain >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                      {gain >= 0 ? '+' : ''}{fmt(gain)}
                    </span>
                    <span className={`text-xs font-semibold px-1.5 py-0.5 rounded-full ${gain >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                      {gainPct >= 0 ? '+' : ''}{gainPct.toFixed(1)}%
                    </span>
                    {deletingId === item.id ? (
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="text-xs text-gray-500 dark:text-gray-400">¿Eliminar?</span>
                        <button
                          onClick={() => { onRemove(item.id); setDeletingId(null); }}
                          className="text-xs font-semibold text-white bg-red-500 hover:bg-red-600 px-2 py-0.5 rounded-md transition-colors"
                        >Sí</button>
                        <button
                          onClick={() => setDeletingId(null)}
                          className="text-xs font-semibold text-gray-500 dark:text-gray-300 px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-600 hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors"
                        >No</button>
                      </div>
                    ) : (
                      <div className="flex gap-2 mt-1">
                        <button
                          onClick={() => startEditPrice(item)}
                          className="text-gray-200 dark:text-gray-700 group-hover:text-violet-300 dark:group-hover:text-violet-700 hover:!text-violet-500 transition-colors"
                          title="Actualizar precio"
                        >
                          <RefreshCw size={13} />
                        </button>
                        <button
                          onClick={() => setEditingItem(item)}
                          className="text-gray-200 dark:text-gray-700 group-hover:text-gray-400 dark:group-hover:text-gray-500 hover:!text-blue-500 transition-colors"
                          title="Editar"
                        >
                          <Pencil size={13} />
                        </button>
                        <button
                          onClick={() => setDeletingId(item.id)}
                          className="text-gray-200 dark:text-gray-700 group-hover:text-gray-400 dark:group-hover:text-gray-500 hover:!text-red-500 transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {editingItem && (
        <Modal title="Editar artículo" onClose={() => setEditingItem(null)}>
          <InventoryForm editItem={editingItem} onSave={handleSave} onCancel={() => setEditingItem(null)} collections={collections} />
        </Modal>
      )}
    </>
  );
}
