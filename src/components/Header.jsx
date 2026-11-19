import { useEffect, useRef, useState } from 'react';
import {
  Briefcase,
  CalendarClock,
  ChevronDown,
  Compass,
  LayoutDashboard,
  LogOut,
  MessageCircle,
  PartyPopper,
  ReceiptText,
  Search,
  ShoppingBag,
  Wallet,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { CATEGORIES } from '../data/mockData';
import { formatCOP, initials } from '../utils/format';

function NavItem({ icon: Icon, label, active, badge = 0, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`relative inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium transition ${
        active ? 'bg-white/10 text-cream' : 'text-cream/70 hover:bg-white/5 hover:text-cream'
      }`}
    >
      <span className="relative">
        <Icon className="h-5 w-5" />
        {badge > 0 && (
          <span className="absolute -right-2.5 -top-2 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-gold px-1 text-[10px] font-bold text-white">
            {badge}
          </span>
        )}
      </span>
      <span className="hidden xl:inline">{label}</span>
    </button>
  );
}

function RoleSwitch() {
  const { role, switchRole } = useApp();
  const opts = [
    { id: 'cliente', label: 'Cliente', icon: PartyPopper },
    { id: 'proveedor', label: 'Proveedor', icon: Briefcase },
  ];
  return (
    <div className="flex rounded-full border border-white/10 bg-white/5 p-1" title="Cambia de rol para probar la app">
      {opts.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          onClick={() => switchRole(id)}
          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition ${
            role === id ? 'bg-gold text-white shadow' : 'text-cream/60 hover:text-cream'
          }`}
        >
          <Icon className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">{label}</span>
        </button>
      ))}
    </div>
  );
}

function SearchBar({ className = '' }) {
  const { search, setSearch, setView } = useApp();
  const [query, setQuery] = useState(search.query);
  const [category, setCategory] = useState(search.category);

  useEffect(() => {
    setQuery(search.query);
    setCategory(search.category);
  }, [search]);

  const submit = (e) => {
    e.preventDefault();
    setSearch({ query, category });
    setView('explore');
  };

  return (
    <form onSubmit={submit} className={`flex items-center rounded-full border border-white/10 bg-white/5 pl-2 ${className}`}>
      <select
        value={category}
        onChange={(e) => {
          setCategory(e.target.value);
          setSearch({ query, category: e.target.value });
          setView('explore');
        }}
        className="max-w-[9.5rem] cursor-pointer truncate rounded-full bg-transparent py-2 pl-2 pr-1 text-xs font-medium text-cream/80 outline-none [&>option]:text-coal"
      >
        <option value="todas">Todas las categorías</option>
        {CATEGORIES.map((c) => (
          <option key={c.id} value={c.id}>
            {c.label}
          </option>
        ))}
      </select>
      <span className="h-5 w-px bg-white/15" />
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Busca mariachis, fincas, fotógrafos…"
        className="min-w-0 flex-1 bg-transparent px-3 py-2 text-sm text-cream outline-none placeholder:text-cream/40"
      />
      <button type="submit" className="m-1 rounded-full bg-gold p-2 text-white transition hover:bg-gold-light" aria-label="Buscar">
        <Search className="h-4 w-4" />
      </button>
    </form>
  );
}

function ProfileMenu() {
  const { user, role, logout, setView } = useApp();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const onClick = (e) => ref.current && !ref.current.contains(e.target) && setOpen(false);
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen((o) => !o)} className="flex items-center gap-2 rounded-full p-1 pr-2 transition hover:bg-white/5">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-gold-soft to-gold text-sm font-bold text-white">
          {initials(user.name)}
        </span>
        <span className="hidden text-left leading-tight lg:block">
          <span className="block text-sm font-semibold text-cream">{user.name.split(' ')[0]}</span>
          <span className="block text-[11px] capitalize text-cream/50">{role}</span>
        </span>
        <ChevronDown className="h-4 w-4 text-cream/50" />
      </button>
      {open && (
        <div className="card absolute right-0 top-12 w-64 overflow-hidden p-2 animate-slide-up">
          <div className="border-b border-coal/10 px-3 pb-3 pt-2">
            <p className="font-serif text-lg font-semibold">{user.name}</p>
            <p className="text-xs text-coal/60">{user.email}</p>
            <span className="badge-green mt-2 capitalize">{user.role === 'proveedor' ? 'Proveedor / Talento' : 'Organizador'}</span>
          </div>
          <button
            onClick={() => { setView(role === 'proveedor' ? 'provider' : 'cart'); setOpen(false); }}
            className="mt-1 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-cream-300"
          >
            <LayoutDashboard className="h-4 w-4 text-gold" />
            {role === 'proveedor' ? 'Mi panel de proveedor' : 'Mi evento'}
          </button>
          {role === 'cliente' && (
            <button
              onClick={() => { setView('chat'); setOpen(false); }}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-cream-300"
            >
              <MessageCircle className="h-4 w-4 text-gold" /> Mensajes
            </button>
          )}
          <button
            onClick={() => { logout(); setOpen(false); }}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50"
          >
            <LogOut className="h-4 w-4" /> Cerrar sesión
          </button>
        </div>
      )}
    </div>
  );
}

const EVENT_TABS = [
  { id: 'budget', label: 'Presupuesto', icon: Wallet },
  { id: 'reservations', label: 'Mis reservas', icon: ReceiptText },
  { id: 'agenda', label: 'Agenda', icon: CalendarClock },
];

function EventBar() {
  const { view, setView, budget, budgetStatus } = useApp();
  return (
    <div className="border-t border-white/10">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-1.5 sm:px-6">
        <nav className="flex gap-1 overflow-x-auto scrollbar-thin">
          {EVENT_TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setView(id)}
              className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition ${
                view === id ? 'bg-white/10 text-cream' : 'text-cream/60 hover:text-cream'
              }`}
            >
              <Icon className="h-3.5 w-3.5" /> {label}
            </button>
          ))}
        </nav>
        <button onClick={() => setView('budget')} className="ml-auto hidden items-center gap-3 text-xs text-cream/60 hover:text-cream sm:flex">
          <span className={budgetStatus.over ? 'font-semibold text-red-400' : ''}>
            {formatCOP(budgetStatus.used, { suffix: false })} de {formatCOP(budget, { suffix: false })}
          </span>
          <span className="h-1.5 w-24 overflow-hidden rounded-full bg-white/10">
            <span className={`block h-full ${budgetStatus.over ? 'bg-red-400' : 'bg-gold-soft'}`} style={{ width: `${Math.min(budgetStatus.pct, 100)}%` }} />
          </span>
        </button>
      </div>
    </div>
  );
}

