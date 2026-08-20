import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['apple-touch-icon.png'],
      // El service worker solo precachea el shell de la app (JS/CSS/HTML/iconos).
      // A propósito NO se añade runtimeCaching para Firebase/Firestore: los datos
      // (compras, ventas, precios) deben ir siempre a red, nunca servirse desde
      // caché — aquí "offline" es "la app carga", no "los datos están al día".
      manifest: {
        name: 'CardTracker',
        short_name: 'CardTracker',
        description: 'Lleva el control de tu colección de cartas: compras, ventas y rentabilidad.',
        lang: 'es',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        theme_color: '#1c1917',
        background_color: '#f7f5f2',
        icons: [
          { src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: '/maskable-icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
    }),
  ],
  test: {
    environment: 'node',
  },
})
