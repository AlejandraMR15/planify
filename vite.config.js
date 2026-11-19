import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // host: true abre la página a otros dispositivos de la misma red
  server: { host: true },
  // allowedHosts: el enlace público del túnel cambia en cada ejecución
  preview: { host: true, port: 4173, allowedHosts: true },
});
