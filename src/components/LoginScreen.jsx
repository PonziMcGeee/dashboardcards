import { useState } from 'react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { Mail, Lock, AlertCircle, Check } from 'lucide-react';
import { auth } from '../firebase';

const FEATURES = [
  'Registra compras y ventas fácilmente',
  'Organiza por colecciones personalizadas',
  'Analiza tu beneficio neto en tiempo real',
];

export default function LoginScreen() {
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'login') {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
    } catch (err) {
      setError(friendlyError(err.code));
    } finally {
      setLoading(false);
    }
  }

  function switchMode() {
    setMode(m => m === 'login' ? 'register' : 'login');
    setError('');
  }

  const inputCls = 'w-full border border-stone-200 dark:border-stone-600 rounded-xl pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-shadow dark:bg-stone-700 dark:text-stone-100 dark:placeholder-stone-500';

  return (
    <div className="min-h-screen flex">

      {/* Left panel — desktop only */}
      <div className="hidden lg:flex w-[45%] bg-stone-900 flex-col justify-between p-12 relative overflow-hidden">
        {/* Textura de papel rayado — ligada al concepto de cuaderno de coleccionista */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.07]"
          style={{ backgroundImage: 'repeating-linear-gradient(to bottom, #fff 0, #fff 1px, transparent 1px, transparent 32px)' }}
        />

        {/* Logo */}
        <div className="relative">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 border-2 border-amber-500 rounded-lg flex items-center justify-center text-xl">
              🃏
            </div>
            <span className="font-display text-white font-semibold text-xl tracking-tight">CardTracker</span>
          </div>
        </div>

        {/* Pila de slabs — motivo decorativo: fichas de gradación apiladas */}
        <div className="relative h-40 flex items-center">
          {[
            { rot: -8, x: 0,  y: 14, border: 'border-stone-600', grade: 'RAW', label: 'Sin certificar' },
            { rot: 4,  x: 46, y: 0,  border: 'border-emerald-600', grade: 'MINT 9', label: 'Vendida' },
            { rot: -3, x: 92, y: 20, border: 'border-amber-500', grade: 'GEM 10', label: 'En colección' },
          ].map((slab, i) => (
            <div
              key={i}
              className={`absolute w-24 h-32 rounded-lg border-2 ${slab.border} bg-stone-800/80 backdrop-blur-sm flex flex-col`}
              style={{ transform: `translate(${slab.x}px, ${slab.y}px) rotate(${slab.rot}deg)`, zIndex: i }}
            >
              <div className="h-6 border-b border-white/10 flex items-center justify-center">
                <span className="text-[9px] font-bold tracking-widest text-white/70">{slab.grade}</span>
              </div>
              <div className="flex-1 flex items-center justify-center">
                <span className="text-2xl opacity-80">🃏</span>
              </div>
              <div className="px-1.5 pb-1.5">
                <span className="text-[8px] text-white/50 leading-none">{slab.label}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Center content */}
        <div className="relative">
          <h2 className="text-4xl font-semibold text-white leading-tight">
            Lleva el control<br />de tu colección.
          </h2>
          <p className="text-stone-400 mt-4 text-base leading-relaxed">
            Registra compras, ventas y analiza tu rentabilidad en un solo lugar.
          </p>
          <div className="mt-8 space-y-3">
            {FEATURES.map(f => (
              <div key={f} className="flex items-center gap-3">
                <div className="w-5 h-5 border border-amber-500/60 rounded-full flex items-center justify-center shrink-0">
                  <Check size={11} className="text-amber-400" />
                </div>
                <span className="text-sm text-stone-300">{f}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom */}
        <p className="relative text-xs text-stone-600">© 2025 CardTracker</p>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-[#f7f5f2] dark:bg-stone-900">
        <div className="w-full max-w-sm">

          {/* Mobile logo */}
          <div className="text-center mb-8 lg:hidden">
            <div className="w-14 h-14 border-2 border-amber-500 rounded-xl flex items-center justify-center text-2xl mx-auto mb-3">
              🃏
            </div>
            <h1 className="text-2xl font-semibold text-stone-900 dark:text-white tracking-tight">CardTracker</h1>
            <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">Tu dashboard de cartas de colección</p>
          </div>

          {/* Card */}
          <div className="bg-white dark:bg-stone-800 rounded-lg shadow-md border border-stone-200 dark:border-stone-700 p-8">
            <h2 className="text-xl font-semibold text-stone-900 dark:text-white">
              {mode === 'login' ? 'Bienvenido de nuevo' : 'Crear cuenta'}
            </h2>
            <p className="text-sm text-stone-500 dark:text-stone-400 mt-1 mb-6">
              {mode === 'login' ? 'Introduce tus datos para continuar.' : 'Completa el formulario para registrarte.'}
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="login-email" className="block text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wide mb-1.5">Email</label>
                <div className="relative">
                  <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" />
                  <input
                    id="login-email"
                    type="email" value={email} onChange={e => setEmail(e.target.value)}
                    required autoComplete="email" placeholder="tu@email.com"
                    className={inputCls}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="login-password" className="block text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wide mb-1.5">Contraseña</label>
                <div className="relative">
                  <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" />
                  <input
                    id="login-password"
                    type="password" value={password} onChange={e => setPassword(e.target.value)}
                    required autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                    placeholder="••••••••" minLength={6}
                    className={inputCls}
                  />
                </div>
              </div>

              {error && (
                <div className="flex items-start gap-2.5 text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/50 rounded-xl px-3 py-2.5">
                  <AlertCircle size={13} className="shrink-0 mt-0.5" />
                  {error}
                </div>
              )}

              <button
                type="submit" disabled={loading}
                className="w-full bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 disabled:opacity-60 text-white font-bold py-3 rounded-xl text-sm transition-all shadow-md shadow-amber-500/25 mt-1"
              >
                {loading ? 'Cargando...' : mode === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}
              </button>
            </form>

            <div className="mt-5 pt-5 border-t border-stone-100 dark:border-stone-700 text-center">
              <p className="text-xs text-stone-500 dark:text-stone-400">
                {mode === 'login' ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}{' '}
                <button onClick={switchMode} className="text-amber-600 dark:text-amber-400 font-semibold hover:underline">
                  {mode === 'login' ? 'Regístrate gratis' : 'Iniciar sesión'}
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function friendlyError(code) {
  const map = {
    'auth/invalid-email':        'El email no es válido.',
    'auth/user-not-found':       'No existe una cuenta con ese email.',
    'auth/wrong-password':       'Contraseña incorrecta.',
    'auth/invalid-credential':   'Email o contraseña incorrectos.',
    'auth/email-already-in-use': 'Ya existe una cuenta con ese email.',
    'auth/weak-password':        'La contraseña debe tener al menos 6 caracteres.',
    'auth/too-many-requests':    'Demasiados intentos. Espera un momento.',
  };
  return map[code] || 'Ha ocurrido un error. Inténtalo de nuevo.';
}
