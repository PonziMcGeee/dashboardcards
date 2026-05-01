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
      {/* Create form */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-bold text-gray-800 mb-4">Nueva colección</h2>
        <form onSubmit={handleAdd} className="flex gap-3">
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Nombre de la colección..."
            className="flex-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
          />
          <button
            type="submit"
            disabled={!name.trim()}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white font-semibold px-4 py-2.5 rounded-xl text-sm transition-colors shadow-sm"
          >
            <PlusCircle size={16} />
            Crear
          </button>
        </form>
      </div>

      {/* List */}
      {collections.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
          <div className="flex justify-center gap-1.5 mb-4">
            {[0,1,2].map(i => (
              <div key={i} className={`w-4 h-4 rounded-full opacity-${i === 1 ? '100' : '40'} ${['bg-yellow-400','bg-blue-400','bg-green-500'][i]}`} />
            ))}
          </div>
          <p className="font-semibold text-gray-500 text-sm">Sin colecciones todavía</p>
          <p className="text-xs text-gray-400 mt-1">Crea tu primera colección arriba para empezar a organizar tus cartas.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-50 flex items-center justify-between">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
              {collections.length} {collections.length === 1 ? 'colección' : 'colecciones'}
            </span>
          </div>
          <div className="divide-y divide-gray-50">
            {collections.map(col => {
              const color = COLOR_PALETTE[col.colorIndex % COLOR_PALETTE.length];
              const isEditing = editingId === col.id;
              return (
                <div key={col.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50 transition-colors">
                  {/* Color badge */}
                  <div className={`w-5 h-5 rounded-lg shrink-0 ${color.dot} shadow-sm`} />

                  {isEditing ? (
                    <>
                      <input
                        autoFocus
                        value={editingName}
                        onChange={e => setEditingName(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') saveEdit(col); if (e.key === 'Escape') cancelEdit(); }}
                        className="flex-1 border border-blue-300 rounded-lg px-2.5 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                      />
                      <button onClick={() => saveEdit(col)} className="text-green-500 hover:text-green-600 transition-colors" title="Guardar">
                        <Check size={16} />
                      </button>
                      <button onClick={cancelEdit} className="text-gray-300 hover:text-gray-500 transition-colors" title="Cancelar">
                        <X size={16} />
                      </button>
                    </>
                  ) : (
                    <>
                      <span className="flex-1 text-sm font-semibold text-gray-800">{col.name}</span>
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
