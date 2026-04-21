import { useState } from 'react';
import { signOut } from 'firebase/auth';
import { auth } from './firebase';
import { useAuth } from './hooks/useAuth';
import { useData } from './hooks/useData';
import Navbar from './components/Navbar';
import DashboardView from './components/DashboardView';
import PurchasesView from './components/PurchasesView';
import SalesView from './components/SalesView';
import LoginScreen from './components/LoginScreen';

export default function App() {
  const [tab, setTab] = useState('dashboard');
  const user = useAuth();

  const { items: purchases, addItem: addPurchase, removeItem: removePurchase, updateItem: updatePurchase } = useData('purchases', user?.uid);
  const { items: sales, addItem: addSale, removeItem: removeSale, updateItem: updateSale } = useData('sales', user?.uid);

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
    <div className="min-h-screen bg-gray-50">
      <Navbar active={tab} onChange={setTab} user={user} onLogout={() => signOut(auth)} />
      <main className="max-w-5xl mx-auto px-4 py-6">
        {tab === 'dashboard' && <DashboardView purchases={purchases} sales={sales} />}
        {tab === 'purchases' && (
          <PurchasesView purchases={purchases} onAdd={addPurchase} onRemove={removePurchase} onUpdate={updatePurchase} />
        )}
        {tab === 'sales' && (
          <SalesView sales={sales} onAdd={addSale} onRemove={removeSale} onUpdate={updateSale} />
        )}
      </main>
    </div>
  );
}
