import { LayoutDashboard, ShoppingCart, TrendingUp, LogOut } from 'lucide-react';

const tabs = [
  { id: 'dashboard', label: 'Dashboard', Icon: LayoutDashboard },
  { id: 'purchases', label: 'Compras', Icon: ShoppingCart },
  { id: 'sales', label: 'Ventas', Icon: TrendingUp },
];

export default function Navbar({ active, onChange, onLogout, user }) {
  return (
    <nav className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-10">
      <div className="max-w-5xl mx-auto px-4 flex items-center gap-1 h-14">
        <span className="text-base font-bold text-gray-800 mr-6 flex items-center gap-2">
          🃏 CardTracker
        </span>
        <div className="flex items-center gap-1 flex-1">
          {tabs.map(({ id, label, Icon }) => (
            <button
              key={id}
              onClick={() => onChange(id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                active === id
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'
              }`}
            >
              <Icon size={15} />
              {label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3 ml-auto shrink-0">
          <span className="text-xs text-gray-400 hidden sm:block truncate max-w-32">{user?.email}</span>
          <button
            onClick={onLogout}
            title="Cerrar sesión"
            className="flex items-center gap-1.5 text-gray-400 hover:text-red-500 transition-colors text-xs font-medium"
          >
            <LogOut size={15} />
            <span className="hidden sm:block">Salir</span>
          </button>
        </div>
      </div>
    </nav>
  );
}
