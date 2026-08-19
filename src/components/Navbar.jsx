import { LayoutDashboard, ShoppingCart, TrendingUp, LogOut, FolderOpen, Moon, Sun, Package, Download } from 'lucide-react';

const tabs = [
  { id: 'dashboard',   label: 'Dashboard',    Icon: LayoutDashboard },
  { id: 'purchases',   label: 'Compras',       Icon: ShoppingCart },
  { id: 'sales',       label: 'Ventas',        Icon: TrendingUp },
  { id: 'collections', label: 'Colecciones',   Icon: FolderOpen },
];

export default function Navbar({ active, onChange, onLogout, user, dark, onToggleTheme, onExport }) {
  return (
    <>
      {/* Filo dorado — detalle de firma, como el canto de una funda protectora */}
      <div className="h-[3px] bg-gradient-to-r from-amber-700 via-amber-400 to-amber-700 sticky top-0 z-20" />

      {/* Top bar */}
      <nav className="bg-stone-900 sticky top-[3px] z-10 shadow-lg">
        <div className="max-w-5xl mx-auto px-4 flex items-center h-14 gap-4">
          {/* Logo — tratado como un sello, no un icono de app */}
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="w-8 h-8 border-2 border-amber-500 rounded flex items-center justify-center text-base select-none">
              🃏
            </div>
            <span className="font-display text-white font-semibold text-base tracking-tight">CardTracker</span>
          </div>

          {/* Tabs — desktop */}
          <div className="hidden sm:flex items-center gap-1 flex-1 ml-2 h-full">
            {tabs.map(({ id, label, Icon }) => (
              <button
                key={id}
                onClick={() => onChange(id)}
                className={`flex items-center gap-1.5 px-3 h-full border-b-2 text-sm font-medium transition-colors ${
                  active === id
                    ? 'border-amber-500 text-white'
                    : 'border-transparent text-stone-400 hover:text-white hover:border-stone-600'
                }`}
              >
                <Icon size={15} />
                {label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3 ml-auto shrink-0">
            <span className="text-xs text-stone-500 hidden sm:block truncate max-w-32">{user?.email}</span>
            <button
              onClick={onExport}
              title="Exportar a Excel"
              className="text-stone-400 hover:text-white transition-colors"
            >
              <Download size={16} />
            </button>
            <button
              onClick={onToggleTheme}
              title={dark ? 'Modo claro' : 'Modo oscuro'}
              className="text-stone-400 hover:text-white transition-colors"
            >
              {dark ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <button
              onClick={onLogout}
              title="Cerrar sesión"
              className="flex items-center gap-1.5 text-stone-400 hover:text-red-400 transition-colors text-xs font-medium"
            >
              <LogOut size={15} />
              <span className="hidden sm:block">Salir</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Bottom tab bar — mobile only */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-10 bg-white dark:bg-stone-900 border-t border-stone-200 dark:border-stone-700 shadow-[0_-4px_12px_rgba(0,0,0,0.08)]">
        <div className="flex">
          {tabs.map(({ id, label, Icon }) => (
            <button
              key={id}
              onClick={() => onChange(id)}
              className={`flex-1 flex flex-col items-center gap-0.5 pt-2 pb-3 text-xs font-medium transition-colors relative ${
                active === id ? 'text-amber-500' : 'text-stone-500 dark:text-stone-400 hover:text-stone-600 dark:hover:text-stone-400'
              }`}
            >
              {active === id && (
                <span className="absolute top-0 left-[20%] right-[20%] h-0.5 bg-amber-500 rounded-full" />
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
