import { MapPin, MessageCircle, Plus, Check } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getCategory } from '../data/mockData';
import { formatCOP, UNIT_LABEL } from '../utils/format';
import { AvailabilityBadge, SmartImage, Stars, VerifiedBadge } from './ui';

export default function ServiceCard({ service }) {
  const { event, cart, addToCart, openChat, setDetailId } = useApp();
  const cat = getCategory(service.category);
  const inCart = cart.some((i) => i.serviceId === service.id);

  return (
    <article className="card group flex flex-col overflow-hidden transition hover:-translate-y-1">
      <div className="relative h-48 overflow-hidden">
        <SmartImage src={service.image} alt={service.name} icon={cat.icon} className="h-full w-full transition duration-500 group-hover:scale-105" />
        <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-ink/80 px-3 py-1 text-xs font-medium text-cream backdrop-blur">
          <cat.icon className="h-3.5 w-3.5 text-gold-soft" /> {cat.label}
        </span>
        {service.isNew && (
          <span className="absolute right-3 top-3 rounded-full bg-gold px-2.5 py-1 text-[11px] font-bold uppercase text-white">Nuevo</span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="mb-2 flex items-center justify-between gap-2">
          <Stars rating={service.rating} reviews={service.reviews} size="h-3.5 w-3.5" />
          <span className="inline-flex items-center gap-1 text-xs text-coal/60">
            <MapPin className="h-3.5 w-3.5" /> {service.city}
          </span>
        </div>
        <h3 className="font-serif text-xl font-semibold leading-snug">{service.name}</h3>
        <p className="mt-1 text-sm text-coal/60">{service.provider.name}</p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          <VerifiedBadge verified={service.provider.verified} />
          <AvailabilityBadge service={service} date={event.date} />
        </div>

        <div className="mt-4 flex items-end justify-between border-t border-coal/10 pt-4">
          <div>
            <p className="text-lg font-bold text-coal">{formatCOP(service.price)}</p>
            <p className="text-xs text-coal/50">
              {UNIT_LABEL[service.unit]}
              {service.unit === 'persona' && ` · ≈ ${formatCOP(service.price * event.guests, { suffix: false })} para ${event.guests}`}
            </p>
          </div>
        </div>

        <div className="mt-4 flex gap-2">
          <button onClick={() => setDetailId(service.id)} className="btn-outline flex-1 px-3">
            Ver detalle
          </button>
          <button onClick={() => openChat(service.id)} className="btn-outline px-3" title="Chatear con el proveedor" aria-label="Chatear">
            <MessageCircle className="h-4 w-4" />
          </button>
          <button onClick={() => addToCart(service.id)} className="btn-gold px-3" title="Agregar al carrito" aria-label="Agregar al carrito">
            {inCart ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          </button>
        </div>
      </div>
    </article>
  );
}
