import { useState } from 'react';
import { PlusCircle, Save } from 'lucide-react';
import { format } from 'date-fns';
import { COLLECTIONS } from './PurchaseForm';

const PLATFORMS = ['Cardmarket', 'eBay', 'Wallapop', 'Vinted', 'Local', 'Otro'];

function emptyForm(today) {
  return { date: today, description: '', collection: '', platform: 'Cardmarket', quantity: 1, price: '', costBasis: '', notes: '' };
}

export default function SaleForm({ onAdd, editItem, onSave, onCancel }) {
  const today = format(new Date(), 'yyyy-MM-dd');
  const isEdit = !!editItem;

  const [form, setForm] = useState(() =>
    isEdit
      ? { ...editItem, price: editItem.price.toString(), costBasis: editItem.costBasis?.toString() ?? '' }
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
    const cost = form.costBasis ? parseFloat(form.costBasis) : 0;
    const data = { ...form, quantity: qty, price, costBasis: cost, total: qty * price, profit: qty * price - cost };
    if (isEdit) {
      onSave(editItem.id, data);
    } else {
      onAdd(data);
      setForm(emptyForm(today));
    }
  }

  const ring = 'focus:ring-green-400';
  const inputCls = `w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 ${ring}`;

  return (
    <form onSubmit={handleSubmit} className={isEdit ? '' : 'bg-white rounded-2xl shadow-sm border border-gray-100 p-6'}>
      {!isEdit && <h2 className="text-lg font-semibold text-gray-800 mb-4">Nueva Venta</h2>}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Fecha</label>
          <input type="date" name="date" value={form.date} onChange={handleChange} required className={inputCls} />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Colección / Origen</label>
          <input
            type="text"
            name="collection"
            value={form.collection}
            onChange={handleChange}
            list="sale-collections"
            placeholder="Pokemon, pala de pádel..."
            className={inputCls}
          />
          <datalist id="sale-collections">
            {COLLECTIONS.map(c => <option key={c} value={c} />)}
          </datalist>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Plataforma</label>
          <select name="platform" value={form.platform} onChange={handleChange} className={inputCls}>
            {PLATFORMS.map(p => <option key={p}>{p}</option>)}
          </select>
        </div>
        <div className="sm:col-span-2">
          <label className="block text-xs font-medium text-gray-500 mb-1">Descripción</label>
          <input
            type="text" name="description" value={form.description} onChange={handleChange}
            placeholder="Ej: Pikachu ex 232/193, lote de sobres..."
            required className={inputCls}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Cantidad</label>
          <input type="number" name="quantity" value={form.quantity} onChange={handleChange} min="1" className={inputCls} />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Precio venta unitario (€)</label>
          <input
            type="number" name="price" value={form.price} onChange={handleChange}
            step="0.01" min="0" placeholder="0.00" required className={inputCls}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Coste total de compra (€)</label>
          <input
            type="number" name="costBasis" value={form.costBasis} onChange={handleChange}
            step="0.01" min="0" placeholder="0.00 (para calcular beneficio)" className={inputCls}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Notas (opcional)</label>
          <input
            type="text" name="notes" value={form.notes} onChange={handleChange}
            placeholder="Condición, envío, comprador..." className={inputCls}
          />
        </div>
      </div>
      <div className="mt-4 flex gap-2">
        <button
          type="submit"
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold px-5 py-2 rounded-lg text-sm transition-colors"
        >
          {isEdit ? <><Save size={15} /> Guardar cambios</> : <><PlusCircle size={16} /> Añadir venta</>}
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
