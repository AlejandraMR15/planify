import { useEffect } from 'react';
import { CalendarClock, CalendarDays, CheckCircle2, Clock, CreditCard, Landmark, MapPin, ReceiptText, Users } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getCategory } from '../data/mockData';
import { formatCOP, formatDate } from '../utils/format';
import { BookingStatusBadge, SmartImage, Stepper } from '../components/ui';

export default function Confirmation() {
  const { order, clientBookings, setView } = useApp();

  useEffect(() => {
    if (!order) setView('explore');
  }, [order, setView]);
  if (!order) return null;

  const { event, details, totals, items } = order;
  const statusOf = (serviceId) => clientBookings.find((b) => b.orderId === order.id && b.serviceId === serviceId)?.status;

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <Stepper current={3} />

      <div className="card overflow-hidden animate-slide-up">
        <div className="bg-gradient-to-r from-gold to-[#5e4321] p-8 text-center text-white">
          <CheckCircle2 className="mx-auto h-14 w-14" />
          <h1 className="mt-3 font-serif text-4xl font-semibold">¡Tu evento está reservado!</h1>
          <p className="mt-2 text-white/80">Una sola transacción para todos tus servicios. Ya avisamos a cada proveedor.</p>
          <div className="mx-auto mt-5 inline-flex flex-col rounded-xl bg-white/15 px-6 py-3 backdrop-blur">
            <span className="text-[11px] uppercase tracking-[0.25em] text-white/70">Número de reserva</span>
            <span className="font-mono text-2xl font-bold tracking-widest">{order.id}</span>
          </div>
        </div>

        <div className="grid gap-8 p-8 md:grid-cols-2">
          <div>
            <h2 className="font-serif text-2xl font-semibold">{event.name}</h2>
            <ul className="mt-4 space-y-2.5 text-sm text-coal/80">
              <li className="flex items-center gap-2"><CalendarDays className="h-4 w-4 text-gold" /> {formatDate(event.date)}</li>
              <li className="flex items-center gap-2"><Clock className="h-4 w-4 text-gold" /> Inicio: {details.startTime}</li>
              <li className="flex items-center gap-2"><MapPin className="h-4 w-4 text-gold" /> {details.address}, {event.city}</li>
              <li className="flex items-center gap-2"><Users className="h-4 w-4 text-gold" /> {event.guests} invitados</li>
              <li className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-gold" /> {details.card} · {details.installments} {details.installments === 1 ? 'cuota' : 'cuotas'}
              </li>
            </ul>
            <p className="mt-4 rounded-xl bg-cream-300 p-3 text-xs text-coal/70">Contacto de emergencia: {details.emergency}</p>
            <p className="mt-3 flex items-start gap-2 rounded-xl bg-gold/10 p-3 text-xs text-coal/80">
              <Landmark className="h-4 w-4 shrink-0 text-gold" />
              Tu pago está en custodia. Cada proveedor lo recibe cuando confirmes en “Mis reservas” que cumplió con el servicio.
            </p>
          </div>

          <div>
            <h3 className="label">Servicios reservados</h3>
            <ul className="space-y-3">
              {items.map(({ service, total }) => (
                <li key={service.id} className="flex items-center gap-3">
                  <SmartImage src={service.image} alt={service.name} icon={getCategory(service.category).icon} className="h-12 w-12 shrink-0 rounded-lg" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{service.name}</p>
                    <div className="mt-0.5"><BookingStatusBadge status={statusOf(service.id)} /></div>
                  </div>
                  <span className="text-sm font-semibold">{formatCOP(total, { suffix: false })}</span>
                </li>
              ))}
            </ul>
            <dl className="mt-5 space-y-1.5 border-t border-coal/10 pt-4 text-sm">
              <div className="flex justify-between text-coal/70"><dt>Subtotal</dt><dd>{formatCOP(totals.subtotal)}</dd></div>
              <div className="flex justify-between text-coal/70"><dt>Tarifa de protección</dt><dd>{formatCOP(totals.fee)}</dd></div>
              {totals.discount > 0 && (
                <div className="flex justify-between text-emerald-700"><dt>Descuento ({order.coupon})</dt><dd>−{formatCOP(totals.discount)}</dd></div>
              )}
              <div className="flex justify-between pt-2 text-lg font-bold"><dt>Total pagado</dt><dd>{formatCOP(totals.total)}</dd></div>
            </dl>
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-coal/10 p-6 sm:flex-row sm:justify-end">
          <button onClick={() => setView('agenda')} className="btn-outline">
            <CalendarClock className="h-4 w-4" /> Organizar agenda
          </button>
          <button onClick={() => setView('reservations')} className="btn-gold">
            <ReceiptText className="h-4 w-4" /> Ver mis reservas
          </button>
        </div>
      </div>
    </div>
  );
}
