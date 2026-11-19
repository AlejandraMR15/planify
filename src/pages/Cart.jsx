import { useState } from 'react';
import { AlertTriangle, CalendarDays, Check, Info, MapPin, MessageCircle, Pencil, Plus, ShieldCheck, ShoppingBag, Tag, Trash2, Users, Wallet, X } from 'lucide-react';
import { useApp, COUPONS, PLATFORM_FEE_RATE } from '../context/AppContext';
import { CATEGORIES, CITIES, getCategory } from '../data/mockData';
import { formatCOP, formatDate, UNIT_LABEL, UNIT_QTY_LABEL } from '../utils/format';
import { AvailabilityBadge, QtyStepper, SmartImage, Stepper } from '../components/ui';

function EventBanner() {
  const { event, setEvent } = useApp();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(event);

  const save = () => {
    setEvent({ ...draft, guests: Math.max(1, Number(draft.guests) || 1) });
    setEditing(false);
  };

  if (editing) {
    return (
      <div className="card grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_0.7fr_auto] lg:items-end">
        <label>
          <span className="label">Nombre del evento</span>
          <input className="input" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
        </label>
        <label>
          <span className="label">Fecha</span>
          <input type="date" className="input" value={draft.date} onChange={(e) => setDraft({ ...draft, date: e.target.value })} />
        </label>
        <label>
          <span className="label">Ciudad</span>
          <select className="input" value={draft.city} onChange={(e) => setDraft({ ...draft, city: e.target.value })}>
            {CITIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </label>
        <label>
          <span className="label">Invitados</span>
          <input type="number" min={1} className="input" value={draft.guests} onChange={(e) => setDraft({ ...draft, guests: e.target.value })} />
        </label>
        <div className="flex gap-2">
          <button onClick={() => setEditing(false)} className="btn-outline px-3" aria-label="Cancelar">
            <X className="h-4 w-4" />
          </button>
          <button onClick={save} className="btn-gold">
            <Check className="h-4 w-4" /> Guardar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-2xl border border-gold-soft/30 bg-gradient-to-r from-gold/90 to-[#5e4321] p-6 text-white">
      <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
      <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-white/70">Tu evento</p>
          <h2 className="mt-1 font-serif text-3xl font-semibold">{event.name}</h2>
          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-white/85">
            <span className="inline-flex items-center gap-1.5"><CalendarDays className="h-4 w-4" /> {formatDate(event.date)}</span>
            <span className="inline-flex items-center gap-1.5"><MapPin className="h-4 w-4" /> {event.city}</span>
            <span className="inline-flex items-center gap-1.5"><Users className="h-4 w-4" /> {event.guests} invitados</span>
          </div>
        </div>
        <button
          onClick={() => {
            setDraft(event);
            setEditing(true);
          }}
          className="inline-flex items-center gap-2 self-start rounded-full bg-white/15 px-4 py-2 text-sm font-semibold backdrop-blur transition hover:bg-white/25"
        >
          <Pencil className="h-4 w-4" /> Editar evento
        </button>
      </div>
    </div>
  );
}

function CartItem({ item }) {
  const { event, updateQty, removeFromCart, openChat } = useApp();
  const { service, qty, total } = item;
  const cat = getCategory(service.category);

  return (
    <div className="card flex flex-col gap-4 p-4 sm:flex-row">
      <SmartImage src={service.image} alt={service.name} icon={cat.icon} className="h-36 w-full shrink-0 rounded-xl sm:h-28 sm:w-36" />
      <div className="flex flex-1 flex-col gap-2">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-widest text-gold">{cat.label}</p>
            <h3 className="font-serif text-xl font-semibold leading-tight">{service.name}</h3>
            <p className="text-xs text-coal/60">{service.provider.name} · {service.city}</p>
          </div>
          <button onClick={() => removeFromCart(service.id)} className="rounded-full p-2 text-coal/40 transition hover:bg-red-50 hover:text-red-600" aria-label="Eliminar">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
        <p className="line-clamp-2 text-sm text-coal/70">{service.description}</p>
        <div className="flex flex-wrap items-center gap-2">
          <AvailabilityBadge service={service} date={event.date} />
          <button onClick={() => openChat(service.id)} className="inline-flex items-center gap-1 text-xs font-semibold text-gold hover:underline">
            <MessageCircle className="h-3.5 w-3.5" /> Chatear con el proveedor
          </button>
        </div>
        <div className="mt-1 flex flex-wrap items-end justify-between gap-3 border-t border-coal/10 pt-3">
          <div className="flex items-center gap-3">
            {service.unit === 'evento' ? (
              <span className="rounded-full bg-cream-300 px-3 py-1.5 text-xs font-semibold text-coal/70">Evento completo</span>
            ) : (
              <>
                <QtyStepper value={qty} onChange={(v) => updateQty(service.id, v)} />
                <span className="text-xs text-coal/60">{UNIT_QTY_LABEL[service.unit](qty)}</span>
              </>
            )}
          </div>
          <div className="text-right">
            <p className="text-xs text-coal/50">
              {formatCOP(service.price, { suffix: false })} {UNIT_LABEL[service.unit]}
              {service.unit !== 'evento' && ` × ${qty}`}
            </p>
            <p className="text-lg font-bold">{formatCOP(total)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Suggestions() {
  const { services, cart, addToCart, event } = useApp();
  const inCartCats = new Set(cart.map((i) => services.find((s) => s.id === i.serviceId)?.category));
  const missing = CATEGORIES.filter((c) => !inCartCats.has(c.id)).map((c) => c.id);
  const pool = services.filter((s) => !cart.some((i) => i.serviceId === s.id));
  const suggestions = [
    ...pool.filter((s) => missing.includes(s.category)),
    ...pool.filter((s) => !missing.includes(s.category)),
  ]
    .sort((a, b) => (b.city === event.city) - (a.city === event.city))
    .slice(0, 3);

  if (!suggestions.length) return null;
  return (
    <section className="mt-10">
      <h3 className="font-serif text-2xl font-semibold">El toque que falta</h3>
      <p className="mt-1 text-sm text-cream/60">Complementa tu evento con servicios que otros organizadores también reservaron.</p>
      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        {suggestions.map((s) => {
          const cat = getCategory(s.category);
          return (
            <div key={s.id} className="card overflow-hidden">
              <SmartImage src={s.image} alt={s.name} icon={cat.icon} className="h-28 w-full" />
              <div className="p-4">
                <p className="text-[11px] font-semibold uppercase tracking-widest text-gold">{cat.label}</p>
                <p className="mt-0.5 font-serif text-lg font-semibold leading-tight">{s.name}</p>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-sm font-bold">
                    {formatCOP(s.price, { suffix: false })} <span className="text-xs font-normal text-coal/50">{UNIT_LABEL[s.unit]}</span>
                  </span>
                  <button onClick={() => addToCart(s.id)} className="btn-gold px-3 py-1.5 text-xs">
                    <Plus className="h-3.5 w-3.5" /> Agregar
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export function OrderSummary({ children, showCoupon = true }) {
  const { totals, coupon, setCoupon, applyCoupon, cartItems } = useApp();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');

  const submitCoupon = (e) => {
    e.preventDefault();
    if (!code.trim()) return;
    if (applyCoupon(code)) {
      setCode('');
      setError('');
    } else setError('Cupón no válido. Prueba con BIENVENIDAHOMEPAGE');
  };

  return (
    <aside className="card h-fit p-6 lg:sticky lg:top-32">
      <h3 className="font-serif text-2xl font-semibold">Resumen</h3>
      <p className="text-xs text-coal/50">{cartItems.length} servicios en tu evento</p>

      <dl className="mt-5 space-y-3 text-sm">
        <div className="flex justify-between">
          <dt className="text-coal/70">Subtotal</dt>
          <dd className="font-semibold">{formatCOP(totals.subtotal)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="group relative flex items-center gap-1 text-coal/70">
            Tarifa de protección Planify ({PLATFORM_FEE_RATE * 100}%)
            <Info className="h-3.5 w-3.5 text-coal/40" />
            <span className="pointer-events-none absolute bottom-6 left-0 z-10 w-56 rounded-lg bg-coal p-2.5 text-xs text-cream opacity-0 shadow-lg transition group-hover:opacity-100">
              Tu dinero queda en custodia y solo se libera al proveedor cuando confirmas que cumplió con el servicio.
            </span>
          </dt>
          <dd className="font-semibold">{formatCOP(totals.fee)}</dd>
        </div>
        {coupon && (
          <div className="flex justify-between text-emerald-700">
            <dt className="flex items-center gap-1.5">
              <Tag className="h-3.5 w-3.5" /> {coupon} (−{COUPONS[coupon] * 100}%)
              <button onClick={() => setCoupon(null)} className="text-coal/40 hover:text-red-600" aria-label="Quitar cupón">
                <X className="h-3.5 w-3.5" />
              </button>
            </dt>
            <dd className="font-semibold">−{formatCOP(totals.discount)}</dd>
          </div>
        )}
      </dl>

      {showCoupon && !coupon && (
        <form onSubmit={submitCoupon} className="mt-4">
          <div className="flex gap-2">
            <input
              value={code}
              onChange={(e) => {
                setCode(e.target.value.toUpperCase());
                setError('');
              }}
              placeholder="Cupón de descuento"
              className={`input py-2 uppercase ${error ? 'input-error' : ''}`}
            />
            <button className="btn-outline shrink-0">Aplicar</button>
          </div>
          {error ? <p className="error-text">{error}</p> : <p className="mt-1 text-[11px] text-coal/40">Tip: usa BIENVENIDAHOMEPAGE</p>}
        </form>
      )}

      <div className="mt-5 flex items-end justify-between border-t border-coal/10 pt-4">
        <span className="text-sm font-semibold">Total</span>
        <span className="text-2xl font-bold">{formatCOP(totals.total)}</span>
      </div>

      {children}

      <p className="mt-4 flex items-start gap-2 text-xs text-coal/50">
        <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-600" />
        Pago en custodia: el proveedor recibe el dinero cuando confirmas el servicio. Si cancela o incumple, te devolvemos el 100%.
      </p>
    </aside>
  );
}

export default function Cart() {
  const { cartItems, setView, event, unavailableItems, budgetStatus } = useApp();

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <Stepper current={1} />
      <h1 className="mb-6 text-center font-serif text-4xl font-semibold">
        Tu gran día, <em className="text-gold-soft">en un carrito</em>
      </h1>
      <EventBanner />

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_380px]">
        <div>
          {cartItems.length ? (
            <div className="space-y-4">
              {cartItems.map((item) => (
                <CartItem key={item.serviceId} item={item} />
              ))}
            </div>
          ) : (
            <div className="card p-10 text-center">
              <ShoppingBag className="mx-auto h-10 w-10 text-gold" />
              <p className="mt-3 font-serif text-2xl">Tu carrito está vacío</p>
              <p className="mt-1 text-sm text-coal/60">Explora el marketplace y agrega los servicios para tu evento.</p>
              <button onClick={() => setView('explore')} className="btn-gold mt-5">
                Explorar servicios
              </button>
            </div>
          )}
          <Suggestions />
        </div>

        <OrderSummary>
          {budgetStatus.over && (
            <button onClick={() => setView('budget')} className="mt-4 flex w-full items-center gap-2 rounded-xl bg-red-50 p-3 text-left text-xs text-red-700">
              <Wallet className="h-4 w-4 shrink-0" />
              Superas tu presupuesto por {formatCOP(-budgetStatus.remaining)}. Ajustar selección
            </button>
          )}
          {unavailableItems.length > 0 && (
            <p className="mt-4 flex items-start gap-2 rounded-xl bg-red-50 p-3 text-xs text-red-700">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              {unavailableItems.map((i) => i.service.name).join(', ')} no tiene disponibilidad el {formatDate(event.date)}. Cambia la fecha o retíralo para poder reservar.
            </p>
          )}
          <button onClick={() => setView('checkout')} disabled={!cartItems.length || unavailableItems.length > 0} className="btn-gold mt-5 w-full py-3 text-base">
            Reservar {cartItems.length > 1 ? `${cartItems.length} servicios` : ''} y pagar
          </button>
        </OrderSummary>
      </div>
    </div>
  );
}
