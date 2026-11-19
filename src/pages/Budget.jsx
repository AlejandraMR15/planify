import { useMemo } from 'react';
import { AlertTriangle, ArrowRightLeft, Check, Plus, ShoppingBag, Users } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { CATEGORIES } from '../data/mockData';
import { formatCOP, formatThousands, UNIT_LABEL, UNIT_QTY_LABEL } from '../utils/format';
import { QtyStepper, SmartImage, Stars } from '../components/ui';

function ServiceRow({ service, item, cost, icon }) {
  const { event, addToCart, removeFromCart, updateQty } = useApp();
  const busy = service.busyDates?.includes(event.date);
  const selected = Boolean(item);

  return (
    <li className={`flex flex-col gap-3 rounded-xl border p-3 transition sm:flex-row sm:items-center ${selected ? 'border-gold bg-gold/5' : 'border-coal/10'}`}>
      <button
        onClick={() => (selected ? removeFromCart(service.id) : addToCart(service.id))}
        disabled={busy && !selected}
        aria-pressed={selected}
        aria-label={`${selected ? 'Quitar' : 'Agregar'} ${service.name}`}
        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border transition disabled:cursor-not-allowed disabled:opacity-30 ${
          selected ? 'border-gold bg-gold text-white' : 'border-coal/25 text-coal/50 hover:border-gold hover:text-gold'
        }`}
      >
        {selected ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
      </button>
      <SmartImage src={service.image} alt={service.name} icon={icon} className="hidden h-14 w-14 shrink-0 rounded-lg sm:block" />
      <div className="min-w-0 flex-1">
        <p className="font-semibold leading-tight">{service.name}</p>
        <p className="text-xs text-coal/60">{service.city} · {formatCOP(service.price, { suffix: false })} {UNIT_LABEL[service.unit]}</p>
        <div className="mt-1"><Stars rating={service.rating} reviews={service.reviews} size="h-3 w-3" /></div>
        {busy && !selected && <span className="badge-red mt-1">Fecha no disponible</span>}
      </div>
      <div className="flex items-center justify-between gap-3 sm:justify-end">
        {selected && service.unit !== 'evento' && (
          <span className="flex items-center gap-2">
            <QtyStepper value={item.qty} onChange={(v) => updateQty(service.id, v)} />
            <span className="text-xs text-coal/60">{UNIT_QTY_LABEL[service.unit](item.qty)}</span>
          </span>
        )}
        <span className="w-28 text-right text-sm font-bold">{formatCOP(cost, { suffix: false })}</span>
      </div>
    </li>
  );
}

function CategoryBlock({ category, options }) {
  const { cartItems, defaultQty } = useApp();
  const inCategory = cartItems.filter((i) => i.service.category === category.id);
  const subtotal = inCategory.reduce((sum, i) => sum + i.total, 0);

  return (
    <section className="card p-5">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 font-serif text-xl font-semibold">
          <category.icon className="h-5 w-5 text-gold" /> {category.label}
        </h2>
        <span className={`text-sm font-bold ${subtotal ? '' : 'text-coal/40'}`}>{formatCOP(subtotal, { suffix: false })}</span>
      </div>
      {options.length ? (
        <ul className="space-y-2">
          {options.map((s) => {
            const item = inCategory.find((i) => i.serviceId === s.id);
            return <ServiceRow key={s.id} service={s} item={item} cost={item ? item.total : s.price * defaultQty(s)} icon={category.icon} />;
          })}
        </ul>
      ) : (
        <p className="text-sm text-coal/60">No hay opciones para este tipo de evento e invitados.</p>
      )}
    </section>
  );
}

function BudgetPanel({ savings }) {
  const { event, setEvent, budget, setBudget, budgetStatus, totals, cartItems, swapCartItem, setView } = useApp();
  const { committed, used, remaining, over, pct } = budgetStatus;
  const barColor = over ? 'bg-red-500' : pct >= 85 ? 'bg-amber-500' : 'bg-emerald-500';

  return (
    <aside className="card order-first h-fit p-6 lg:sticky lg:top-32 lg:order-none">
      <h2 className="font-serif text-2xl font-semibold">Tu presupuesto</h2>

      <div className="mt-4 grid grid-cols-[1fr_6rem] gap-3">
        <label>
          <span className="label">Límite (COP)</span>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-coal/50">$</span>
            <input
              className="input pl-7"
              inputMode="numeric"
              value={formatThousands(budget)}
              onChange={(e) => setBudget(Number(e.target.value.replace(/\D/g, '').slice(0, 11)))}
            />
          </div>
        </label>
        <label>
          <span className="label flex items-center gap-1"><Users className="h-3 w-3" /> Invitados</span>
          <input
            type="number"
            min={1}
            className="input"
            value={event.guests}
            onChange={(e) => setEvent((ev) => ({ ...ev, guests: Math.max(1, Number(e.target.value) || 1) }))}
          />
        </label>
      </div>

      <div className="mt-5">
        <div className="mb-1 flex justify-between text-xs text-coal/60">
          <span>{pct}% usado</span>
          <span className={`font-semibold ${over ? 'text-red-600' : 'text-emerald-700'}`}>
            {over ? `Te pasas por ${formatCOP(-remaining, { suffix: false })}` : `Disponible ${formatCOP(remaining, { suffix: false })}`}
          </span>
        </div>
        <div
          role="progressbar"
          aria-label="Presupuesto usado"
          aria-valuenow={Math.min(pct, 100)}
          aria-valuemin={0}
          aria-valuemax={100}
          className="h-2.5 overflow-hidden rounded-full bg-cream-300"
        >
          <div className={`h-full transition-all duration-300 ${barColor}`} style={{ width: `${Math.min(pct, 100)}%` }} />
        </div>
      </div>

      <dl className="mt-5 space-y-2 text-sm">
        {committed > 0 && (
          <div className="flex justify-between"><dt className="text-coal/70">Ya reservado</dt><dd className="font-semibold">{formatCOP(committed)}</dd></div>
        )}
        <div className="flex justify-between"><dt className="text-coal/70">Servicios seleccionados</dt><dd className="font-semibold">{formatCOP(totals.subtotal)}</dd></div>
        <div className="flex justify-between"><dt className="text-coal/70">Tarifa de protección</dt><dd className="font-semibold">{formatCOP(totals.fee)}</dd></div>
        {totals.discount > 0 && (
          <div className="flex justify-between text-emerald-700"><dt>Descuento</dt><dd className="font-semibold">−{formatCOP(totals.discount)}</dd></div>
        )}
      </dl>
      <div className="mt-4 flex items-end justify-between border-t border-coal/10 pt-3">
        <span className="text-sm font-semibold">Costo total</span>
        <span className="text-2xl font-bold">{formatCOP(used)}</span>
      </div>

      {over && (
        <div className="mt-4 rounded-xl bg-red-50 p-3">
          <p className="flex items-center gap-2 text-xs font-semibold text-red-700">
            <AlertTriangle className="h-4 w-4" /> {savings.length ? 'Opciones para ahorrar' : 'Quita un servicio o reduce invitados para ajustarte'}
          </p>
          {savings.length > 0 && (
            <ul className="mt-2 space-y-2">
              {savings.map(({ from, to, saving }) => (
                <li key={from.id} className="rounded-lg bg-white p-2.5 text-xs">
                  <p className="text-coal/70">{from.name} → <span className="font-semibold text-coal">{to.name}</span></p>
                  <div className="mt-1 flex items-center justify-between">
                    <span className="font-semibold text-emerald-700">Ahorras {formatCOP(saving, { suffix: false })}</span>
                    <button onClick={() => swapCartItem(from.id, to.id)} className="inline-flex items-center gap-1 font-semibold text-gold hover:underline">
                      <ArrowRightLeft className="h-3.5 w-3.5" /> Cambiar
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <button onClick={() => setView('cart')} disabled={!cartItems.length} className="btn-gold mt-5 w-full py-3">
        <ShoppingBag className="h-4 w-4" /> Reservar selección
      </button>
    </aside>
  );
}

export default function Budget() {
  const { services, event, cartItems, defaultQty } = useApp();

  const optionsByCategory = useMemo(() => {
    const inCart = (s) => cartItems.some((i) => i.serviceId === s.id);
    const fits = (s) => s.eventTypes.includes(event.type) && !(s.capacity && s.capacity < event.guests);
    return CATEGORIES.map((category) => ({
      category,
      options: services
        .filter((s) => s.category === category.id && (inCart(s) || fits(s)))
        .sort((a, b) => inCart(b) - inCart(a) || (b.city === event.city) - (a.city === event.city) || a.price - b.price),
    }));
  }, [services, cartItems, event.type, event.guests, event.city]);

  // La alternativa más barata y disponible de cada categoría que ya está en el carrito
  const savings = useMemo(
    () =>
      cartItems
        .map(({ service: from, total }) => {
          const candidates = optionsByCategory
            .find((c) => c.category.id === from.category)
            .options.filter((s) => s.id !== from.id && !cartItems.some((i) => i.serviceId === s.id) && !s.busyDates?.includes(event.date))
            .map((to) => ({ from, to, saving: total - to.price * defaultQty(to) }))
            .sort((a, b) => b.saving - a.saving);
          return candidates[0];
        })
        .filter((s) => s && s.saving > 0)
        .sort((a, b) => b.saving - a.saving)
        .slice(0, 3),
    [cartItems, optionsByCategory, event.date, event.guests]
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <p className="mb-1 text-xs font-semibold uppercase tracking-[0.25em] text-gold-soft">{event.name}</p>
      <h1 className="font-serif text-4xl font-semibold">
        Cotiza tu evento <em className="text-gold-soft">sin pasarte</em>
      </h1>
      <p className="mt-2 text-sm text-cream/60">Marca servicios y ajusta cantidades: el costo total se actualiza al instante.</p>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          {optionsByCategory.map(({ category, options }) => (
            <CategoryBlock key={category.id} category={category} options={options} />
          ))}
        </div>
        <BudgetPanel savings={savings} />
      </div>
    </div>
  );
}
