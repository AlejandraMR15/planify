import { useState } from 'react';
import {
  BadgeCheck, CalendarDays, Check, ChevronLeft, ChevronRight, ClipboardList, ImagePlus, Inbox, Landmark, MapPin, MessageSquareText, PlusCircle, Star, Store, Users, Wallet, X,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { CATEGORIES, CITIES, getCategory } from '../data/mockData';
import { formatCOP, formatDate, formatThousands, toDateKey, UNIT_LABEL } from '../utils/format';
import { BookingStatusBadge, EscrowBadge, SmartImage, Stars, VerifiedBadge } from '../components/ui';

const TABS = [
  { id: 'reservas', label: 'Reservas', icon: Inbox },
  { id: 'publicar', label: 'Publicar servicio', icon: PlusCircle },
  { id: 'calendario', label: 'Calendario', icon: CalendarDays },
  { id: 'servicios', label: 'Mis servicios', icon: Store },
  { id: 'resenas', label: 'Reseñas', icon: MessageSquareText },
];

function Stat({ icon: Icon, label, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-ink-800 p-5">
      <Icon className="h-5 w-5 text-gold-soft" />
      <p className="mt-3 text-2xl font-bold text-cream">{value}</p>
      <p className="text-xs text-cream/50">{label}</p>
    </div>
  );
}

// ---------- Reservas ----------
function Bookings() {
  const { providerBookings, getService, updateBookingStatus } = useApp();
  const [filter, setFilter] = useState('todas');
  const list = providerBookings.filter((b) => filter === 'todas' || b.status === filter);

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-2">
        {['todas', 'pendiente', 'confirmada', 'cumplida', 'rechazada'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium capitalize transition ${filter === f ? 'bg-gold text-white' : 'border border-white/15 text-cream/60 hover:text-cream'}`}
          >
            {f === 'todas' ? 'Todas' : `${f}s`}
          </button>
        ))}
      </div>
      <div className="space-y-3">
        {list.map((b) => {
          const s = getService(b.serviceId);
          return (
            <div key={b.id} className="card flex flex-col gap-4 p-5 md:flex-row md:items-center">
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-serif text-xl font-semibold">{b.client}</p>
                  <BookingStatusBadge status={b.status} />
                  <EscrowBadge escrow={b.escrow} />
                </div>
                <p className="mt-0.5 text-sm text-coal/60">{b.eventType} · {s?.name}</p>
                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-coal/70">
                  <span className="inline-flex items-center gap-1"><CalendarDays className="h-3.5 w-3.5" /> {formatDate(b.date)}</span>
                  <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {b.city}</span>
                  <span className="inline-flex items-center gap-1"><Users className="h-3.5 w-3.5" /> {b.guests} invitados</span>
                </div>
                {b.note && <p className="mt-2 rounded-lg bg-cream-300 px-3 py-2 text-xs italic text-coal/70">“{b.note}”</p>}
              </div>
              <div className="flex items-center gap-3 md:flex-col md:items-end">
                <p className="text-lg font-bold">{formatCOP(b.amount)}</p>
                {b.status === 'pendiente' && (
                  <div className="flex gap-2">
                    <button onClick={() => updateBookingStatus(b.id, 'rechazada')} className="btn-outline px-3 py-1.5 text-xs">
                      <X className="h-3.5 w-3.5" /> Rechazar
                    </button>
                    <button onClick={() => updateBookingStatus(b.id, 'confirmada')} className="btn-gold px-3 py-1.5 text-xs">
                      <Check className="h-3.5 w-3.5" /> Aceptar
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
        {!list.length && <p className="py-10 text-center text-sm text-cream/50">No hay reservas en esta categoría.</p>}
      </div>
    </div>
  );
}

// ---------- Publicar ----------
const EMPTY_SERVICE = { name: '', category: '', price: '', unit: 'evento', city: 'Bogotá', description: '' };

function PublishForm({ onDone }) {
  const { publishService } = useApp();
  const [form, setForm] = useState(EMPTY_SERVICE);
  const [photos, setPhotos] = useState([]);
  const [errors, setErrors] = useState({});

  const set = (k, v) => {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => ({ ...e, [k]: undefined }));
  };

  const onFiles = (e) => {
    const files = Array.from(e.target.files || []).slice(0, 5 - photos.length);
    setPhotos((p) => [...p, ...files.map((f) => URL.createObjectURL(f))]);
    setErrors((er) => ({ ...er, photos: undefined }));
    e.target.value = '';
  };

  const submit = (e) => {
    e.preventDefault();
    const er = {};
    if (form.name.trim().length < 4) er.name = 'Ponle un nombre atractivo a tu servicio';
    if (!form.category) er.category = 'Selecciona una categoría';
    if (!Number(form.price) || Number(form.price) < 10000) er.price = 'Precio mínimo $10.000 COP';
    if (form.description.trim().length < 20) er.description = 'Describe tu servicio (mín. 20 caracteres)';
    if (!photos.length) er.photos = 'Sube al menos una foto';
    setErrors(er);
    if (Object.keys(er).length) return;

    publishService({ ...form, price: Number(form.price), image: photos[0], gallery: photos });
    setForm(EMPTY_SERVICE);
    setPhotos([]);
    onDone();
  };

  return (
    <form onSubmit={submit} noValidate className="card grid gap-5 p-6 md:grid-cols-2">
      <div className="md:col-span-2">
        <h2 className="font-serif text-2xl font-semibold">Publica un nuevo servicio</h2>
        <p className="text-sm text-coal/60">Aparecerá en el marketplace al instante (verificación en 24 h).</p>
      </div>
      <label className="md:col-span-2">
        <span className="label">Nombre del servicio</span>
        <input className={`input ${errors.name ? 'input-error' : ''}`} value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="Ej. Saxofonista para cóctel y ceremonia" />
        {errors.name && <p className="error-text">{errors.name}</p>}
      </label>
      <label>
        <span className="label">Categoría</span>
        <select className={`input ${errors.category ? 'input-error' : ''}`} value={form.category} onChange={(e) => set('category', e.target.value)}>
          <option value="">Selecciona…</option>
          {CATEGORIES.map((c) => (
            <option key={c.id} value={c.id}>{c.label}</option>
          ))}
        </select>
        {errors.category && <p className="error-text">{errors.category}</p>}
      </label>
      <label>
        <span className="label">Ciudad</span>
        <select className="input" value={form.city} onChange={(e) => set('city', e.target.value)}>
          {CITIES.map((c) => <option key={c}>{c}</option>)}
        </select>
      </label>
      <label>
        <span className="label">Precio (COP)</span>
        <div className="relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-coal/50">$</span>
          <input
            className={`input pl-7 ${errors.price ? 'input-error' : ''}`}
            inputMode="numeric"
            value={formatThousands(form.price)}
            onChange={(e) => set('price', e.target.value.replace(/\D/g, '').slice(0, 10))}
            placeholder="1.500.000"
          />
        </div>
        {errors.price && <p className="error-text">{errors.price}</p>}
      </label>
      <label>
        <span className="label">Modalidad de cobro</span>
        <select className="input" value={form.unit} onChange={(e) => set('unit', e.target.value)}>
          <option value="evento">Por evento</option>
          <option value="hora">Por hora</option>
          <option value="persona">Por persona</option>
        </select>
      </label>
      <label className="md:col-span-2">
        <span className="label">Descripción</span>
        <textarea rows={4} className={`input resize-none ${errors.description ? 'input-error' : ''}`} value={form.description} onChange={(e) => set('description', e.target.value)} placeholder="Cuéntales a los organizadores qué hace especial tu servicio, qué incluye y tu experiencia…" />
        {errors.description && <p className="error-text">{errors.description}</p>}
      </label>
      <div className="md:col-span-2">
        <span className="label">Fotos ({photos.length}/5)</span>
        <div className="flex flex-wrap gap-3">
          {photos.map((p, i) => (
            <div key={p} className="group relative h-24 w-24 overflow-hidden rounded-xl">
              <img src={p} alt="" className="h-full w-full object-cover" />
              {i === 0 && <span className="absolute bottom-1 left-1 rounded bg-gold px-1.5 text-[10px] font-bold text-white">Portada</span>}
              <button type="button" onClick={() => setPhotos((ph) => ph.filter((x) => x !== p))} className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white opacity-0 transition group-hover:opacity-100">
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
          {photos.length < 5 && (
            <label className={`flex h-24 w-24 cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed text-xs text-coal/50 transition hover:border-gold hover:text-gold ${errors.photos ? 'border-red-400' : 'border-coal/20'}`}>
              <ImagePlus className="h-6 w-6" />
              Subir
              <input type="file" accept="image/*" multiple onChange={onFiles} className="hidden" />
            </label>
          )}
        </div>
        {errors.photos && <p className="error-text">{errors.photos}</p>}
      </div>
      <div className="flex justify-end md:col-span-2">
        <button className="btn-gold px-8 py-3">
          <PlusCircle className="h-4 w-4" /> Publicar servicio
        </button>
      </div>
    </form>
  );
}

// ---------- Calendario ----------
const WEEKDAYS = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá', 'Do'];

function AvailabilityCalendar() {
  const { availability, cycleAvailability, setManyAvailability, providerBookings } = useApp();
  const [cursor, setCursor] = useState(() => {
    const d = new Date();
    return { y: d.getFullYear(), m: d.getMonth() };
  });
  const { y, m } = cursor;
  const offset = (new Date(y, m, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(y, m + 1, 0).getDate();
  const todayKey = (() => {
    const d = new Date();
    return toDateKey(d.getFullYear(), d.getMonth(), d.getDate());
  })();
  const bookedDates = new Set(providerBookings.filter((b) => b.status !== 'rechazada').map((b) => b.date));
  const monthLabel = new Date(y, m, 1).toLocaleDateString('es-CO', { month: 'long', year: 'numeric' });

  const move = (delta) => {
    const d = new Date(y, m + delta, 1);
    setCursor({ y: d.getFullYear(), m: d.getMonth() });
  };

  const weekendKeys = Array.from({ length: daysInMonth }, (_, i) => i + 1)
    .filter((d) => [5, 6].includes((new Date(y, m, d).getDay() + 6) % 7))
    .map((d) => toDateKey(y, m, d))
    .filter((k) => availability[k] !== 'ocupado');

  const monthKeys = Object.keys(availability).filter((k) => k.startsWith(`${y}-${String(m + 1).padStart(2, '0')}`));
  const freeCount = monthKeys.filter((k) => availability[k] === 'disponible').length;
  const busyCount = monthKeys.filter((k) => availability[k] === 'ocupado').length;

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
      <div className="card p-6">
        <div className="mb-5 flex items-center justify-between">
          <button onClick={() => move(-1)} className="rounded-full p-2 hover:bg-cream-300" aria-label="Mes anterior"><ChevronLeft className="h-5 w-5" /></button>
          <h2 className="font-serif text-2xl font-semibold capitalize">{monthLabel}</h2>
          <button onClick={() => move(1)} className="rounded-full p-2 hover:bg-cream-300" aria-label="Mes siguiente"><ChevronRight className="h-5 w-5" /></button>
        </div>
        <div className="grid grid-cols-7 gap-1.5 text-center sm:gap-2">
          {WEEKDAYS.map((d) => (
            <span key={d} className="pb-1 text-[11px] font-semibold uppercase tracking-wider text-coal/40">{d}</span>
          ))}
          {Array.from({ length: offset }).map((_, i) => <span key={`e${i}`} />)}
          {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((d) => {
            const key = toDateKey(y, m, d);
            const status = availability[key];
            return (
              <button
                key={key}
                onClick={() => cycleAvailability(key)}
                className={`relative flex aspect-square items-center justify-center rounded-xl text-sm font-semibold transition ${
                  status === 'disponible'
                    ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                    : status === 'ocupado'
                    ? 'bg-coal text-cream hover:bg-coal/85'
                    : 'bg-cream-300/60 text-coal/70 hover:bg-cream-400'
                } ${key === todayKey ? 'ring-2 ring-gold' : ''}`}
                title={status ? status : 'Sin marcar'}
              >
                {d}
                {bookedDates.has(key) && <span className="absolute bottom-1.5 h-1.5 w-1.5 rounded-full bg-gold" />}
              </button>
            );
          })}
        </div>
        <p className="mt-4 text-xs text-coal/50">Haz clic en un día para alternar: sin marcar → Disponible → Ocupado.</p>
      </div>

      <div className="space-y-4">
        <div className="card p-5">
          <h3 className="label">Leyenda</h3>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2"><span className="h-4 w-4 rounded bg-emerald-100 ring-1 ring-emerald-300" /> Disponible</li>
            <li className="flex items-center gap-2"><span className="h-4 w-4 rounded bg-coal" /> Ocupado</li>
            <li className="flex items-center gap-2"><span className="h-4 w-4 rounded bg-cream-300" /> Sin marcar</li>
            <li className="flex items-center gap-2"><span className="ml-1 h-2 w-2 rounded-full bg-gold" /> <span className="ml-1">Tiene reserva</span></li>
          </ul>
        </div>
        <div className="card p-5">
          <h3 className="label">Este mes</h3>
          <p className="text-sm"><span className="font-bold text-emerald-700">{freeCount}</span> días disponibles</p>
          <p className="text-sm"><span className="font-bold">{busyCount}</span> días ocupados</p>
          <button onClick={() => setManyAvailability(weekendKeys, 'disponible')} className="btn-outline mt-4 w-full text-xs">
            Marcar fines de semana disponibles
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------- Mis servicios ----------
function MyServices() {
  const { services, setDetailId } = useApp();
  const mine = services.filter((s) => s.ownerId === 'me');
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {mine.map((s) => {
        const cat = getCategory(s.category);
        return (
          <div key={s.id} className="card overflow-hidden">
            <SmartImage src={s.image} alt={s.name} icon={cat.icon} className="h-36 w-full" />
            <div className="p-5">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-gold">{cat.label}</p>
              <p className="font-serif text-lg font-semibold leading-tight">{s.name}</p>
              <div className="mt-2"><VerifiedBadge verified={s.provider.verified} /></div>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-sm font-bold">{formatCOP(s.price)} <span className="text-xs font-normal text-coal/50">{UNIT_LABEL[s.unit]}</span></span>
                <button onClick={() => setDetailId(s.id)} className="text-xs font-semibold text-gold hover:underline">Vista previa</button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ---------- Reseñas ----------
function ProviderReviews({ mine }) {
  const { reviews, getService } = useApp();
  const list = reviews.filter((r) => mine.some((s) => s.id === r.serviceId));

  if (!list.length) return <p className="py-10 text-center text-sm text-cream/50">Aún no tienes reseñas.</p>;
  return (
    <div className="grid gap-3 md:grid-cols-2">
      {list.map((r) => (
        <div key={r.id} className="card p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="font-serif text-lg font-semibold">{r.author}</p>
            <Stars rating={r.rating} size="h-3.5 w-3.5" />
          </div>
          <p className="text-xs text-coal/50">{getService(r.serviceId)?.name} · {formatDate(r.date)}</p>
          <p className="mt-2 text-sm text-coal/80">{r.comment}</p>
          <span className="badge-green mt-3"><BadgeCheck className="h-3.5 w-3.5" /> Reserva verificada</span>
        </div>
      ))}
    </div>
  );
}

export default function ProviderDashboard() {
  const { user, providerBookings, services } = useApp();
  const [tab, setTab] = useState('reservas');
  const pending = providerBookings.filter((b) => b.status === 'pendiente').length;
  const confirmed = providerBookings.filter((b) => b.status === 'confirmada');
  const sumEscrow = (escrow) => providerBookings.filter((b) => b.escrow === escrow).reduce((sum, b) => sum + b.amount, 0);
  const mine = services.filter((s) => s.ownerId === 'me');
  const reviewCount = mine.reduce((sum, s) => sum + s.reviews, 0);
  const avgRating = reviewCount ? mine.reduce((sum, s) => sum + s.rating * s.reviews, 0) / reviewCount : 0;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <p className="mb-1 text-xs font-semibold uppercase tracking-[0.25em] text-gold-soft">Panel del proveedor</p>
      <h1 className="font-serif text-4xl font-semibold">Hola, {user?.name?.split(' ')[0] || 'Lente Dorado'} 👋</h1>
      <p className="mt-1 text-sm text-cream/60">Gestiona tus reservas, publica servicios y mantén tu agenda al día.</p>

      <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-5">
        <Stat icon={ClipboardList} label="Reservas pendientes" value={pending} />
        <Stat icon={Check} label="Reservas confirmadas" value={confirmed.length} />
        <Stat icon={Landmark} label="En custodia" value={formatCOP(sumEscrow('retenido'), { suffix: false })} />
        <Stat icon={Wallet} label="Liberado a tu cuenta" value={formatCOP(sumEscrow('liberado'), { suffix: false })} />
        <Stat icon={Star} label={`${mine.length} servicios publicados`} value={reviewCount ? avgRating.toFixed(1).replace('.', ',') : '—'} />
      </div>

      <div className="mt-8 flex gap-2 overflow-x-auto border-b border-white/10 scrollbar-thin">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`-mb-px inline-flex shrink-0 items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition ${
              tab === id ? 'border-gold-soft text-cream' : 'border-transparent text-cream/50 hover:text-cream'
            }`}
          >
            <Icon className="h-4 w-4" /> {label}
            {id === 'reservas' && pending > 0 && <span className="rounded-full bg-gold px-1.5 text-[10px] font-bold text-white">{pending}</span>}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {tab === 'reservas' && <Bookings />}
        {tab === 'publicar' && <PublishForm onDone={() => setTab('servicios')} />}
        {tab === 'calendario' && <AvailabilityCalendar />}
        {tab === 'servicios' && <MyServices />}
        {tab === 'resenas' && <ProviderReviews mine={mine} />}
      </div>
    </div>
  );
}
