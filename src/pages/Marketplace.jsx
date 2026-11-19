import { useMemo, useState } from 'react';
import { BadgeCheck, CalendarDays, MapPin, SearchX, Sparkles, Users } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { CATEGORIES, CITIES, EVENT_TYPES } from '../data/mockData';
import ServiceCard from '../components/ServiceCard';

export default function Marketplace() {
  const { services, search, setSearch, event, setEvent } = useApp();
  const [city, setCity] = useState('todas');
  const [sort, setSort] = useState('relevancia');
  const [verifiedOnly, setVerifiedOnly] = useState(false);

  const filtered = useMemo(() => {
    const q = search.query.trim().toLowerCase();
    let list = services.filter((s) => {
      if (search.category !== 'todas' && s.category !== search.category) return false;
      if (city !== 'todas' && s.city !== city) return false;
      if (verifiedOnly && !s.provider.verified) return false;
      if (!s.eventTypes.includes(event.type)) return false;
      if (s.capacity && s.capacity < event.guests) return false;
      if (q && !`${s.name} ${s.provider.name} ${s.description} ${s.city}`.toLowerCase().includes(q)) return false;
      return true;
    });
    if (sort === 'precio') list = [...list].sort((a, b) => a.price - b.price);
    if (sort === 'rating') list = [...list].sort((a, b) => b.rating - a.rating);
    return list;
  }, [services, search, city, event.type, event.guests, sort, verifiedOnly]);

  const updateEvent = (k, v) => setEvent((e) => ({ ...e, [k]: v }));

  return (
    <div>
      {/* Banner / filtros */}
      <section className="relative overflow-hidden border-b border-white/10">
        <div className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-gold/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-40 -left-20 h-96 w-96 rounded-full bg-gold-soft/10 blur-3xl" />
        <div className="relative mx-auto max-w-7xl px-4 pb-12 pt-12 sm:px-6 sm:pt-16">
          <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-gold-soft/30 px-3 py-1 text-xs font-medium text-gold-soft">
            <Sparkles className="h-3.5 w-3.5" /> +1.200 proveedores verificados en Colombia
          </p>
          <h1 className="max-w-3xl font-serif text-4xl font-semibold leading-tight sm:text-6xl">
            Todo tu evento, <em className="text-gold-soft">en un solo lugar.</em>
          </h1>
          <p className="mt-4 max-w-xl text-cream/60">
            Música, catering, fotografía, locaciones, decoración e iluminación. Compara, ajusta tu presupuesto y reserva todo en una sola transacción con pago en custodia.
          </p>

          <div className="card mt-8 grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1fr_0.8fr]">
            <div>
              <span className="label">Tipo de evento</span>
              <div className="grid grid-cols-3 gap-1 rounded-xl bg-cream-300 p-1">
                {EVENT_TYPES.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => updateEvent('type', t.id)}
                    className={`rounded-lg py-2 text-xs font-semibold transition sm:text-sm ${
                      event.type === t.id ? 'bg-gold text-white shadow' : 'text-coal/60 hover:text-coal'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
            <label className="block">
              <span className="label flex items-center gap-1"><CalendarDays className="h-3.5 w-3.5" /> Fecha deseada</span>
              <input type="date" value={event.date} onChange={(e) => updateEvent('date', e.target.value)} className="input" />
            </label>
            <label className="block">
              <span className="label flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> Ciudad</span>
              <select
                value={city}
                onChange={(e) => {
                  setCity(e.target.value);
                  if (e.target.value !== 'todas') updateEvent('city', e.target.value);
                }}
                className="input"
              >
                <option value="todas">Todas las ciudades</option>
                {CITIES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="label flex items-center gap-1"><Users className="h-3.5 w-3.5" /> Invitados</span>
              <input
                type="number"
                min={1}
                value={event.guests}
                onChange={(e) => updateEvent('guests', Math.max(1, Number(e.target.value) || 1))}
                className="input"
              />
            </label>
          </div>
        </div>
      </section>

      {/* Categorías + resultados */}
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
            {[{ id: 'todas', label: 'Todo', icon: Sparkles }, ...CATEGORIES].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setSearch((s) => ({ ...s, category: id }))}
                className={`inline-flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition ${
                  search.category === id
                    ? 'border-gold bg-gold text-white'
                    : 'border-white/15 text-cream/70 hover:border-gold-soft hover:text-cream'
                }`}
              >
                <Icon className="h-4 w-4" /> {label}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-3 text-sm text-cream/60">
            <span>{filtered.length} servicios</span>
            <button
              onClick={() => setVerifiedOnly((v) => !v)}
              aria-pressed={verifiedOnly}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-2 transition ${
                verifiedOnly ? 'border-gold bg-gold text-white' : 'border-white/15 text-cream/70 hover:border-gold-soft hover:text-cream'
              }`}
            >
              <BadgeCheck className="h-4 w-4" /> Solo verificados
            </button>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="rounded-full border border-white/15 bg-ink-700 px-3 py-2 text-sm text-cream outline-none"
            >
              <option value="relevancia">Más relevantes</option>
              <option value="rating">Mejor calificados</option>
              <option value="precio">Menor precio</option>
            </select>
          </div>
        </div>

        {search.query && (
          <p className="mb-4 text-sm text-cream/60">
            Resultados para “<span className="text-cream">{search.query}</span>” ·{' '}
            <button onClick={() => setSearch((s) => ({ ...s, query: '' }))} className="text-gold-soft underline">
              limpiar búsqueda
            </button>
          </p>
        )}

        {filtered.length ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((s) => (
              <ServiceCard key={s.id} service={s} />
            ))}
          </div>
        ) : (
          <div className="card mx-auto max-w-md p-10 text-center">
            <SearchX className="mx-auto h-10 w-10 text-gold" />
            <p className="mt-3 font-serif text-2xl">Sin resultados</p>
            <p className="mt-1 text-sm text-coal/60">Prueba otra categoría, ciudad o tipo de evento.</p>
            <button
              onClick={() => {
                setSearch({ query: '', category: 'todas' });
                setCity('todas');
              }}
              className="btn-gold mt-5"
            >
              Ver todos los servicios
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
