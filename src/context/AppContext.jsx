import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import {
  SERVICES,
  INITIAL_EVENT,
  INITIAL_CART,
  INITIAL_CONVERSATIONS,
  INITIAL_BOOKINGS,
  INITIAL_ORDERS,
  INITIAL_REVIEWS,
  INITIAL_AVAILABILITY,
  INITIAL_BUDGET,
  EVENT_TYPES,
} from '../data/mockData';
import { buildActivities, minutesBetween, shiftTime } from '../utils/agenda';
import { buildReply } from '../utils/chatBot';
import { nowTime, uid } from '../utils/format';

const AppContext = createContext(null);

export const COUPONS = { BIENVENIDAHOMEPAGE: 0.1, PLANIFY5: 0.05 };
export const PLATFORM_FEE_RATE = 0.04;

// Vistas que puede abrir cada rol; la primera es su inicio
export const ROLE_VIEWS = {
  cliente: ['explore', 'budget', 'cart', 'checkout', 'confirmation', 'reservations', 'agenda', 'chat'],
  proveedor: ['provider'],
};

export function AppProvider({ children }) {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState('cliente');
  const [view, setView] = useState('explore');
  const [authModal, setAuthModal] = useState(null); // null | 'login' | 'register'
  const [detailId, setDetailId] = useState(null);
  const [toasts, setToasts] = useState([]);

  const [services, setServices] = useState(SERVICES);
  const [search, setSearch] = useState({ query: '', category: 'todas' });
  const [event, setEvent] = useState(INITIAL_EVENT);
  const [cart, setCart] = useState(INITIAL_CART);
  const [coupon, setCoupon] = useState(null);
  const [order, setOrder] = useState(null);
  const [orders, setOrders] = useState(INITIAL_ORDERS);
  const [budget, setBudget] = useState(INITIAL_BUDGET);
  const [agenda, setAgenda] = useState(() =>
    buildActivities(
      INITIAL_CART.map((i) => ({ ...i, service: SERVICES.find((s) => s.id === i.serviceId) })),
      INITIAL_EVENT.startTime
    )
  );

  const [conversations, setConversations] = useState(INITIAL_CONVERSATIONS);
  const [activeConvId, setActiveConvId] = useState(INITIAL_CONVERSATIONS[0].id);
  const [typing, setTyping] = useState({});

  const [bookings, setBookings] = useState(INITIAL_BOOKINGS);
  const [availability, setAvailability] = useState(INITIAL_AVAILABILITY);
  const [reviews, setReviews] = useState(INITIAL_REVIEWS);

  // Referencia actualizada para saber si un chat está abierto cuando llega una respuesta.
  const activeRef = useRef({ view, activeConvId });
  useEffect(() => {
    activeRef.current = { view, activeConvId };
  }, [view, activeConvId]);

  // Los servicios por persona siguen el número de invitados del evento
  useEffect(() => {
    setCart((c) => c.map((i) => (services.find((s) => s.id === i.serviceId)?.unit === 'persona' ? { ...i, qty: event.guests } : i)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [event.guests]);

  // ---------- Utilidades ----------
  const toast = (message, type = 'success') => {
    const id = uid('t');
    setToasts((t) => [...t, { id, message, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 2800);
  };

  const getService = (id) => services.find((s) => s.id === id);

  const defaultQty = (service) => {
    if (service.unit === 'persona') return event.guests;
    if (service.unit === 'hora') return 4;
    return 1;
  };

  // ---------- Auth / roles ----------
  const login = (data) => {
    const newUser = { id: uid('u'), ...data };
    setUser(newUser);
    setRole(newUser.role);
    setView(newUser.role === 'proveedor' ? 'provider' : 'explore');
    setAuthModal(null);
    toast(`¡Bienvenido/a, ${newUser.name.split(' ')[0]}!`);
  };

  const logout = () => {
    setUser(null);
    setRole('cliente');
    setView('explore');
    toast('Sesión cerrada', 'info');
  };

  const switchRole = (r) => {
    setRole(r);
    setView(r === 'proveedor' ? 'provider' : 'explore');
  };

  // ---------- Carrito ----------
  const addToCart = (serviceId) => {
    const service = getService(serviceId);
    if (cart.some((i) => i.serviceId === serviceId)) {
      toast(`${service.name} ya está en tu carrito`, 'info');
      return;
    }
    setCart((c) => [...c, { serviceId, qty: defaultQty(service) }]);
    toast(`${service.name} agregado al carrito`);
  };

  const updateQty = (serviceId, qty) => {
    const value = Math.max(1, Math.min(2000, Number(qty) || 1));
    setCart((c) => c.map((i) => (i.serviceId === serviceId ? { ...i, qty: value } : i)));
  };

  const removeFromCart = (serviceId) => {
    setCart((c) => c.filter((i) => i.serviceId !== serviceId));
    toast('Servicio eliminado del carrito', 'info');
  };

  const swapCartItem = (serviceId, nextId) => {
    const next = getService(nextId);
    setCart((c) => c.map((i) => (i.serviceId === serviceId ? { serviceId: nextId, qty: defaultQty(next) } : i)));
    toast(`Cambiado por ${next.name}`);
  };

  const cartItems = useMemo(
    () =>
      cart
        .map((i) => {
          const service = services.find((s) => s.id === i.serviceId);
          return service ? { ...i, service, total: service.price * i.qty } : null;
        })
        .filter(Boolean),
    [cart, services]
  );

  const totals = useMemo(() => {
    const subtotal = cartItems.reduce((sum, i) => sum + i.total, 0);
    const fee = Math.round(subtotal * PLATFORM_FEE_RATE);
    const discount = coupon ? Math.round(subtotal * COUPONS[coupon]) : 0;
    return { subtotal, fee, discount, total: subtotal + fee - discount };
  }, [cartItems, coupon]);

  const unavailableItems = cartItems.filter((i) => i.service.busyDates?.includes(event.date));

  const clientBookings = useMemo(() => bookings.filter((b) => b.orderId), [bookings]);
  const providerBookings = useMemo(
    () => bookings.filter((b) => services.find((s) => s.id === b.serviceId)?.ownerId === 'me'),
    [bookings, services]
  );

  // Lo ya pagado para este evento sigue contando contra el presupuesto aunque el carrito quede vacío
  const budgetStatus = useMemo(() => {
    const committed = clientBookings
      .filter((b) => b.date === event.date && b.escrow !== 'reembolsado')
      .reduce((sum, b) => sum + b.paid, 0);
    const used = committed + totals.total;
    return { committed, used, remaining: budget - used, over: used > budget, pct: budget ? Math.round((used / budget) * 100) : 0 };
  }, [clientBookings, event.date, totals.total, budget]);

  const applyCoupon = (code) => {
    const c = code.trim().toUpperCase();
    if (COUPONS[c]) {
      setCoupon(c);
      toast(`Cupón ${c} aplicado: ${COUPONS[c] * 100}% de descuento`);
      return true;
    }
    return false;
  };

  // ---------- Pago ----------
  const completePayment = (details) => {
    const newOrder = {
      id: `PLN-${Math.floor(100000 + Math.random() * 900000)}`,
      items: cartItems,
      totals,
      event: { ...event, startTime: details.startTime },
      details,
      coupon,
      createdAt: new Date().toLocaleString('es-CO'),
    };
    const eventLabel = EVENT_TYPES.find((t) => t.id === event.type)?.label || 'Evento';
    let unassigned = totals.total;
    const newBookings = cartItems.map((i, idx) => {
      // Reparte el total pagado (con tarifa y cupón) para poder reembolsar cada servicio por separado
      const paid = idx === cartItems.length - 1 ? unassigned : Math.round((i.total * totals.total) / totals.subtotal);
      unassigned -= paid;
      return {
        id: uid('b'),
        orderId: newOrder.id,
        client: user?.name || 'Cliente Planify',
        eventType: eventLabel,
        date: event.date,
        city: event.city,
        serviceId: i.serviceId,
        qty: i.qty,
        guests: event.guests,
        amount: i.total,
        paid,
        // Solo el proveedor demo tiene panel; los demás aceptan automáticamente en el prototipo
        status: i.service.ownerId === 'me' ? 'pendiente' : 'confirmada',
        escrow: 'retenido',
        note: `Reserva ${newOrder.id} · ${details.address}`,
      };
    });
    setBookings((b) => [...newBookings, ...b]);
    setServices((list) =>
      list.map((s) => (cart.some((i) => i.serviceId === s.id) ? { ...s, busyDates: [...(s.busyDates || []), event.date] } : s))
    );
    changeStartTime(details.startTime);
    setOrders((o) => [newOrder, ...o]);
    setOrder(newOrder);
    setCart([]);
    setCoupon(null);
    setView('confirmation');
  };

  // ---------- Custodia y reseñas ----------
  const patchBooking = (id, patch) => setBookings((bs) => bs.map((b) => (b.id === id ? { ...b, ...patch } : b)));

  const confirmFulfillment = (id) => {
    patchBooking(id, { status: 'cumplida', escrow: 'liberado' });
    toast('Pago liberado al proveedor');
  };

  const reportIssue = (id) => {
    patchBooking(id, { status: 'incumplida', escrow: 'reembolsado' });
    toast('Incumplimiento reportado: te devolvimos el pago', 'info');
  };

  const addReview = (bookingId, { rating, comment }) => {
    const booking = bookings.find((b) => b.id === bookingId);
    const count = getService(booking.serviceId).reviews;
    setReviews((r) => [
      {
        id: uid('r'),
        serviceId: booking.serviceId,
        author: booking.client,
        rating,
        comment: comment.trim(),
        date: new Date().toISOString().slice(0, 10),
      },
      ...r,
    ]);
    setServices((list) =>
      list.map((s) =>
        s.id === booking.serviceId ? { ...s, rating: (s.rating * count + rating) / (count + 1), reviews: count + 1 } : s
      )
    );
    patchBooking(bookingId, { reviewed: true });
    toast('¡Gracias! Tu reseña ya es pública');
  };

  // ---------- Agenda ----------
  const addActivity = (data) => setAgenda((a) => [...a, { id: uid('a'), done: false, ...data }]);

  const updateActivity = (id, patch) => setAgenda((a) => a.map((x) => (x.id === id ? { ...x, ...patch } : x)));

  const removeActivity = (id) => setAgenda((a) => a.filter((x) => x.id !== id));

  // Mover la hora de inicio arrastra todo el cronograma
  const changeStartTime = (time) => {
    const delta = minutesBetween(event.startTime, time);
    setEvent((e) => ({ ...e, startTime: time }));
    setAgenda((a) => a.map((x) => ({ ...x, time: shiftTime(x.time, delta) })));
  };

  const scheduledItems = useMemo(() => {
    const booked = clientBookings
      .filter((b) => b.date === event.date && b.escrow !== 'reembolsado')
      .map((b) => ({ service: services.find((s) => s.id === b.serviceId), qty: b.qty }));
    return [...booked, ...cartItems];
  }, [clientBookings, event.date, cartItems, services]);

  const generateAgenda = () => {
    const missing = buildActivities(scheduledItems, event.startTime).filter(
      (n) => !agenda.some((a) => a.serviceId === n.serviceId && a.title === n.title)
    );
    setAgenda((a) => [...a, ...missing]);
    toast(missing.length ? `${missing.length} actividades agregadas` : 'Tu cronograma ya incluye todos los servicios', missing.length ? 'success' : 'info');
  };

  // ---------- Chat ----------
  const unreadCount = conversations.reduce((sum, c) => sum + c.unread, 0);

  const markRead = (convId) =>
    setConversations((cs) => cs.map((c) => (c.id === convId ? { ...c, unread: 0 } : c)));

  const selectConversation = (convId) => {
    setActiveConvId(convId);
    markRead(convId);
  };

  const openChat = (serviceId) => {
    const existing = conversations.find((c) => c.serviceId === serviceId);
    let convId = existing?.id;
    if (!existing) {
      const service = getService(serviceId);
      convId = uid('c');
      setConversations((cs) => [
        {
          id: convId,
          serviceId,
          unread: 0,
          messages: [
            {
              id: uid('m'),
              from: 'them',
              text: `¡Hola! Soy de ${service.provider.name}. Cuéntanos sobre tu evento y con gusto te ayudamos 😊`,
              time: nowTime(),
            },
          ],
        },
        ...cs,
      ]);
    }
    setActiveConvId(convId);
    markRead(convId);
    setDetailId(null);
    setView('chat');
  };

  const sendMessage = (convId, text) => {
    const conv = conversations.find((c) => c.id === convId);
    if (!conv || !text.trim()) return;
    const service = getService(conv.serviceId);
    const { reply, system } = buildReply(text, service, event);

    setConversations((cs) =>
      cs.map((c) =>
        c.id === convId
          ? { ...c, messages: [...c.messages, { id: uid('m'), from: 'me', text: text.trim(), time: nowTime() }] }
          : c
      )
    );
    setTyping((t) => ({ ...t, [convId]: true }));

    setTimeout(() => {
      setTyping((t) => ({ ...t, [convId]: false }));
      const isOpen = activeRef.current.view === 'chat' && activeRef.current.activeConvId === convId;
      setConversations((cs) =>
        cs.map((c) => {
          if (c.id !== convId) return c;
          const incoming = [{ id: uid('m'), from: 'them', text: reply, time: nowTime() }];
          if (system) incoming.push({ id: uid('m'), from: 'system', text: system });
          return { ...c, unread: isOpen ? 0 : c.unread + 1, messages: [...c.messages, ...incoming] };
        })
      );
    }, 1500);
  };

  // ---------- Proveedor ----------
  const publishService = (data) => {
    const service = {
      id: uid('s'),
      ownerId: 'me',
      provider: { name: user?.name || 'Mi negocio', verified: false },
      rating: 0,
      reviews: 0,
      includes: ['Servicio personalizado'],
      eventTypes: ['boda', 'cumpleanos', 'empresarial'],
      busyDates: [],
      isNew: true,
      ...data,
    };
    setServices((s) => [service, ...s]);
    toast('¡Servicio publicado! Ya aparece en el marketplace');
    return service;
  };

  const updateBookingStatus = (id, status) => {
    const booking = bookings.find((b) => b.id === id);
    if (status === 'rechazada') {
      patchBooking(id, { status, escrow: 'reembolsado' });
      setServices((list) =>
        list.map((s) => (s.id === booking.serviceId ? { ...s, busyDates: s.busyDates.filter((d) => d !== booking.date) } : s))
      );
      toast('Reserva rechazada: el pago se devolvió al cliente', 'info');
      return;
    }
    patchBooking(id, { status });
    setAvailability((a) => ({ ...a, [booking.date]: 'ocupado' }));
    toast('Reserva confirmada');
  };

  const cycleAvailability = (dateKey) => {
    setAvailability((a) => {
      const next = { ...a };
      if (!a[dateKey]) next[dateKey] = 'disponible';
      else if (a[dateKey] === 'disponible') next[dateKey] = 'ocupado';
      else delete next[dateKey];
      return next;
    });
  };

  const setManyAvailability = (keys, status) => {
    setAvailability((a) => {
      const next = { ...a };
      keys.forEach((k) => (next[k] = status));
      return next;
    });
  };

  const value = {
    user, role, view, setView, authModal, setAuthModal, detailId, setDetailId, toasts, toast,
    login, logout, switchRole,
    services, getService, search, setSearch, event, setEvent, defaultQty,
    cart, cartItems, cartCount: cart.length, addToCart, updateQty, removeFromCart, swapCartItem, totals, coupon, setCoupon, applyCoupon,
    unavailableItems, budget, setBudget, budgetStatus,
    order, orders, completePayment, clientBookings, providerBookings, confirmFulfillment, reportIssue,
    reviews, addReview,
    agenda, scheduledItems, addActivity, updateActivity, removeActivity, changeStartTime, generateAgenda,
    conversations, activeConvId, selectConversation, openChat, sendMessage, typing, unreadCount,
    bookings, updateBookingStatus, availability, cycleAvailability, setManyAvailability, publishService,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp debe usarse dentro de <AppProvider>');
  return ctx;
}
