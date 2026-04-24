import { useState } from 'react';
import { PlusCircle, Save, Calendar, Hash, Euro, FileText, StickyNote, FolderOpen, Store } from 'lucide-react';
import { format } from 'date-fns';

const PLATFORMS = ['Cardmarket', 'eBay', 'Wallapop', 'Vinted', 'Local', 'Otro'];

function emptyForm(today) {
  return { date: today, description: '', collection: '', platform: 'Cardmarket', quantity: 1, price: '', notes: '' };
}

function Field({ label, icon: Icon, children }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">{label}</label>
      <div className="relative">
        {Icon && <Icon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />}
        {children}
      </div>
    </div>
  );
}

export default function SaleForm({ onAdd, editItem, onSave, onCancel, collections = [] }) {
  const today = format(new Date(), 'yyyy-MM-dd');
  const isEdit = !!editItem;

  const [form, setForm] = useState(() =>
    isEdit
      ? { ...editItem, price: editItem.price.toString() }
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
    const data = { ...form, quantity: qty, price, total: qty * price };
    if (isEdit) {
      onSave(editItem.id, data);
    } else {
      onAdd(data);
      setForm(emptyForm(today));
    }
  }

  const base = 'w-full border border-gray-200 rounded-xl py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent transition-shadow';
  const withIcon = `${base} pl-9 pr-3`;

  return (
    <form onSubmit={handleSubmit} className={isEdit ? '' : 'bg-white rounded-2xl shadow-sm border border-gray-100 p-6'}>
      {!isEdit && <h2 className="text-lg font-semibold text-gray-800 mb-5">Nueva Venta</h2>}
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
          <Field label="Notas (opcional)" icon={StickyNote}>
            <input
              type="text" name="notes" value={form.notes} onChange={handleChange}
              placeholder="Condición, envío, comprador..." className={withIcon}
            />
          </Field>
        </div>
      </div>

      <div className="mt-5 flex gap-2">
        <button
          type="submit"
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors shadow-sm"
        >
          {isEdit ? <><Save size={15} /> Guardar cambios</> : <><PlusCircle size={16} /> Añadir venta</>}
        </button>
        {isEdit && (
          <button type="button" onClick={onCancel} className="px-4 py-2.5 rounded-xl text-sm text-gray-500 hover:bg-gray-100 transition-colors">
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
}
