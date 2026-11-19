import { useEffect, useState } from 'react';
import { BadgeCheck, Check, Clock, MapPin, MessageCircle, ShoppingBag, Users } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getCategory, PROVIDER_CHECKS } from '../data/mockData';
import { formatCOP, formatDate, UNIT_LABEL } from '../utils/format';
import { AvailabilityBadge, Modal, SmartImage, Stars, VerifiedBadge } from './ui';

function ProviderProfile({ service }) {
  const { services, setDetailId } = useApp();
  const others = services.filter((s) => s.provider.name === service.provider.name && s.id !== service.id);

  return (
    <section>
      <h3 className="label">Perfil del proveedor</h3>
      <p className="font-serif text-xl font-semibold">{service.provider.name}</p>
      {service.provider.verified ? (
        <ul className="mt-2 space-y-1.5">
          {PROVIDER_CHECKS.map((c) => (
            <li key={c} className="flex items-center gap-2 text-sm text-coal/80">
              <BadgeCheck className="h-4 w-4 text-emerald-600" /> {c}
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-2 flex items-center gap-2 text-sm text-coal/70">
          <Clock className="h-4 w-4 text-amber-600" /> Documentos en revisión por Planify
        </p>
      )}
      {others.map((s) => (
        <button key={s.id} onClick={() => setDetailId(s.id)} className="mt-2 block text-sm font-semibold text-gold hover:underline">
          También ofrece: {s.name}
        </button>
      ))}
    </section>
  );
}

function ReviewList({ service }) {
  const { reviews } = useApp();
  const list = reviews.filter((r) => r.serviceId === service.id);

  return (
    <section>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="label mb-0">Opiniones de clientes</h3>
        <Stars rating={service.rating} reviews={service.reviews} size="h-3.5 w-3.5" />
      </div>
      <p className="mt-1 text-xs text-coal/50">Solo opinan clientes con una reserva pagada y cumplida en Planify.</p>
      {list.length ? (
        <ul className="mt-3 space-y-3">
          {list.map((r) => (
            <li key={r.id} className="rounded-xl bg-cream-300/60 p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1.5 text-sm font-semibold">
                  {r.author} <span className="badge-green">Reserva verificada</span>
                </span>
                <Stars rating={r.rating} size="h-3 w-3" />
              </div>
              <p className="mt-1.5 text-sm text-coal/80">{r.comment}</p>
              <p className="mt-1 text-[11px] text-coal/40">{formatDate(r.date)}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-sm text-coal/60">Este servicio todavía no tiene reseñas.</p>
      )}
    </section>
  );
}

export default function ServiceDetailModal() {
  const { detailId, setDetailId, getService, event, addToCart, openChat, setView } = useApp();
  const [photo, setPhoto] = useState(0);
  useEffect(() => setPhoto(0), [detailId]);
  const service = detailId ? getService(detailId) : null;
  if (!service) return null;
  const cat = getCategory(service.category);
  const gallery = service.gallery?.length ? service.gallery : [service.image];

  return (
    <Modal open onClose={() => setDetailId(null)} className="max-w-3xl">
      <div className="grid md:grid-cols-2">
        <div className="flex flex-col gap-2 p-3 md:p-4">
          <SmartImage src={gallery[photo] || gallery[0]} alt={service.name} icon={cat.icon} className="h-64 w-full rounded-xl md:h-80" />
          {gallery.length > 1 && (
            <div className="flex gap-2">
              {gallery.map((src, i) => (
                <button
                  key={src}
                  onClick={() => setPhoto(i)}
                  className={`overflow-hidden rounded-lg ring-2 transition ${i === photo ? 'ring-gold' : 'ring-transparent hover:ring-gold-soft'}`}
                  aria-label={`Ver foto ${i + 1}`}
                >
                  <SmartImage src={src} alt="" icon={cat.icon} className="h-14 w-20" />
                </button>
              ))}
            </div>
          )}
          <div className="mt-3 px-1"><ProviderProfile service={service} /></div>
        </div>
        <div className="p-7">
          <p className="text-xs font-semibold uppercase tracking-widest text-gold">{cat.label}</p>
          <h2 className="mt-1 font-serif text-3xl font-semibold leading-tight">{service.name}</h2>
          <p className="mt-1 text-sm text-coal/60">por {service.provider.name}</p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Stars rating={service.rating} reviews={service.reviews} />
            <span className="inline-flex items-center gap-1 text-xs text-coal/60">
              <MapPin className="h-3.5 w-3.5" /> {service.city}
            </span>
            {service.capacity && (
              <span className="inline-flex items-center gap-1 text-xs text-coal/60">
                <Users className="h-3.5 w-3.5" /> Hasta {service.capacity}
              </span>
            )}
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5">
            <VerifiedBadge verified={service.provider.verified} />
            <AvailabilityBadge service={service} date={event.date} />
          </div>
          <p className="mt-4 text-sm leading-relaxed text-coal/80">{service.description}</p>
          <ul className="mt-4 space-y-1.5">
            {service.includes.map((inc) => (
              <li key={inc} className="flex items-center gap-2 text-sm">
                <Check className="h-4 w-4 text-emerald-600" /> {inc}
              </li>
            ))}
          </ul>
          <div className="mt-5 rounded-xl bg-cream-300 p-4">
            <p className="text-2xl font-bold">{formatCOP(service.price)}</p>
            <p className="text-xs text-coal/60">{UNIT_LABEL[service.unit]}</p>
          </div>
          <div className="mt-5 flex gap-2">
            <button onClick={() => openChat(service.id)} className="btn-outline flex-1">
              <MessageCircle className="h-4 w-4" /> Chatear
            </button>
            <button
              onClick={() => {
                addToCart(service.id);
                setDetailId(null);
                setView('cart');
              }}
              className="btn-gold flex-1"
            >
              <ShoppingBag className="h-4 w-4" /> Agregar al carrito
            </button>
          </div>
        </div>
      </div>
      <div className="border-t border-coal/10 p-7">
        <ReviewList service={service} />
      </div>
    </Modal>
  );
}
