# Planify · Marketplace de eventos (prototipo)

Prototipo 100 % frontend (React + Vite + Tailwind CSS + Lucide). Todo el estado vive en `AppContext` con datos de prueba.

```bash
npm install
npm run dev
```

## Compartir la página

**Enlace permanente:** https://alejandramr15.github.io/planify/ (no necesita consola abierta).

Cada `git push` a `main` vuelve a publicarlo solo en un par de minutos (`.github/workflows/deploy.yml`). Para probar en otros dispositivos sin subir cambios:

- **Misma red (Wi-Fi):** `npm run dev` muestra una dirección `Network: http://…:5173`. Ábrela desde cualquier dispositivo conectado a esa red. Si no carga, permite Node.js en el Firewall de Windows.
- **Cualquier persona con internet:** `npm run publico` compila la app y muestra un enlace `https://….trycloudflare.com`. Funciona mientras la consola siga abierta y cambia cada vez que se ejecuta.

## Estructura

```
src/
  context/AppContext.jsx   Estado global: usuario, rol, carrito, presupuesto, reservas, custodia, reseñas, agenda, chat
  data/mockData.js         Servicios, categorías, ciudades, conversaciones, reservas y reseñas de ejemplo
  utils/format.js          Formato COP, fechas, helpers
  utils/chatBot.js         Respuestas automáticas simuladas del proveedor
  utils/agenda.js          Cálculo de horarios, conflictos y cronograma sugerido
  components/              Header, AuthModal, ServiceCard, ServiceDetailModal, Toasts, ui (Stepper, Modal, badges…)
  pages/                   Marketplace, Budget, Cart, Checkout, Confirmation, Reservations, Agenda, Chat, ProviderDashboard
```

## Módulos

- **Catálogo:** búsqueda por categoría, ciudad y tipo de evento, con galería, descripción, precio y perfil del proveedor.
- **Presupuesto:** límite editable, costo total en tiempo real y sugerencias de cambio cuando te pasas.
- **Carrito y reservas:** todos los servicios se reservan en una sola transacción; las fechas ocupadas bloquean el pago.
- **Custodia:** el pago queda retenido y se libera cuando el cliente confirma el cumplimiento; si el proveedor rechaza o incumple, se reembolsa. Es una simulación: no hay pasarela ni backend reales.
- **Calificaciones:** solo se puede opinar sobre reservas cumplidas.
- **Agenda:** cronograma editable por servicio, con detección de cruces de horario.

El estado vive en memoria: al recargar la página vuelve a los datos de ejemplo.

## Para probar

- Cupones: `BIENVENIDAHOMEPAGE` (10 %) y `PLANIFY5` (5 %).
- Tarjeta: cualquier número de 16 dígitos, fecha futura (MM/AA) y CVC de 3 dígitos.
- Celular de emergencia: formato colombiano `3XXXXXXXXX`.
- Flujo proveedor → cliente: publica un servicio como Proveedor, cámbiate a Cliente, agrégalo al carrito y paga; la reserva aparece en el panel del proveedor.
- Custodia y reseñas: en **Mis reservas** hay una reserva de ejemplo para confirmar el cumplimiento y otra lista para calificar.
- Presupuesto: baja el límite en **Presupuesto** para ver las sugerencias de ahorro.
