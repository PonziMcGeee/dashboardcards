import { useState } from 'react';
import { PlusCircle, Save, Calendar, Hash, Euro, FileText, StickyNote, FolderOpen, Store, Link2 } from 'lucide-react';
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
    }
  }

  // Compras con unidades disponibles para vincular (incluye la ya seleccionada aunque se haya agotado)
  const linkablePurchases = purchases
    .filter(p => getRemainingQty(p, sales, isEdit ? editItem.id : null) > 0 || p.id === form.purchaseId)
    .sort((a, b) => b.date.localeCompare(a.date));

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

        <div className="sm:col-span-2">
          <Field label="Vincular a compra (opcional)" icon={Link2}>
            <select name="purchaseId" value={form.purchaseId} onChange={handleChange} className={withIcon}>
              <option value="">— Sin vincular —</option>
              {linkablePurchases.map(p => (
                <option key={p.id} value={p.id}>
                  {fmtDate(p.date)} — {p.description} (quedan {getRemainingQty(p, sales, isEdit ? editItem.id : null)})
                </option>
              ))}
            </select>
          </Field>
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
