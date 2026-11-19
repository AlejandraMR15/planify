import { useMemo, useState } from 'react';
import { AlertTriangle, CalendarClock, CalendarDays, Clock, MapPin, Plus, Sparkles, Trash2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatDate } from '../utils/format';
import { findConflicts, offsetFromStart, shiftTime, sortActivities } from '../utils/agenda';

const EMPTY_ACTIVITY = { title: '', time: '', duration: 60, serviceId: '' };

function ServiceTimeline({ activities }) {
  const { event, getService } = useApp();
  const { startTime } = event;

  const rows = useMemo(() => {
    const groups = new Map();
    activities.forEach((a) => {
      const key = a.serviceId || 'general';
      groups.set(key, [...(groups.get(key) || []), a]);
    });
    return [...groups].map(([key, list]) => ({ key, label: getService(key)?.name || 'General', list }));
  }, [activities]);

  const offsets = activities.map((a) => offsetFromStart(a.time, startTime));
  const from = Math.min(...offsets);
  const to = Math.max(...activities.map((a, i) => offsets[i] + a.duration));
  const span = Math.max(to - from, 60);
  const percent = (minutes) => ((minutes - from) / span) * 100;

  return (
    <section className="card p-6">
      <h2 className="font-serif text-2xl font-semibold">Tiempos por servicio</h2>
      <div className="mt-1 flex justify-between text-xs text-coal/50">
        <span>{shiftTime(startTime, from)}</span>
        <span>{shiftTime(startTime, to)}</span>
      </div>
      <div className="mt-3 space-y-3">
        {rows.map(({ key, label, list }) => (
          <div key={key}>
            <p className="mb-1 truncate text-xs font-semibold text-coal/70">{label}</p>
            <div className="relative h-5 rounded-md bg-cream-300/70">
              {list.map((a) => (
                <span
                  key={a.id}
                  title={`${a.time} · ${a.title}`}
                  className={`absolute inset-y-0 rounded-md ${a.done ? 'bg-gold-soft/50' : 'bg-gold'}`}
                  style={{ left: `${percent(offsetFromStart(a.time, startTime))}%`, width: `${Math.max((a.duration / span) * 100, 1.5)}%` }}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function ActivityRow({ activity, conflict }) {
  const { getService, updateActivity, removeActivity } = useApp();
  const service = getService(activity.serviceId);

  return (
    <li className={`flex flex-wrap items-center gap-3 rounded-xl border p-3 ${conflict ? 'border-red-300 bg-red-50' : 'border-coal/10'}`}>
      <input
        type="checkbox"
        checked={activity.done}
        onChange={(e) => updateActivity(activity.id, { done: e.target.checked })}
        aria-label={`Marcar ${activity.title} como lista`}
        className="h-4 w-4 accent-[#8C6633]"
      />
      <input
        type="time"
        value={activity.time}
        onChange={(e) => e.target.value && updateActivity(activity.id, { time: e.target.value })}
        aria-label={`Hora de ${activity.title}`}
        className="input w-[7.5rem] py-1.5"
      />
      <div className="min-w-[10rem] flex-1">
        <p className={`text-sm font-semibold leading-tight ${activity.done ? 'text-coal/40 line-through' : ''}`}>{activity.title}</p>
        <p className="text-xs text-coal/60">{service?.provider.name || 'General'}</p>
        {conflict && (
          <p className="mt-0.5 flex items-center gap-1 text-xs font-medium text-red-700">
            <AlertTriangle className="h-3.5 w-3.5" /> Se cruza con otra actividad de este proveedor
          </p>
        )}
      </div>
      <label className="flex items-center gap-1.5 text-xs text-coal/60">
        <input
          type="number"
          min={5}
          step={5}
          value={activity.duration}
          onChange={(e) => updateActivity(activity.id, { duration: Math.max(5, Number(e.target.value) || 5) })}
          aria-label={`Duración de ${activity.title} en minutos`}
          className="input w-20 py-1.5"
        />
        min
      </label>
      <button onClick={() => removeActivity(activity.id)} className="rounded-full p-2 text-coal/40 transition hover:bg-red-50 hover:text-red-600" aria-label={`Eliminar ${activity.title}`}>
        <Trash2 className="h-4 w-4" />
      </button>
    </li>
  );
}

function ActivityForm({ services }) {
  const { event, addActivity } = useApp();
  const [form, setForm] = useState({ ...EMPTY_ACTIVITY, time: event.startTime });
  const [error, setError] = useState('');

  const set = (k, v) => {
    setForm((f) => ({ ...f, [k]: v }));
    setError('');
  };

  const submit = (e) => {
    e.preventDefault();
    if (form.title.trim().length < 3) return setError('Dale un nombre a la actividad');
    if (!form.time) return setError('Indica la hora');
    addActivity({
      title: form.title.trim(),
      time: form.time,
      duration: Math.max(5, Number(form.duration) || 5),
      serviceId: form.serviceId || null,
    });
    setForm({ ...EMPTY_ACTIVITY, time: form.time });
  };

  return (
    <form onSubmit={submit} noValidate className="card grid gap-3 p-6 sm:grid-cols-2">
      <h2 className="font-serif text-2xl font-semibold sm:col-span-2">Nueva actividad</h2>
      <label className="sm:col-span-2">
        <span className="label">Actividad</span>
        <input className="input" value={form.title} onChange={(e) => set('title', e.target.value)} placeholder="Ej. Llegada de invitados" />
      </label>
      <label>
        <span className="label">Hora</span>
        <input type="time" className="input" value={form.time} onChange={(e) => set('time', e.target.value)} />
      </label>
      <label>
        <span className="label">Duración (min)</span>
        <input type="number" min={5} step={5} className="input" value={form.duration} onChange={(e) => set('duration', e.target.value)} />
      </label>
      <label className="sm:col-span-2">
        <span className="label">Servicio responsable</span>
        <select className="input" value={form.serviceId} onChange={(e) => set('serviceId', e.target.value)}>
          <option value="">General (sin proveedor)</option>
          {services.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
      </label>
      {error && <p className="error-text sm:col-span-2">{error}</p>}
      <button className="btn-gold sm:col-span-2">
        <Plus className="h-4 w-4" /> Agregar actividad
      </button>
    </form>
  );
}

export default function Agenda() {
  const { event, agenda, scheduledItems, changeStartTime, generateAgenda } = useApp();
  const activities = useMemo(() => sortActivities(agenda, event.startTime), [agenda, event.startTime]);
  const conflicts = useMemo(() => findConflicts(agenda, event.startTime), [agenda, event.startTime]);
  const services = useMemo(() => [...new Map(scheduledItems.map((i) => [i.service.id, i.service])).values()], [scheduledItems]);
  const doneCount = agenda.filter((a) => a.done).length;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <p className="mb-1 text-xs font-semibold uppercase tracking-[0.25em] text-gold-soft">Agenda y cronograma</p>
      <h1 className="font-serif text-4xl font-semibold">{event.name}</h1>
      <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-cream/70">
        <span className="inline-flex items-center gap-1.5"><CalendarDays className="h-4 w-4" /> {formatDate(event.date)}</span>
        <span className="inline-flex items-center gap-1.5"><MapPin className="h-4 w-4" /> {event.city}</span>
        <label className="inline-flex items-center gap-2">
          <Clock className="h-4 w-4" /> Inicio del evento
          <input
            type="time"
            value={event.startTime}
            onChange={(e) => e.target.value && changeStartTime(e.target.value)}
            className="rounded-lg border border-white/15 bg-ink-700 px-2 py-1 text-cream outline-none focus:border-gold-soft"
          />
        </label>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_380px]">
        <section className="card h-fit p-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-serif text-2xl font-semibold">Actividades</h2>
              <p className="text-xs text-coal/60">{doneCount} de {agenda.length} listas</p>
            </div>
            <button onClick={generateAgenda} disabled={!scheduledItems.length} className="btn-outline disabled:cursor-not-allowed disabled:opacity-50">
              <Sparkles className="h-4 w-4" /> Sugerir según mis servicios
            </button>
          </div>
          {conflicts.size > 0 && (
            <p className="mb-3 flex items-center gap-2 rounded-xl bg-red-50 p-3 text-xs font-medium text-red-700">
              <AlertTriangle className="h-4 w-4 shrink-0" /> Hay {conflicts.size} actividades con cruce de horario.
            </p>
          )}
          {activities.length ? (
            <ul className="space-y-2">
              {activities.map((a) => (
                <ActivityRow key={a.id} activity={a} conflict={conflicts.has(a.id)} />
              ))}
            </ul>
          ) : (
            <div className="py-10 text-center">
              <CalendarClock className="mx-auto h-10 w-10 text-gold" />
              <p className="mt-3 font-serif text-2xl">Tu agenda está vacía</p>
              <p className="mt-1 text-sm text-coal/60">Agrega una actividad o deja que la sugiramos según tus servicios.</p>
            </div>
          )}
        </section>

        <div className="space-y-6">
          {activities.length > 0 && <ServiceTimeline activities={activities} />}
          <ActivityForm services={services} />
        </div>
      </div>
    </div>
  );
}
