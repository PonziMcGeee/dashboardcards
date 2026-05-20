import { useState, useEffect } from 'react';
import { PlusCircle, Save, Calendar, Hash, Euro, FileText, StickyNote, FolderOpen, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';

function emptyForm(today, defaultCollection) {
  return { date: today, description: '', collection: defaultCollection, quantity: 1, purchasePrice: '', currentPrice: '', notes: '' };
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

export default function InventoryForm({ onAdd, editItem, onSave, onCancel, collections = [] }) {
  const today = format(new Date(), 'yyyy-MM-dd');
  const isEdit = !!editItem;

  const [form, setForm] = useState(() =>
    isEdit
      ? { ...editItem, purchasePrice: editItem.purchasePrice.toString(), currentPrice: editItem.currentPrice.toString() }
      : emptyForm(today, collections[0]?.name ?? '')
  );

  useEffect(() => {
    if (!isEdit && !form.collection && collections.length > 0) {
      setForm(prev => ({ ...prev, collection: collections[0].name }));
    }
  }, [collections, isEdit]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.description.trim() || !form.purchasePrice) return;
    const qty = Number(form.quantity);
    const purchasePrice = parseFloat(form.purchasePrice);
    const currentPrice = form.currentPrice ? parseFloat(form.currentPrice) : purchasePrice;
    const data = { ...form, quantity: qty, purchasePrice, currentPrice };
    if (isEdit) {
      onSave(editItem.id, data);
    } else {
      onAdd(data);
      setForm(emptyForm(today, collections[0]?.name ?? ''));
    }
  }

  const base = 'w-full border border-gray-200 dark:border-gray-600 rounded-xl py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent transition-shadow dark:bg-gray-700 dark:text-gray-100';
  const withIcon = `${base} pl-9 pr-3`;

  return (
    <form onSubmit={handleSubmit} className={isEdit ? '' : 'bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6'}>
      {!isEdit && <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-5">Nuevo artículo</h2>}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

        <Field label="Fecha" icon={Calendar}>
          <input type="date" name="date" value={form.date} onChange={handleChange} required className={withIcon} />
        </Field>

        <Field label="Colección" icon={FolderOpen}>
          <select name="collection" value={form.collection} onChange={handleChange} className={withIcon}>
            <option value="">— Sin colección —</option>
            {collections.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
          </select>
        </Field>

        <div className="sm:col-span-2">
          <Field label="Descripción" icon={FileText}>
            <input
              type="text" name="description" value={form.description} onChange={handleChange}
              placeholder="Prismatic Evolutions Booster Box, SV09 ETB..."
              required className={withIcon}
            />
          </Field>
        </div>

        <Field label="Cantidad" icon={Hash}>
          <input type="number" name="quantity" value={form.quantity} onChange={handleChange} min="1" className={withIcon} />
        </Field>

        <Field label="Precio de compra (€)" icon={Euro}>
          <input
            type="number" name="purchasePrice" value={form.purchasePrice} onChange={handleChange}
            step="0.01" min="0" placeholder="0.00" required className={withIcon}
          />
        </Field>

        <Field label="Precio actual (€)" icon={RefreshCw}>
          <input
            type="number" name="currentPrice" value={form.currentPrice} onChange={handleChange}
            step="0.01" min="0" placeholder="Igual que compra si se deja vacío" className={withIcon}
          />
        </Field>

        <Field label="Notas (opcional)" icon={StickyNote}>
          <input
            type="text" name="notes" value={form.notes} onChange={handleChange}
            placeholder="Tienda, edición, condición..." className={withIcon}
          />
        </Field>

      </div>

      <div className="mt-5 flex gap-2">
        <button
          type="submit"
          className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors shadow-sm"
        >
          {isEdit ? <><Save size={15} /> Guardar cambios</> : <><PlusCircle size={16} /> Añadir artículo</>}
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
