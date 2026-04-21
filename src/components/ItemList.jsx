import { Trash2, Tag, Calendar, StickyNote } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

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

function PurchaseBadge({ category }) {
  const map = {
    'Sobre': 'bg-blue-100 text-blue-700',
    'Caja': 'bg-purple-100 text-purple-700',
    'Carta individual': 'bg-yellow-100 text-yellow-700',
    'Bundle': 'bg-orange-100 text-orange-700',
    'Colección completa': 'bg-pink-100 text-pink-700',
    'Otro': 'bg-gray-100 text-gray-600',
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
    'Local': 'bg-gray-100 text-gray-600',
    'Otro': 'bg-gray-100 text-gray-600',
  };
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${map[platform] || map['Otro']}`}>
      {platform}
    </span>
  );
}

export default function ItemList({ items, type, onRemove }) {
  if (items.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center text-gray-400 text-sm">
        No hay {type === 'purchase' ? 'compras' : 'ventas'} registradas aún.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="divide-y divide-gray-50">
        {items.map(item => (
          <div key={item.id} className="flex items-start justify-between gap-4 p-4 hover:bg-gray-50 transition-colors">
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="font-medium text-gray-800 text-sm truncate">{item.description}</span>
                {type === 'purchase'
                  ? <PurchaseBadge category={item.category} />
                  : <SaleBadge platform={item.platform} />}
              </div>
              <div className="flex flex-wrap gap-3 text-xs text-gray-400">
                <span className="flex items-center gap-1">
                  <Calendar size={11} />
                  {fmtDate(item.date)}
                </span>
                <span className="flex items-center gap-1">
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
            </div>
            <div className="flex flex-col items-end gap-1 shrink-0">
              <span className={`font-bold text-sm ${type === 'sale' ? 'text-green-600' : 'text-gray-800'}`}>
                {fmt(item.total)}
              </span>
              {type === 'sale' && item.costBasis > 0 && (
                <span className={`text-xs font-medium ${item.profit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {item.profit >= 0 ? '+' : ''}{fmt(item.profit)}
                </span>
              )}
              <button
                onClick={() => onRemove(item.id)}
                className="text-gray-300 hover:text-red-400 transition-colors mt-1"
                title="Eliminar"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
