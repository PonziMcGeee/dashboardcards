import { useState } from 'react';
import { PlusCircle, Trash2, Pencil, Check, X } from 'lucide-react';
import { COLOR_PALETTE } from '../collectionColors';

export default function CollectionsView({ collections, onAdd, onRemove, onRename, onUpdate }) {
  const [name, setName] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState('');

  function toggleActive(col) {
    onUpdate(col.id, { ...col, active: col.active === false ? true : false });
  }

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
      <div className="bg-white dark:bg-stone-800 rounded-2xl shadow-sm border border-stone-100 dark:border-stone-700 p-6">
        <h2 className="text-lg font-bold text-stone-800 dark:text-stone-100 mb-4">Nueva colección</h2>
        <form onSubmit={handleAdd} className="flex gap-3">
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Nombre de la colección..."
            className="flex-1 border border-stone-200 dark:border-stone-600 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent dark:bg-stone-700 dark:text-stone-100 dark:placeholder-stone-500"
          />
          <button
            type="submit"
            disabled={!name.trim()}
            className="flex items-center gap-2 bg-amber-600 hover:bg-amber-700 disabled:opacity-40 text-white font-semibold px-4 py-2.5 rounded-xl text-sm transition-colors shadow-sm"
          >
            <PlusCircle size={16} />
            Crear
          </button>
        </form>
      </div>

      {/* List */}
      {collections.length === 0 ? (
        <div className="bg-white dark:bg-stone-800 rounded-2xl border border-stone-100 dark:border-stone-700 shadow-sm p-12 text-center">
          <div className="flex justify-center gap-1.5 mb-4">
            {[0,1,2].map(i => (
              <div key={i} className={`w-4 h-4 rounded-full opacity-${i === 1 ? '100' : '40'} ${['bg-yellow-400','bg-blue-400','bg-green-500'][i]}`} />
            ))}
          </div>
          <p className="font-semibold text-stone-500 dark:text-stone-400 text-sm">Sin colecciones todavía</p>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">Crea tu primera colección arriba para empezar a organizar tus cartas.</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-stone-800 rounded-2xl border border-stone-100 dark:border-stone-700 shadow-sm overflow-hidden">
          <div className="px-5 py-3 border-b border-stone-50 dark:border-stone-700 flex items-center justify-between">
            <span className="text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-widest">
              {collections.length} {collections.length === 1 ? 'colección' : 'colecciones'}
            </span>
          </div>
          <div className="divide-y divide-stone-50 dark:divide-stone-700">
            {collections.map(col => {
              const color = COLOR_PALETTE[col.colorIndex % COLOR_PALETTE.length];
              const isEditing = editingId === col.id;
              const isActive = col.active !== false;
              return (
                <div key={col.id} className={`flex items-center gap-4 px-5 py-3.5 transition-colors ${isActive ? 'hover:bg-stone-50 dark:hover:bg-stone-700/40' : 'bg-stone-50/60 dark:bg-stone-700/20'}`}>
                  {/* Color badge */}
                  <div className={`w-5 h-5 rounded-lg shrink-0 ${color.dot} shadow-sm ${!isActive ? 'opacity-40' : ''}`} />

                  {isEditing ? (
                    <>
                      <input
                        autoFocus
                        value={editingName}
                        onChange={e => setEditingName(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') saveEdit(col); if (e.key === 'Escape') cancelEdit(); }}
                        className="flex-1 border border-amber-300 dark:border-amber-500 rounded-lg px-2.5 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 dark:bg-stone-700 dark:text-stone-100"
                      />
                      <button onClick={() => saveEdit(col)} className="text-green-500 hover:text-green-600 transition-colors" title="Guardar">
                        <Check size={16} />
                      </button>
                      <button onClick={cancelEdit} className="text-stone-300 dark:text-stone-500 hover:text-stone-500 dark:hover:text-stone-300 transition-colors" title="Cancelar">
                        <X size={16} />
                      </button>
                    </>
                  ) : (
                    <>
                      <span className={`flex-1 text-sm font-semibold transition-colors ${isActive ? 'text-stone-800 dark:text-stone-100' : 'text-stone-500 dark:text-stone-400'}`}>
                        {col.name}
                      </span>

                      {/* Active toggle */}
                      <button
                        onClick={() => toggleActive(col)}
                        title={isActive ? 'Desactivar colección' : 'Activar colección'}
                        className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors focus:outline-none ${
                          isActive ? 'bg-amber-500' : 'bg-stone-300 dark:bg-stone-600'
                        }`}
                      >
                        <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
                          isActive ? 'translate-x-[18px]' : 'translate-x-[3px]'
                        }`} />
                      </button>
                      <span className={`text-xs w-14 ${isActive ? 'text-amber-600 dark:text-amber-400 font-medium' : 'text-stone-500 dark:text-stone-400'}`}>
                        {isActive ? 'Activa' : 'Inactiva'}
                      </span>

                      <button onClick={() => startEdit(col)} className="p-1.5 -mr-1 text-stone-500 dark:text-stone-400 hover:!text-amber-600 dark:hover:!text-amber-400 transition-colors" title="Renombrar">
                        <Pencil size={14} />
                      </button>
                      <button onClick={() => onRemove(col.id)} className="p-1.5 -mr-1.5 text-stone-500 dark:text-stone-400 hover:!text-red-500 dark:hover:!text-red-400 transition-colors" title="Eliminar">
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
