import { useState, useEffect } from 'react';
import { loadData, saveData, generateId } from '../utils/storage';

export function useData(key) {
  const [items, setItems] = useState(() => loadData(key));

  useEffect(() => {
    saveData(key, items);
  }, [key, items]);

  function addItem(data) {
    const item = { id: generateId(), createdAt: new Date().toISOString(), ...data };
    setItems(prev => [item, ...prev]);
    return item;
  }

  function removeItem(id) {
    setItems(prev => prev.filter(i => i.id !== id));
  }

  function updateItem(id, data) {
    setItems(prev => prev.map(i => (i.id === id ? { ...i, ...data } : i)));
  }

  return { items, addItem, removeItem, updateItem };
}
