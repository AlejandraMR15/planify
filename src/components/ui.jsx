import { useEffect, useState } from 'react';
import { BadgeCheck, CalendarCheck2, CalendarX2, Check, ImageIcon, Lock, Star, Undo2, X } from 'lucide-react';

// Imagen con respaldo elegante si la URL falla
export function SmartImage({ src, alt, className = '', icon: Icon = ImageIcon }) {
  const [error, setError] = useState(false);
  useEffect(() => setError(false), [src]);
  if (!src || error) {
    return (
      <div className={`flex items-center justify-center bg-gradient-to-br from-gold/90 via-gold-light to-coal ${className}`}>
        <Icon className="h-8 w-8 text-cream/80" />
      </div>
    );
  }
  return <img src={src} alt={alt} loading="lazy" onError={() => setError(true)} className={`object-cover ${className}`} />;
}

export function Stars({ rating, reviews, size = 'h-4 w-4' }) {
  return (
    <div className="flex items-center gap-1">
      <div className="flex">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            className={`${size} ${i <= Math.round(rating) ? 'fill-gold-soft text-gold-soft' : 'text-coal/20'}`}
          />
        ))}
      </div>
      <span className="text-xs font-semibold text-coal">{reviews === 0 ? 'Sin reseñas' : rating.toFixed(1)}</span>
      {reviews > 0 && <span className="text-xs text-coal/50">({reviews})</span>}
    </div>
  );
}

export function VerifiedBadge({ verified }) {
  if (!verified) return <span className="badge-amber">En revisión</span>;
  return (
    <span className="badge-green">
      <BadgeCheck className="h-3.5 w-3.5" /> Proveedor verificado
    </span>
  );
}

export function AvailabilityBadge({ service, date }) {
  const busy = service.busyDates?.includes(date);
  return busy ? (
    <span className="badge-red">
      <CalendarX2 className="h-3.5 w-3.5" /> Fecha no disponible
    </span>
  ) : (
    <span className="badge-green">
      <CalendarCheck2 className="h-3.5 w-3.5" /> Fecha disponible
    </span>
  );
}

const BOOKING_STATUS = {
  pendiente: ['badge-amber', 'Pendiente'],
  confirmada: ['badge-green', 'Confirmada'],
  cumplida: ['badge-green', 'Cumplida'],
  rechazada: ['badge-red', 'Rechazada'],
  incumplida: ['badge-red', 'Incumplida'],
};

export function BookingStatusBadge({ status }) {
  const [style, label] = BOOKING_STATUS[status];
  return <span className={style}>{label}</span>;
}

const ESCROW_STATUS = {
  retenido: ['badge-amber', 'Pago en custodia', Lock],
  liberado: ['badge-green', 'Pago liberado', Check],
  reembolsado: ['badge-red', 'Pago reembolsado', Undo2],
};

export function EscrowBadge({ escrow }) {
  const [style, label, Icon] = ESCROW_STATUS[escrow];
  return (
    <span className={style}>
      <Icon className="h-3.5 w-3.5" /> {label}
    </span>
  );
}

export function Modal({ open, onClose, children, className = 'max-w-lg' }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className={`card relative max-h-[92vh] w-full overflow-y-auto scrollbar-thin animate-slide-up ${className}`}>
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-10 rounded-full bg-white/80 p-1.5 text-coal/60 transition hover:text-coal"
          aria-label="Cerrar"
        >
          <X className="h-5 w-5" />
        </button>
        {children}
      </div>
    </div>
  );
}

const STEPS = ['Carrito', 'Datos y pago', 'Confirmación'];

export function Stepper({ current }) {
  return (
    <ol className="mx-auto mb-8 flex max-w-xl items-center justify-between">
      {STEPS.map((label, idx) => {
        const n = idx + 1;
        const done = n < current;
        const active = n === current;
        return (
          <li key={label} className="flex flex-1 items-center last:flex-none">
            <div className="flex flex-col items-center gap-2 sm:flex-row">
              <span
                className={`flex h-9 w-9 items-center justify-center rounded-full border text-sm font-semibold transition ${
                  done
                    ? 'border-gold bg-gold text-white'
                    : active
                    ? 'border-gold-soft bg-cream text-coal ring-4 ring-gold/30'
                    : 'border-white/20 text-cream/50'
                }`}
              >
                {done ? <Check className="h-4 w-4" /> : n}
              </span>
              <span className={`text-xs font-medium sm:text-sm ${active || done ? 'text-cream' : 'text-cream/40'}`}>{label}</span>
            </div>
            {n < STEPS.length && (
              <div className={`mx-3 h-px flex-1 ${done ? 'bg-gold' : 'bg-white/15'}`} />
            )}
          </li>
        );
      })}
    </ol>
  );
}

export function QtyStepper({ value, onChange, min = 1 }) {
  return (
    <div className="inline-flex items-center rounded-full border border-coal/15 bg-white">
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        className="h-8 w-8 rounded-full text-lg leading-none text-coal/70 hover:text-gold"
        aria-label="Disminuir"
      >
        −
      </button>
      <input
        type="number"
        min={min}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-14 bg-transparent text-center text-sm font-semibold text-coal outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
      />
      <button
        type="button"
        onClick={() => onChange(value + 1)}
        className="h-8 w-8 rounded-full text-lg leading-none text-coal/70 hover:text-gold"
        aria-label="Aumentar"
      >
        +
      </button>
    </div>
  );
}

export function SectionTitle({ eyebrow, title, subtitle, light = false }) {
  return (
    <div>
      {eyebrow && <p className="mb-2 text-xs font-semibold uppercase tracking-[0.25em] text-gold-soft">{eyebrow}</p>}
      <h1 className={`font-serif text-3xl font-semibold sm:text-4xl ${light ? 'text-coal' : 'text-cream'}`}>{title}</h1>
      {subtitle && <p className={`mt-2 text-sm ${light ? 'text-coal/60' : 'text-cream/60'}`}>{subtitle}</p>}
    </div>
  );
}
