import { useState } from 'react';
import { PlusCircle, Trash2, Pencil, Check, X } from 'lucide-react';
import { COLOR_PALETTE } from '../collectionColors';

export default function CollectionsView({ collections, onAdd, onRemove, onRename }) {
  const [name, setName] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState('');

  function handleAdd(e) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    if (collections.some(c => c.name.toLowerCase() === trimmed.toLowerCase())) return;
    onAdd({ name: trimmed, colorIndex: collections.length });
    setName('');
  }

  function startEdit(col) {
    setEditingId(col.id);
    setEditingName(col.name);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditingName('');
  }

  function saveEdit(col) {
    const trimmed = editingName.trim();
    if (!trimmed || trimmed === col.name) { cancelEdit(); return; }
    if (collections.some(c => c.id !== col.id && c.name.toLowerCase() === trimmed.toLowerCase())) {
      cancelEdit(); return;
    }
    onRename(col.id, col.name, trimmed);
    cancelEdit();
  }

  return (
    <div className="space-y-6 max-w-xl mx-auto">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Nueva colección</h2>
        <form onSubmit={handleAdd} className="flex gap-3">
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Nombre de la colección..."
            className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <button
            type="submit"
            disabled={!name.trim()}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white font-semibold px-4 py-2 rounded-lg text-sm transition-colors"
          >
            <PlusCircle size={16} />
            Crear
          </button>
        </form>
      </div>

      {collections.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center text-gray-400 text-sm">
          No tienes colecciones creadas aún. ¡Crea tu primera colección arriba!
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-50">
            <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">
              {collections.length} {collections.length === 1 ? 'colección' : 'colecciones'}
            </span>
          </div>
          <div className="divide-y divide-gray-50">
            {collections.map(col => {
              const color = COLOR_PALETTE[col.colorIndex % COLOR_PALETTE.length];
              const isEditing = editingId === col.id;
              return (
                <div key={col.id} className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition-colors">
                  <span className={`w-3 h-3 rounded-full shrink-0 ${color.dot}`} />

                  {isEditing ? (
                    <>
                      <input
                        autoFocus
                        value={editingName}
                        onChange={e => setEditingName(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') saveEdit(col); if (e.key === 'Escape') cancelEdit(); }}
                        className="flex-1 border border-blue-300 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                      />
                      <button onClick={() => saveEdit(col)} className="text-green-500 hover:text-green-600 transition-colors" title="Guardar">
                        <Check size={15} />
                      </button>
                      <button onClick={cancelEdit} className="text-gray-300 hover:text-gray-500 transition-colors" title="Cancelar">
                        <X size={15} />
                      </button>
                    </>
                  ) : (
                    <>
                      <span className="flex-1 text-sm font-medium text-gray-800">{col.name}</span>
                      <button onClick={() => startEdit(col)} className="text-gray-300 hover:text-blue-400 transition-colors" title="Renombrar">
                        <Pencil size={14} />
                      </button>
                      <button onClick={() => onRemove(col.id)} className="text-gray-300 hover:text-red-400 transition-colors" title="Eliminar">
                        <Trash2 size={15} />
                      </button>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
