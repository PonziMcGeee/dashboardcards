import { useState, useRef, useEffect } from 'react';
import { PlusCircle, Save, Calendar, Hash, Euro, FileText, StickyNote, FolderOpen, Store, Link2, X, Search } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { getRemainingQty } from '../utils/roi';

const PLATFORMS = ['Cardmarket', 'eBay', 'Wallapop', 'Vinted', 'Local', 'Otro'];

function emptyForm(today) {
  return { date: today, description: '', collection: '', platform: 'Cardmarket', quantity: 1, price: '', purchaseId: '', notes: '' };
}

function fmt(n) {
  return n.toFixed(2).replace('.', ',') + ' €';
}

function fmtDate(dateStr) {
  try {
    return format(parseISO(dateStr), 'd MMM', { locale: es });
  } catch {
    return dateStr;
  }
}

function purchaseLabel(p) {
  return `${fmtDate(p.date)} — ${p.description}`;
}

function Field({ label, icon: Icon, children }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wide">{label}</label>
      <div className="relative">
        {Icon && <Icon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />}
        {children}
      </div>
    </div>
  );
}

export default function SaleForm({ onAdd, editItem, onSave, onCancel, collections = [], purchases = [], sales = [] }) {
  const today = format(new Date(), 'yyyy-MM-dd');
  const isEdit = !!editItem;

  const [form, setForm] = useState(() =>
    isEdit
      ? { purchaseId: '', ...editItem, price: editItem.price.toString() }
      : emptyForm(today)
  );

  const initialLinked = isEdit ? purchases.find(p => p.id === editItem.purchaseId) : null;
  const [purchaseQuery, setPurchaseQuery] = useState(initialLinked ? purchaseLabel(initialLinked) : '');
  const [showPurchaseDropdown, setShowPurchaseDropdown] = useState(false);
  const purchaseBoxRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (purchaseBoxRef.current && !purchaseBoxRef.current.contains(e.target)) {
        setShowPurchaseDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function selectPurchase(p) {
    setForm(prev => ({ ...prev, purchaseId: p.id }));
    setPurchaseQuery(purchaseLabel(p));
    setShowPurchaseDropdown(false);
  }

  function clearPurchaseLink() {
    setForm(prev => ({ ...prev, purchaseId: '' }));
    setPurchaseQuery('');
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.description.trim() || !form.price) return;
    const qty = Number(form.quantity);
    const price = parseFloat(form.price);
    const data = { ...form, quantity: qty, price, total: qty * price, purchaseId: form.purchaseId || null };
    if (isEdit) {
      onSave(editItem.id, data);
    } else {
      onAdd(data);
      setForm(emptyForm(today));
      setPurchaseQuery('');
      setShowPurchaseDropdown(false);
    }
  }

  // Compras con unidades disponibles para vincular (incluye la ya seleccionada aunque se haya agotado)
  const linkablePurchases = purchases
    .filter(p => getRemainingQty(p, sales, isEdit ? editItem.id : null) > 0 || p.id === form.purchaseId)
    .sort((a, b) => b.date.localeCompare(a.date));

  const purchaseSearchTerm = purchaseQuery.trim().toLowerCase();
  const purchaseMatches = linkablePurchases
    .filter(p =>
      !purchaseSearchTerm ||
      p.description.toLowerCase().includes(purchaseSearchTerm) ||
      (p.collection || '').toLowerCase().includes(purchaseSearchTerm)
    )
    .slice(0, 8);

  const selectedPurchase = purchases.find(p => p.id === form.purchaseId);
  const previewQty = Number(form.quantity) || 0;
  const previewPrice = parseFloat(form.price) || 0;
  const linkedPreview = selectedPurchase && previewQty > 0 && previewPrice > 0
    ? (() => {
        const cost = selectedPurchase.price * previewQty;
        const profit = previewQty * previewPrice - cost;
        const roiPct = cost > 0 ? (profit / cost) * 100 : null;
        return { profit, roiPct };
      })()
    : null;

  const base = 'w-full border border-gray-200 dark:border-gray-600 rounded-xl py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent transition-shadow dark:bg-gray-700 dark:text-gray-100';
  const withIcon = `${base} pl-9 pr-3`;

  return (
    <form onSubmit={handleSubmit} className={isEdit ? '' : 'bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6'}>
      {!isEdit && <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-5">Nueva Venta</h2>}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

        <Field label="Fecha" icon={Calendar}>
          <input type="date" name="date" value={form.date} onChange={handleChange} required className={withIcon} />
        </Field>

        <Field label="Colección" icon={FolderOpen}>
          <select name="collection" value={form.collection} onChange={handleChange} className={withIcon}>
            <option value="">— Sin colección —</option>
            {collections.filter(c => c.active !== false).map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
          </select>
        </Field>

        <Field label="Plataforma" icon={Store}>
          <select name="platform" value={form.platform} onChange={handleChange} className={withIcon}>
            {PLATFORMS.map(p => <option key={p}>{p}</option>)}
          </select>
        </Field>

        <Field label="Descripción" icon={FileText}>
          <input
            type="text" name="description" value={form.description} onChange={handleChange}
            placeholder="Pikachu ex 232/193, lote de sobres..."
            required className={withIcon}
          />
        </Field>

        <Field label="Cantidad" icon={Hash}>
          <input type="number" name="quantity" value={form.quantity} onChange={handleChange} min="1" className={withIcon} />
        </Field>

        <Field label="Precio venta unitario (€)" icon={Euro}>
          <input
            type="number" name="price" value={form.price} onChange={handleChange}
            step="0.01" min="0" placeholder="0.00" required className={withIcon}
          />
        </Field>

        <div className="sm:col-span-2 relative" ref={purchaseBoxRef}>
          <Field label="Vincular a compra (opcional)" icon={Link2}>
            <input
              type="text"
              value={purchaseQuery}
              onChange={e => {
                setPurchaseQuery(e.target.value);
                setShowPurchaseDropdown(true);
                if (form.purchaseId) setForm(prev => ({ ...prev, purchaseId: '' }));
              }}
              onFocus={() => setShowPurchaseDropdown(true)}
              placeholder="Buscar por descripción..."
              autoComplete="off"
              className={`${withIcon} ${form.purchaseId ? 'pr-9' : ''}`}
            />
            {form.purchaseId && (
              <button
                type="button"
                onClick={clearPurchaseLink}
                title="Quitar vínculo"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 transition-colors"
              >
                <X size={14} />
              </button>
            )}
          </Field>

          {showPurchaseDropdown && (
            <div className="absolute z-20 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl shadow-lg max-h-56 overflow-y-auto">
              {purchaseMatches.length > 0 ? (
                purchaseMatches.map(p => (
                  <button
                    type="button"
                    key={p.id}
                    onClick={() => selectPurchase(p)}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center justify-between gap-2 transition-colors"
                  >
                    <span className="truncate text-gray-700 dark:text-gray-200">{purchaseLabel(p)}</span>
                    <span className="text-xs text-gray-400 dark:text-gray-500 shrink-0">
                      quedan {getRemainingQty(p, sales, isEdit ? editItem.id : null)}
                    </span>
                  </button>
                ))
              ) : (
                <div className="flex items-center gap-2 px-3 py-3 text-xs text-gray-400 dark:text-gray-500">
                  <Search size={13} />
                  Sin compras que coincidan
                </div>
              )}
            </div>
          )}
        </div>

        <div className="sm:col-span-2">
          <Field label="Notas (opcional)" icon={StickyNote}>
            <input
              type="text" name="notes" value={form.notes} onChange={handleChange}
              placeholder="Condición, envío, comprador..." className={withIcon}
            />
          </Field>
        </div>
      </div>

      {linkedPreview && (
        <div className={`mt-4 text-xs font-medium rounded-lg px-3 py-2 ${
          linkedPreview.profit >= 0
            ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400'
            : 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400'
        }`}>
          Beneficio estimado: {linkedPreview.profit >= 0 ? '+' : ''}{fmt(linkedPreview.profit)}
          {linkedPreview.roiPct !== null && ` · ROI ${linkedPreview.roiPct.toFixed(0)}%`}
        </div>
      )}

      <div className="mt-5 flex gap-2">
        <button
          type="submit"
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors shadow-sm"
        >
          {isEdit ? <><Save size={15} /> Guardar cambios</> : <><PlusCircle size={16} /> Añadir venta</>}
        </button>
        {isEdit && (
          <button type="button" onClick={onCancel} className="px-4 py-2.5 rounded-xl text-sm text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
}
