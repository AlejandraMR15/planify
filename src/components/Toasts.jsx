import { CheckCircle2, Info } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function Toasts() {
  const { toasts } = useApp();
  return (
    <div className="pointer-events-none fixed bottom-5 right-5 z-[60] flex flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="card flex max-w-sm items-center gap-3 px-4 py-3 text-sm font-medium animate-slide-up"
        >
          {t.type === 'success' ? (
            <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
          ) : (
            <Info className="h-5 w-5 shrink-0 text-gold" />
          )}
          {t.message}
        </div>
      ))}
    </div>
  );
}
