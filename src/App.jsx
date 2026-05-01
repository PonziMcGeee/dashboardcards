import { useState } from 'react';
import { signOut } from 'firebase/auth';
import { writeBatch, doc } from 'firebase/firestore';
import { auth, db } from './firebase';
import { useAuth } from './hooks/useAuth';
import { useData } from './hooks/useData';
import { useToast } from './components/Toast';
import Navbar from './components/Navbar';
import DashboardView from './components/DashboardView';
import PurchasesView from './components/PurchasesView';
import SalesView from './components/SalesView';
import CollectionsView from './components/CollectionsView';
import LoginScreen from './components/LoginScreen';

export default function App() {
  const [tab, setTab] = useState('dashboard');
  const user = useAuth();
  const toast = useToast();

  const { items: purchases, addItem: addPurchase, removeItem: removePurchase, updateItem: updatePurchase } = useData('purchases', user?.uid);
  const { items: sales, addItem: addSale, removeItem: removeSale, updateItem: updateSale } = useData('sales', user?.uid);
  const { items: collections, addItem: addCollection, removeItem: removeCollection } = useData('collections', user?.uid);

  const handleAddPurchase    = async (d) => { await addPurchase(d);      toast('Compra añadida'); };
  const handleRemovePurchase = async (id) => { await removePurchase(id); toast('Compra eliminada'); };
  const handleUpdatePurchase = async (id, d) => { await updatePurchase(id, d); toast('Compra actualizada'); };

  const handleAddSale    = async (d) => { await addSale(d);      toast('Venta añadida'); };
  const handleRemoveSale = async (id) => { await removeSale(id); toast('Venta eliminada'); };
  const handleUpdateSale = async (id, d) => { await updateSale(id, d); toast('Venta actualizada'); };

  const handleAddCollection    = async (d) => { await addCollection(d);      toast('Colección creada'); };
  const handleRemoveCollection = async (id) => { await removeCollection(id); toast('Colección eliminada'); };

  async function handleRenameCollection(colId, oldName, newName) {
    const uid = user.uid;
    const batch = writeBatch(db);
    batch.update(doc(db, 'users', uid, 'collections', colId), { name: newName });
    purchases
      .filter(p => p.collection === oldName)
      .forEach(p => batch.update(doc(db, 'users', uid, 'purchases', p.id), { collection: newName }));
    sales
      .filter(s => s.collection === oldName)
      .forEach(s => batch.update(doc(db, 'users', uid, 'sales', s.id), { collection: newName }));
    await batch.commit();
    toast(`Colección renombrada a "${newName}"`);
  }

  if (user === undefined) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <span className="text-4xl">🃏</span>
          <p className="text-sm text-gray-400 mt-3">Cargando...</p>
        </div>
      </div>
    );
  }

  if (user === null) {
    return <LoginScreen />;
  }

  return (
    <div className="min-h-screen bg-[#f0f4f8]">
      <Navbar active={tab} onChange={setTab} user={user} onLogout={() => signOut(auth)} />
      <main className="max-w-5xl mx-auto px-4 py-6 pb-24 sm:pb-6">
        {tab === 'dashboard' && (
          <DashboardView
            purchases={purchases}
            sales={sales}
            collections={collections}
            onRemovePurchase={handleRemovePurchase}
            onUpdatePurchase={handleUpdatePurchase}
            onRemoveSale={handleRemoveSale}
            onUpdateSale={handleUpdateSale}
          />
        )}
        {tab === 'purchases' && (
          <PurchasesView purchases={purchases} collections={collections} onAdd={handleAddPurchase} onRemove={handleRemovePurchase} onUpdate={handleUpdatePurchase} />
        )}
        {tab === 'sales' && (
          <SalesView sales={sales} collections={collections} onAdd={handleAddSale} onRemove={handleRemoveSale} onUpdate={handleUpdateSale} />
        )}
        {tab === 'collections' && (
          <CollectionsView collections={collections} onAdd={handleAddCollection} onRemove={handleRemoveCollection} onRename={handleRenameCollection} />
        )}
      </main>
    </div>
  );
}
