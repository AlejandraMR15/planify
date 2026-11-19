import { useState } from 'react';
import { CalendarDays, CheckCircle2, Flag, Landmark, MapPin, ReceiptText, Star, Undo2, Wallet } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getCategory } from '../data/mockData';
import { formatCOP, formatDate } from '../utils/format';
import { BookingStatusBadge, EscrowBadge, Modal, SmartImage } from '../components/ui';

const ACTIONS = {
  confirm: {
    title: '¿Confirmas que el proveedor cumplió?',
    text: 'Liberaremos el pago al proveedor. Esta acción no se puede deshacer.',
    cta: 'Sí, liberar el pago',
  },
  report: {
    title: '¿Reportar incumplimiento?',
    text: 'Cerraremos la reserva y te devolveremos lo que pagaste por este servicio.',
    cta: 'Sí, reportar y reembolsar',
  },
};

function ReviewForm({ booking }) {
  const { addReview } = useApp();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');

  const submit = (e) => {
    e.preventDefault();
    if (!rating) return setError('Elige de 1 a 5 estrellas');
    if (comment.trim().length < 10) return setError('Cuéntanos un poco más (mín. 10 caracteres)');
    addReview(booking.id, { rating, comment });
  };

  return (
    <form onSubmit={submit} noValidate className="mt-3 rounded-xl bg-cream-300/60 p-4">
      <p className="text-sm font-semibold">¿Cómo te fue con este proveedor?</p>
      <div className="mt-2 flex gap-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <button
            key={i}
            type="button"
            onClick={() => {
              setRating(i);
              setError('');
            }}
            aria-label={`${i} ${i === 1 ? 'estrella' : 'estrellas'}`}
            aria-pressed={rating === i}
          >
            <Star className={`h-6 w-6 transition ${i <= rating ? 'fill-gold-soft text-gold-soft' : 'text-coal/25 hover:text-gold-soft'}`} />
          </button>
        ))}
      </div>
      <textarea
        rows={2}
        value={comment}
        onChange={(e) => {
          setComment(e.target.value);
          setError('');
        }}
        placeholder="Tu opinión ayuda a otros organizadores…"
        aria-label="Tu opinión"
        className="input mt-3 resize-none"
      />
      {error && <p className="error-text">{error}</p>}
      <button className="btn-gold mt-3 px-4 py-2 text-xs">Publicar reseña</button>
    </form>
  );
}

function EscrowHint({ booking }) {
  if (booking.status === 'pendiente') return <p className="text-xs text-coal/60">Esperando que el proveedor acepte. Si rechaza, te devolvemos el pago.</p>;
  if (booking.status === 'rechazada') return <p className="text-xs text-coal/60">El proveedor rechazó la reserva y te devolvimos {formatCOP(booking.paid)}.</p>;
  if (booking.status === 'incumplida') return <p className="text-xs text-coal/60">Reportaste incumplimiento y te devolvimos {formatCOP(booking.paid)}.</p>;
  return null;
}

function BookingRow({ booking, onAction }) {
  const { getService, setDetailId } = useApp();
  const service = getService(booking.serviceId);
  const cat = getCategory(service.category);

  return (
    <li className="py-4 first:pt-0 last:pb-0">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <SmartImage src={service.image} alt={service.name} icon={cat.icon} className="h-16 w-16 shrink-0 rounded-xl" />
        <div className="min-w-0 flex-1">
          <button onClick={() => setDetailId(service.id)} className="text-left font-semibold hover:text-gold">{service.name}</button>
          <p className="text-xs text-coal/60">{service.provider.name}</p>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            <BookingStatusBadge status={booking.status} />
            <EscrowBadge escrow={booking.escrow} />
          </div>
        </div>
        <p className="text-sm font-bold sm:text-right">{formatCOP(booking.paid)}</p>
      </div>

      <div className="mt-3 sm:pl-[4.75rem]">
        <EscrowHint booking={booking} />
        {booking.status === 'confirmada' && (
          <div className="flex flex-wrap gap-2">
            <button onClick={() => onAction('confirm', booking)} className="btn-gold px-3 py-1.5 text-xs">
              <CheckCircle2 className="h-3.5 w-3.5" /> Confirmar cumplimiento y liberar pago
            </button>
            <button onClick={() => onAction('report', booking)} className="btn-outline px-3 py-1.5 text-xs">
              <Flag className="h-3.5 w-3.5" /> Reportar incumplimiento
            </button>
          </div>
        )}
        {booking.status === 'cumplida' && !booking.reviewed && <ReviewForm booking={booking} />}
        {booking.reviewed && <p className="text-xs font-medium text-emerald-700">Ya calificaste este servicio. ¡Gracias!</p>}
      </div>
    </li>
  );
}

