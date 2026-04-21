import { useState } from 'react';
import Navbar from './components/Navbar';
import DashboardView from './components/DashboardView';
import PurchasesView from './components/PurchasesView';
import SalesView from './components/SalesView';
import { useData } from './hooks/useData';

export default function App() {
  const [tab, setTab] = useState('dashboard');
  const { items: purchases, addItem: addPurchase, removeItem: removePurchase } = useData('purchases');
  const { items: sales, addItem: addSale, removeItem: removeSale } = useData('sales');

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar active={tab} onChange={setTab} />
      <main className="max-w-5xl mx-auto px-4 py-6">
        {tab === 'dashboard' && <DashboardView purchases={purchases} sales={sales} />}
        {tab === 'purchases' && (
          <PurchasesView purchases={purchases} onAdd={addPurchase} onRemove={removePurchase} />
        )}
        {tab === 'sales' && (
          <SalesView sales={sales} onAdd={addSale} onRemove={removeSale} />
        )}
      </main>
    </div>
  );
}
