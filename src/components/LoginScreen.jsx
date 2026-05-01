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

  const inputCls = 'w-full border border-gray-200 rounded-xl pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-shadow';

  return (
    <div className="min-h-screen flex">

      {/* Left panel — desktop only */}
      <div className="hidden lg:flex w-[45%] bg-gray-900 flex-col justify-between p-12 relative overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute -top-24 -left-24 w-72 h-72 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 -right-16 w-48 h-48 bg-blue-800/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 left-1/3 w-56 h-56 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Logo */}
        <div className="relative">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center text-xl shadow-lg">
              🃏
            </div>
            <span className="text-white font-bold text-xl tracking-tight">CardTracker</span>
          </div>
        </div>

        {/* Center content */}
        <div className="relative">
          <h2 className="text-4xl font-extrabold text-white leading-tight">
            Lleva el control<br />de tu colección.
          </h2>
          <p className="text-gray-400 mt-4 text-base leading-relaxed">
            Registra compras, ventas y analiza tu rentabilidad en un solo lugar.
          </p>
          <div className="mt-8 space-y-3">
            {FEATURES.map(f => (
              <div key={f} className="flex items-center gap-3">
                <div className="w-5 h-5 bg-blue-500/20 rounded-full flex items-center justify-center shrink-0">
                  <Check size={11} className="text-blue-400" />
                </div>
                <span className="text-sm text-gray-300">{f}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom */}
        <p className="relative text-xs text-gray-600">© 2025 CardTracker</p>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-[#f0f4f8]">
        <div className="w-full max-w-sm">

          {/* Mobile logo */}
          <div className="text-center mb-8 lg:hidden">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-3 shadow-lg">
              🃏
            </div>
            <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">CardTracker</h1>
            <p className="text-sm text-gray-400 mt-1">Tu dashboard de cartas de colección</p>
          </div>

          {/* Card */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
            <h2 className="text-xl font-extrabold text-gray-900">
              {mode === 'login' ? 'Bienvenido de nuevo' : 'Crear cuenta'}
            </h2>
            <p className="text-sm text-gray-400 mt-1 mb-6">
              {mode === 'login' ? 'Introduce tus datos para continuar.' : 'Completa el formulario para registrarte.'}
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Email</label>
                <div className="relative">
                  <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  <input
                    type="email" value={email} onChange={e => setEmail(e.target.value)}
                    required autoComplete="email" placeholder="tu@email.com"
                    className={inputCls}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Contraseña</label>
                <div className="relative">
                  <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  <input
                    type="password" value={password} onChange={e => setPassword(e.target.value)}
                    required autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                    placeholder="••••••••" minLength={6}
                    className={inputCls}
                  />
                </div>
              </div>

              {error && (
                <div className="flex items-start gap-2.5 text-xs text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2.5">
                  <AlertCircle size={13} className="shrink-0 mt-0.5" />
                  {error}
                </div>
              )}

              <button
                type="submit" disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:opacity-60 text-white font-bold py-3 rounded-xl text-sm transition-all shadow-md shadow-blue-500/25 mt-1"
              >
                {loading ? 'Cargando...' : mode === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}
              </button>
            </form>

            <div className="mt-5 pt-5 border-t border-gray-100 text-center">
              <p className="text-xs text-gray-400">
                {mode === 'login' ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}{' '}
                <button onClick={switchMode} className="text-blue-600 font-semibold hover:underline">
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
