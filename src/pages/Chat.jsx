import { useEffect, useRef, useState } from 'react';
import { CalendarCheck2, MessageCircle, Send, ShoppingBag, Plus } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getCategory } from '../data/mockData';
import { formatCOP, formatDate, UNIT_LABEL, UNIT_QTY_LABEL } from '../utils/format';
import { AvailabilityBadge, SmartImage, Stars, VerifiedBadge } from '../components/ui';

const QUICK_REPLIES = ['¿Tienen disponibilidad para mi fecha?', '¿Qué incluye el servicio?', '¿Cuál es el precio final?'];

function ConversationList() {
  const { conversations, activeConvId, selectConversation, getService } = useApp();
  return (
    <aside className="flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-ink-800">
      <div className="border-b border-white/10 p-4">
        <h2 className="font-serif text-xl font-semibold">Conversaciones</h2>
        <p className="text-xs text-cream/50">{conversations.length} proveedores activos</p>
      </div>
      <ul className="flex-1 overflow-y-auto scrollbar-thin">
        {conversations.map((c) => {
          const s = getService(c.serviceId);
          const last = [...c.messages].reverse().find((m) => m.from !== 'system');
          const active = c.id === activeConvId;
          return (
            <li key={c.id}>
              <button
                onClick={() => selectConversation(c.id)}
                className={`flex w-full items-center gap-3 border-l-2 px-4 py-3 text-left transition ${
                  active ? 'border-gold bg-white/5' : 'border-transparent hover:bg-white/[0.03]'
                }`}
              >
                <SmartImage src={s.image} alt={s.name} icon={getCategory(s.category).icon} className="h-11 w-11 shrink-0 rounded-full" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-sm font-semibold text-cream">{s.provider.name}</p>
                    <span className="shrink-0 text-[10px] text-cream/40">{last?.time}</span>
                  </div>
                  <p className={`truncate text-xs ${c.unread ? 'font-semibold text-cream' : 'text-cream/50'}`}>
                    {last?.from === 'me' && 'Tú: '}
                    {last?.text}
                  </p>
                </div>
                {c.unread > 0 && (
                  <span className="flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-gold px-1.5 text-[10px] font-bold text-white">
                    {c.unread}
                  </span>
                )}
              </button>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}

function ChatPanel({ conv, service }) {
  const { sendMessage, typing } = useApp();
  const [text, setText] = useState('');
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conv.messages.length, typing[conv.id]]);

  const send = (msg) => {
    if (!msg.trim()) return;
    sendMessage(conv.id, msg);
    setText('');
  };

  return (
    <section className="card flex min-h-0 flex-col overflow-hidden">
      <header className="flex items-center gap-3 border-b border-coal/10 px-5 py-3">
        <SmartImage src={service.image} alt={service.name} icon={getCategory(service.category).icon} className="h-10 w-10 rounded-full" />
        <div className="min-w-0">
          <p className="truncate font-semibold">{service.provider.name}</p>
          <p className="flex items-center gap-1.5 text-xs text-emerald-700">
            <span className="h-2 w-2 rounded-full bg-emerald-500" /> En línea · responde en minutos
          </p>
        </div>
      </header>

      <div className="flex-1 space-y-3 overflow-y-auto bg-cream-200 p-5 scrollbar-thin">
        {conv.messages.map((m) =>
          m.from === 'system' ? (
            <div key={m.id} className="flex justify-center">
              <span className="badge-green px-3 py-1">
                <CalendarCheck2 className="h-3.5 w-3.5" /> {m.text}
              </span>
            </div>
          ) : (
            <div key={m.id} className={`flex ${m.from === 'me' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[78%] rounded-2xl px-4 py-2.5 text-sm shadow-sm ${
                  m.from === 'me' ? 'rounded-br-md bg-gold text-white' : 'rounded-bl-md bg-white text-coal'
                }`}
              >
                <p className="whitespace-pre-wrap">{m.text}</p>
                <p className={`mt-1 text-right text-[10px] ${m.from === 'me' ? 'text-white/70' : 'text-coal/40'}`}>{m.time}</p>
              </div>
            </div>
          )
        )}
        {typing[conv.id] && (
          <div className="flex justify-start">
            <div className="flex gap-1 rounded-2xl rounded-bl-md bg-white px-4 py-3 shadow-sm">
              {[0, 150, 300].map((d) => (
                <span key={d} className="h-2 w-2 animate-bounce rounded-full bg-coal/40" style={{ animationDelay: `${d}ms` }} />
              ))}
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      <div className="border-t border-coal/10 p-3">
        <div className="mb-2 flex gap-2 overflow-x-auto scrollbar-thin">
          {QUICK_REPLIES.map((q) => (
            <button key={q} onClick={() => send(q)} className="shrink-0 rounded-full border border-coal/15 px-3 py-1 text-xs text-coal/70 transition hover:border-gold hover:text-gold">
              {q}
            </button>
          ))}
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            send(text);
          }}
          className="flex gap-2"
        >
          <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Escribe un mensaje…" className="input rounded-full" />
          <button className="btn-gold shrink-0 px-4" disabled={!text.trim()} aria-label="Enviar">
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </section>
  );
}

function OfferPanel({ service }) {
  const { event, cart, addToCart, setView } = useApp();
  const inCart = cart.find((i) => i.serviceId === service.id);
  const qty = inCart?.qty ?? (service.unit === 'persona' ? event.guests : service.unit === 'hora' ? 4 : 1);

  return (
    <aside className="card hidden h-fit overflow-hidden xl:block">
      <SmartImage src={service.image} alt={service.name} icon={getCategory(service.category).icon} className="h-36 w-full" />
      <div className="p-5">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-gold">Oferta actual</p>
        <h3 className="mt-1 font-serif text-xl font-semibold leading-tight">{service.name}</h3>
        <div className="mt-2"><Stars rating={service.rating} reviews={service.reviews} size="h-3.5 w-3.5" /></div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          <VerifiedBadge verified={service.provider.verified} />
          <AvailabilityBadge service={service} date={event.date} />
        </div>
        <dl className="mt-4 space-y-2 text-sm">
          <div className="flex justify-between"><dt className="text-coal/60">Fecha</dt><dd className="font-medium">{formatDate(event.date)}</dd></div>
          <div className="flex justify-between"><dt className="text-coal/60">Ciudad</dt><dd className="font-medium">{event.city}</dd></div>
          <div className="flex justify-between"><dt className="text-coal/60">Tarifa</dt><dd className="font-medium">{formatCOP(service.price, { suffix: false })} {UNIT_LABEL[service.unit]}</dd></div>
          <div className="flex justify-between"><dt className="text-coal/60">Cantidad</dt><dd className="font-medium">{qty} {UNIT_QTY_LABEL[service.unit](qty)}</dd></div>
        </dl>
        <div className="mt-4 flex items-end justify-between border-t border-coal/10 pt-3">
          <span className="text-sm text-coal/60">Total estimado</span>
          <span className="text-xl font-bold">{formatCOP(service.price * qty)}</span>
        </div>
        {inCart ? (
          <button onClick={() => setView('cart')} className="btn-gold mt-4 w-full">
            <ShoppingBag className="h-4 w-4" /> Ver en mi carrito
          </button>
        ) : (
          <button onClick={() => addToCart(service.id)} className="btn-gold mt-4 w-full">
            <Plus className="h-4 w-4" /> Agregar a mi carrito
          </button>
        )}
      </div>
    </aside>
  );
}

export default function Chat() {
  const { conversations, activeConvId, getService, setView, selectConversation } = useApp();
  const conv = conversations.find((c) => c.id === activeConvId) || conversations[0];
  const service = conv && getService(conv.serviceId);

  // Al abrir la bandeja, la conversación activa queda leída
  useEffect(() => {
    if (conv && conv.unread) selectConversation(conv.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conv?.id]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="mb-6">
        <p className="mb-1 text-xs font-semibold uppercase tracking-[0.25em] text-gold-soft">Mensajes</p>
        <h1 className="font-serif text-4xl font-semibold">
          Los detalles <em className="text-gold-soft">se platican</em>
        </h1>
      </div>

      {conv ? (
        <div className="grid gap-4 md:h-[calc(100vh-14rem)] md:min-h-[520px] md:grid-cols-[280px_1fr] xl:grid-cols-[300px_1fr_300px]">
          <div className="max-h-64 md:max-h-none md:min-h-0"><ConversationList /></div>
          <div className="flex h-[70vh] min-h-0 flex-col md:h-auto"><ChatPanel conv={conv} service={service} /></div>
          <OfferPanel service={service} />
        </div>
      ) : (
        <div className="card mx-auto max-w-md p-10 text-center">
          <MessageCircle className="mx-auto h-10 w-10 text-gold" />
          <p className="mt-3 font-serif text-2xl">Aún no tienes conversaciones</p>
          <button onClick={() => setView('explore')} className="btn-gold mt-5">Explorar proveedores</button>
        </div>
      )}
    </div>
  );
}
