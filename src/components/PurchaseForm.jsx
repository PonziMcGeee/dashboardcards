import { useState, useEffect } from 'react';
import { PlusCircle, Save } from 'lucide-react';
import { format } from 'date-fns';

const CATEGORIES = ['Sobre', 'Caja', 'Carta individual', 'Bundle', 'Colección completa', 'Otro'];

function emptyForm(today, defaultCollection) {
  return { date: today, description: '', collection: defaultCollection, category: 'Sobre', quantity: 1, price: '', notes: '' };
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

  const ring = 'focus:ring-blue-400';
  const inputCls = `w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 ${ring}`;

  return (
    <form onSubmit={handleSubmit} className={isEdit ? '' : 'bg-white rounded-2xl shadow-sm border border-gray-100 p-6'}>
      {!isEdit && <h2 className="text-lg font-semibold text-gray-800 mb-4">Nueva Compra</h2>}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Fecha</label>
          <input type="date" name="date" value={form.date} onChange={handleChange} required className={inputCls} />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Colección</label>
          {collections.length > 0 ? (
            <select name="collection" value={form.collection} onChange={handleChange} className={inputCls}>
              {collections.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
            </select>
          ) : (
            <div className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-400 bg-gray-50">
              Sin colecciones — créalas en la pestaña Colecciones
            </div>
          )}
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Categoría</label>
          <select name="category" value={form.category} onChange={handleChange} className={inputCls}>
            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div className="sm:col-span-2">
          <label className="block text-xs font-medium text-gray-500 mb-1">Descripción</label>
          <input
            type="text" name="description" value={form.description} onChange={handleChange}
            placeholder="Ej: Sobres Temporal Forces, carta Charizard ex..."
            required className={inputCls}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Cantidad</label>
          <input type="number" name="quantity" value={form.quantity} onChange={handleChange} min="1" className={inputCls} />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Precio unitario (€)</label>
          <input
            type="number" name="price" value={form.price} onChange={handleChange}
            step="0.01" min="0" placeholder="0.00" required className={inputCls}
          />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-xs font-medium text-gray-500 mb-1">Notas (opcional)</label>
          <input
            type="text" name="notes" value={form.notes} onChange={handleChange}
            placeholder="Tienda, edición, condición..." className={inputCls}
          />
        </div>
      </div>
      <div className="mt-4 flex gap-2">
        <button
          type="submit"
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2 rounded-lg text-sm transition-colors"
        >
          {isEdit ? <><Save size={15} /> Guardar cambios</> : <><PlusCircle size={16} /> Añadir compra</>}
        </button>
        {isEdit && (
          <button type="button" onClick={onCancel} className="px-4 py-2 rounded-lg text-sm text-gray-500 hover:bg-gray-100 transition-colors">
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
}
