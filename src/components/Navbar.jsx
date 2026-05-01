import { LayoutDashboard, ShoppingCart, TrendingUp, LogOut, FolderOpen } from 'lucide-react';

const tabs = [
  { id: 'dashboard',   label: 'Dashboard',    Icon: LayoutDashboard },
  { id: 'purchases',   label: 'Compras',       Icon: ShoppingCart },
  { id: 'sales',       label: 'Ventas',        Icon: TrendingUp },
  { id: 'collections', label: 'Colecciones',   Icon: FolderOpen },
];

export default function Navbar({ active, onChange, onLogout, user }) {
  return (
    <>
      {/* Top bar */}
      <nav className="bg-gray-900 sticky top-0 z-10 shadow-lg">
        <div className="max-w-5xl mx-auto px-4 flex items-center h-14 gap-4">
          {/* Logo */}
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg flex items-center justify-center shadow-md text-base select-none">
              🃏
            </div>
            <span className="text-white font-bold text-base tracking-tight">CardTracker</span>
          </div>

          {/* Tabs — desktop */}
          <div className="hidden sm:flex items-center gap-0.5 flex-1 ml-2">
            {tabs.map(({ id, label, Icon }) => (
              <button
                key={id}
                onClick={() => onChange(id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  active === id
                    ? 'bg-white/10 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon size={15} />
                {label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3 ml-auto shrink-0">
            <span className="text-xs text-gray-500 hidden sm:block truncate max-w-32">{user?.email}</span>
            <button
              onClick={onLogout}
              title="Cerrar sesión"
              className="flex items-center gap-1.5 text-gray-400 hover:text-red-400 transition-colors text-xs font-medium"
            >
              <LogOut size={15} />
              <span className="hidden sm:block">Salir</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Bottom tab bar — mobile only */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-10 bg-white border-t border-gray-200 shadow-[0_-4px_12px_rgba(0,0,0,0.08)]">
        <div className="flex">
          {tabs.map(({ id, label, Icon }) => (
            <button
              key={id}
              onClick={() => onChange(id)}
              className={`flex-1 flex flex-col items-center gap-0.5 pt-2 pb-3 text-xs font-medium transition-colors relative ${
                active === id ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              {active === id && (
                <span className="absolute top-0 left-[20%] right-[20%] h-0.5 bg-blue-500 rounded-full" />
              )}
              <Icon size={21} />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