function Stat({ icon: Icon, label, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-ink-800 p-5">
      <Icon className="h-5 w-5 text-gold-soft" />
      <p className="mt-3 text-2xl font-bold text-cream">{formatCOP(value, { suffix: false })}</p>
      <p className="text-xs text-cream/50">{label}</p>
    </div>
  );
}

export default function Reservations() {
  const { orders, clientBookings, confirmFulfillment, reportIssue, setView } = useApp();
  const [action, setAction] = useState(null); // null | { type, booking }

  const sumEscrow = (escrow) => clientBookings.filter((b) => b.escrow === escrow).reduce((sum, b) => sum + b.paid, 0);

  const runAction = () => {
    if (action.type === 'confirm') confirmFulfillment(action.booking.id);
    else reportIssue(action.booking.id);
    setAction(null);
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <p className="mb-1 text-xs font-semibold uppercase tracking-[0.25em] text-gold-soft">Custodia de fondos</p>
      <h1 className="font-serif text-4xl font-semibold">
        Mis reservas, <em className="text-gold-soft">mi dinero protegido</em>
      </h1>
      <p className="mt-2 text-sm text-cream/60">Tu pago se queda en custodia y solo llega al proveedor cuando confirmas que cumplió.</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <Stat icon={Landmark} label="En custodia" value={sumEscrow('retenido')} />
        <Stat icon={Wallet} label="Liberado a proveedores" value={sumEscrow('liberado')} />
        <Stat icon={Undo2} label="Reembolsado" value={sumEscrow('reembolsado')} />
      </div>

      {orders.length ? (
        <div className="mt-8 space-y-6">
          {orders.map((o) => (
            <article key={o.id} className="card p-6">
              <header className="mb-5 flex flex-wrap items-start justify-between gap-3 border-b border-coal/10 pb-4">
                <div>
                  <h2 className="font-serif text-2xl font-semibold">{o.event.name}</h2>
                  <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-coal/70">
                    <span className="inline-flex items-center gap-1"><CalendarDays className="h-3.5 w-3.5" /> {formatDate(o.event.date)}</span>
                    <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {o.event.city}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-mono text-sm font-semibold">{o.id}</p>
                  <p className="text-xs text-coal/60">Total pagado {formatCOP(o.totals.total)}</p>
                </div>
              </header>
              <ul className="divide-y divide-coal/10">
                {clientBookings.filter((b) => b.orderId === o.id).map((b) => (
                  <BookingRow key={b.id} booking={b} onAction={(type, booking) => setAction({ type, booking })} />
                ))}
              </ul>
            </article>
          ))}
        </div>
      ) : (
        <div className="card mx-auto mt-8 max-w-md p-10 text-center">
          <ReceiptText className="mx-auto h-10 w-10 text-gold" />
          <p className="mt-3 font-serif text-2xl">Aún no tienes reservas</p>
          <button onClick={() => setView('explore')} className="btn-gold mt-5">Explorar servicios</button>
        </div>
      )}

      <Modal open={!!action} onClose={() => setAction(null)} className="max-w-md">
        {action && (
          <div className="p-7">
            <p className="pr-8 font-serif text-2xl font-semibold">{ACTIONS[action.type].title}</p>
            <p className="mt-2 text-sm text-coal/70">{ACTIONS[action.type].text}</p>
            <div className="mt-6 flex justify-end gap-2">
              <button onClick={() => setAction(null)} className="btn-outline">Volver</button>
              <button onClick={runAction} className="btn-gold">{ACTIONS[action.type].cta}</button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