export default function Header() {
  const { user, role, view, setView, cartCount, unreadCount, setAuthModal } = useApp();
  const isClient = role === 'cliente';

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-ink/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-3 gap-y-2 px-4 py-3 sm:px-6 md:flex-nowrap">
        <button onClick={() => setView(isClient ? 'explore' : 'provider')} className="flex shrink-0 items-baseline gap-1">
          <span className="font-serif text-2xl font-semibold tracking-tight text-cream sm:text-[1.7rem]">Planify</span>
          <span className="h-1.5 w-1.5 rounded-full bg-gold-soft" />
        </button>

        {isClient && <SearchBar className="mx-2 hidden max-w-md flex-1 md:flex" />}

        <div className="ml-auto flex items-center gap-1 sm:gap-2">
          {/* Sin sesión se puede probar cualquier rol; con sesión, el rol lo define la cuenta */}
          {!user && <RoleSwitch />}
          <nav className="flex items-center">
            {isClient ? (
              <>
                <NavItem icon={Compass} label="Explorar" active={view === 'explore'} onClick={() => setView('explore')} />
                <NavItem icon={MessageCircle} label="Mensajes" badge={unreadCount} active={view === 'chat'} onClick={() => setView('chat')} />
                <NavItem
                  icon={ShoppingBag}
                  label="Carrito"
                  badge={cartCount}
                  active={['cart', 'checkout', 'confirmation'].includes(view)}
                  onClick={() => setView('cart')}
                />
              </>
            ) : (
              <NavItem icon={LayoutDashboard} label="Mi panel" active={view === 'provider'} onClick={() => setView('provider')} />
            )}
          </nav>
          {user ? (
            <ProfileMenu />
          ) : (
            <div className="flex items-center gap-1">
              <button onClick={() => setAuthModal('login')} className="hidden rounded-full px-3 py-2 text-sm font-medium text-cream/80 hover:text-cream sm:block">
                Iniciar sesión
              </button>
              <button onClick={() => setAuthModal('register')} className="btn-gold px-4 py-2">
                Registrarse
              </button>
            </div>
          )}
        </div>
      </div>
      {isClient && (
        <>
          <div className="px-4 pb-3 md:hidden">
            <SearchBar className="flex" />
          </div>
          <EventBar />
        </>
      )}
    </header>
  );
}
