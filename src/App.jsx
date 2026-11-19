import { useEffect } from 'react';
import { useApp } from './context/AppContext';
import Header from './components/Header';
import AuthModal from './components/AuthModal';
import ServiceDetailModal from './components/ServiceDetailModal';
import Toasts from './components/Toasts';
import Marketplace from './pages/Marketplace';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Confirmation from './pages/Confirmation';
import Chat from './pages/Chat';
import ProviderDashboard from './pages/ProviderDashboard';
import Budget from './pages/Budget';
import Reservations from './pages/Reservations';
import Agenda from './pages/Agenda';

const VIEWS = {
  explore: Marketplace,
  cart: Cart,
  checkout: Checkout,
  confirmation: Confirmation,
  chat: Chat,
  provider: ProviderDashboard,
  budget: Budget,
  reservations: Reservations,
  agenda: Agenda,
};

export default function App() {
  const { view } = useApp();
  const View = VIEWS[view] || Marketplace;

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [view]);

  return (
    <div className="flex min-h-screen flex-col bg-ink">
      <Header />
      <main className="flex-1">
        <View />
      </main>
      <footer className="border-t border-white/10 py-8 text-center text-xs text-cream/40">
        <span className="font-serif text-base text-cream/70">Planify</span> · Marketplace de eventos hecho en Colombia 🇨🇴 · Prototipo
        interactivo
      </footer>
      <AuthModal />
      <ServiceDetailModal />
      <Toasts />
    </div>
  );
}
