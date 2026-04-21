import { useState } from 'react';
import { PlusCircle } from 'lucide-react';
import { format } from 'date-fns';

const PLATFORMS = ['Cardmarket', 'eBay', 'Wallapop', 'Vinted', 'Local', 'Otro'];

export default function SaleForm({ onAdd }) {
  const today = format(new Date(), 'yyyy-MM-dd');
  const [form, setForm] = useState({
    date: today,
    description: '',
    platform: 'Cardmarket',
    quantity: 1,
    price: '',
    costBasis: '',
    notes: '',
  });

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
    onAdd({
      ...form,
      quantity: qty,
      price,
      costBasis: cost,
      total: qty * price,
      profit: qty * price - cost,
    });
    setForm({ date: today, description: '', platform: 'Cardmarket', quantity: 1, price: '', costBasis: '', notes: '' });
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Nueva Venta</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Fecha</label>
          <input
            type="date"
            name="date"
            value={form.date}
            onChange={handleChange}
            required
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Plataforma</label>
          <select
            name="platform"
            value={form.platform}
            onChange={handleChange}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
          >
            {PLATFORMS.map(p => <option key={p}>{p}</option>)}
          </select>
        </div>
        <div className="sm:col-span-2">
          <label className="block text-xs font-medium text-gray-500 mb-1">Descripción</label>
          <input
            type="text"
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Ej: Pikachu ex 232/193, lote de sobres..."
            required
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Cantidad</label>
          <input
            type="number"
            name="quantity"
            value={form.quantity}
            onChange={handleChange}
            min="1"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Precio venta unitario (€)</label>
          <input
            type="number"
            name="price"
            value={form.price}
            onChange={handleChange}
            step="0.01"
            min="0"
            placeholder="0.00"
            required
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Coste total de compra (€)</label>
          <input
            type="number"
            name="costBasis"
            value={form.costBasis}
            onChange={handleChange}
            step="0.01"
            min="0"
            placeholder="0.00 (para calcular beneficio)"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Notas (opcional)</label>
          <input
            type="text"
            name="notes"
            value={form.notes}
            onChange={handleChange}
            placeholder="Condición, envío, comprador..."
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
          />
        </div>
      </div>
      <button
        type="submit"
        className="mt-4 flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold px-5 py-2 rounded-lg text-sm transition-colors"
      >
        <PlusCircle size={16} />
        Añadir venta
      </button>
    </form>
  );
}
