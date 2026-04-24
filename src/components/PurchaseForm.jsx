import { useState, useEffect } from 'react';
import { PlusCircle, Save, Calendar, Hash, Euro, FileText, StickyNote, FolderOpen, Tag } from 'lucide-react';
import { format } from 'date-fns';

const CATEGORIES = ['Sobre', 'Caja', 'Carta individual', 'Bundle', 'Colección completa', 'Otro'];

function emptyForm(today, defaultCollection) {
  return { date: today, description: '', collection: defaultCollection, category: 'Sobre', quantity: 1, price: '', notes: '' };
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

export default function PurchaseForm({ onAdd, editItem, onSave, onCancel, collections = [] }) {
  const today = format(new Date(), 'yyyy-MM-dd');
  const isEdit = !!editItem;

  const [form, setForm] = useState(() =>
    isEdit
      ? { ...editItem, price: editItem.price.toString(), costBasis: editItem.costBasis?.toString() ?? '' }
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
    if (!form.description.trim() || !form.price) return;
    const qty = Number(form.quantity);
    const price = parseFloat(form.price);
    const data = { ...form, quantity: qty, price, total: qty * price };
    if (isEdit) {
      onSave(editItem.id, data);
    } else {
      onAdd(data);
      setForm(emptyForm(today, collections[0]?.name ?? ''));
    }
  }

  const base = 'w-full border border-gray-200 rounded-xl py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-shadow';
  const withIcon = `${base} pl-9 pr-3`;
  const noIcon   = `${base} px-3`;

  return (
    <form onSubmit={handleSubmit} className={isEdit ? '' : 'bg-white rounded-2xl shadow-sm border border-gray-100 p-6'}>
      {!isEdit && <h2 className="text-lg font-semibold text-gray-800 mb-5">Nueva Compra</h2>}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

        <Field label="Fecha" icon={Calendar}>
          <input type="date" name="date" value={form.date} onChange={handleChange} required className={withIcon} />
        </Field>

        <Field label="Colección" icon={FolderOpen}>
          {collections.length > 0 ? (
            <select name="collection" value={form.collection} onChange={handleChange} className={withIcon}>
              {collections.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
            </select>
          ) : (
            <div className={`${withIcon} text-gray-400 bg-gray-50 flex items-center`}>
              Crea una colección primero
            </div>
          )}
        </Field>

        <Field label="Categoría" icon={Tag}>
          <select name="category" value={form.category} onChange={handleChange} className={withIcon}>
            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
        </Field>

        <Field label="Descripción" icon={FileText}>
          <input
            type="text" name="description" value={form.description} onChange={handleChange}
            placeholder="Sobres Temporal Forces, carta Charizard ex..."
            required className={withIcon}
          />
        </Field>

        <Field label="Cantidad" icon={Hash}>
          <input type="number" name="quantity" value={form.quantity} onChange={handleChange} min="1" className={withIcon} />
        </Field>

        <Field label="Precio unitario (€)" icon={Euro}>
          <input
            type="number" name="price" value={form.price} onChange={handleChange}
            step="0.01" min="0" placeholder="0.00" required className={withIcon}
          />
        </Field>

        <div className="sm:col-span-2">
          <Field label="Notas (opcional)" icon={StickyNote}>
            <input
              type="text" name="notes" value={form.notes} onChange={handleChange}
              placeholder="Tienda, edición, condición..." className={withIcon}
            />
          </Field>
        </div>
      </div>

      <div className="mt-5 flex gap-2">
        <button
          type="submit"
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors shadow-sm"
        >
          {isEdit ? <><Save size={15} /> Guardar cambios</> : <><PlusCircle size={16} /> Añadir compra</>}
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
