import { useState, useEffect } from 'react';
import {
  collection, onSnapshot, addDoc, deleteDoc, doc, updateDoc,
} from 'firebase/firestore';
import { db } from '../firebase';

export function useData(key, uid) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!uid) {
      setItems([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const col = collection(db, 'users', uid, key);
    const unsub = onSnapshot(col, snap => {
      const data = snap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setItems(data);
      setLoading(false);
    });
    return unsub;
  }, [key, uid]);

  async function addItem(data) {
    if (!uid) return;
    await addDoc(collection(db, 'users', uid, key), {
      createdAt: new Date().toISOString(),
      ...data,
    });
  }

  async function removeItem(id) {
    if (!uid) return;
    await deleteDoc(doc(db, 'users', uid, key, id));
  }

  async function updateItem(id, data) {
    if (!uid) return;
    await updateDoc(doc(db, 'users', uid, key, id), data);
  }

  return { items, loading, addItem, removeItem, updateItem };
}
