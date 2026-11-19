import { useEffect, useState } from 'react';
import { ArrowLeft, CreditCard, Landmark, Loader2, Lock, MapPinned } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatCOP, formatDate } from '../utils/format';
import { Stepper } from '../components/ui';
import { OrderSummary } from './Cart';

const formatCard = (v) => v.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
const formatExpiry = (v) => {
  const d = v.replace(/\D/g, '').slice(0, 4);
  return d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
};
const cardBrand = (num) => {
  const n = num.replace(/\s/g, '');
  if (/^4/.test(n)) return 'VISA';
  if (/^(5[1-5]|2[2-7])/.test(n)) return 'Mastercard';
  if (/^3[47]/.test(n)) return 'AMEX';
  return '';
};

function Field({ label, error, children, className = '' }) {
  return (
    <label className={`block ${className}`}>
      <span className="label">{label}</span>
      {children}
      {error && <p className="error-text">{error}</p>}
    </label>
  );
}

export default function Checkout() {
  const { cartItems, totals, event, user, setView, completePayment } = useApp();
  const [form, setForm] = useState({
    address: '',
    startTime: event.startTime,
    emergencyName: '',
    emergencyPhone: '',
    cardNumber: '',
    cardName: user?.name?.toUpperCase() || '',
    expiry: '',
    cvc: '',
    installments: '1',
    terms: false,
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!cartItems.length && !loading) setView('cart');
  }, [cartItems.length, loading, setView]);

  const set = (k, v) => {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => ({ ...e, [k]: undefined }));
  };

  const validate = () => {
    const e = {};
    if (form.address.trim().length < 6) e.address = 'Ingresa la dirección del evento';
    if (!form.startTime) e.startTime = 'Indica la hora de inicio';
    if (form.emergencyName.trim().length < 3) e.emergencyName = 'Nombre del contacto requerido';
    if (!/^3\d{9}$/.test(form.emergencyPhone.replace(/\D/g, ''))) e.emergencyPhone = 'Celular colombiano de 10 dígitos (3XX…)';
    if (form.cardNumber.replace(/\s/g, '').length !== 16) e.cardNumber = 'El número debe tener 16 dígitos';
    if (form.cardName.trim().length < 3) e.cardName = 'Nombre como aparece en la tarjeta';
    const [mm, yy] = form.expiry.split('/').map(Number);
    const now = new Date();
    const curYY = now.getFullYear() % 100;
    if (!mm || !yy || mm < 1 || mm > 12 || form.expiry.length !== 5) e.expiry = 'Formato MM/AA';
    else if (yy < curYY || (yy === curYY && mm < now.getMonth() + 1)) e.expiry = 'La tarjeta está vencida';
    if (!/^\d{3,4}$/.test(form.cvc)) e.cvc = '3 o 4 dígitos';
    if (!form.terms) e.terms = 'Debes aceptar los términos para continuar';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const pay = (ev) => {
    ev.preventDefault();
    if (!validate() || loading) return;
    setLoading(true);
    setTimeout(() => {
      completePayment({
        address: form.address,
        startTime: form.startTime,
        emergency: `${form.emergencyName} · ${form.emergencyPhone}`,
        card: `${cardBrand(form.cardNumber) || 'Tarjeta'} •••• ${form.cardNumber.slice(-4)}`,
        installments: Number(form.installments),
      });
    }, 2400);
  };

  const brand = cardBrand(form.cardNumber);
  const installmentValue = totals.total / Number(form.installments);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <Stepper current={2} />
      <button onClick={() => setView('cart')} className="mb-4 inline-flex items-center gap-2 text-sm text-cream/60 hover:text-cream">
        <ArrowLeft className="h-4 w-4" /> Volver al carrito
      </button>

      <form onSubmit={pay} noValidate className="grid gap-8 lg:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          {/* Datos del evento */}
          <section className="card p-6">
            <div className="mb-5 flex items-center gap-3">
              <span className="rounded-xl bg-gold/10 p-2.5 text-gold"><MapPinned className="h-5 w-5" /></span>
              <div>
                <h2 className="font-serif text-2xl font-semibold">Datos del evento</h2>
                <p className="text-xs text-coal/60">
                  {event.name} · {formatDate(event.date)} · {event.city}
                </p>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Dirección del evento" error={errors.address} className="sm:col-span-2">
                <input className={`input ${errors.address ? 'input-error' : ''}`} value={form.address} onChange={(e) => set('address', e.target.value)} placeholder="Calle del Sargento Mayor #6-87, Centro Histórico" />
              </Field>
              <Field label="Hora de inicio" error={errors.startTime}>
                <input type="time" className="input" value={form.startTime} onChange={(e) => set('startTime', e.target.value)} />
              </Field>
              <div className="hidden sm:block" />
              <Field label="Contacto de emergencia" error={errors.emergencyName}>
                <input className={`input ${errors.emergencyName ? 'input-error' : ''}`} value={form.emergencyName} onChange={(e) => set('emergencyName', e.target.value)} placeholder="Nombre completo" />
              </Field>
              <Field label="Celular de emergencia" error={errors.emergencyPhone}>
                <input
                  className={`input ${errors.emergencyPhone ? 'input-error' : ''}`}
                  value={form.emergencyPhone}
                  inputMode="numeric"
                  onChange={(e) => set('emergencyPhone', e.target.value.replace(/[^\d ]/g, '').slice(0, 12))}
                  placeholder="300 123 4567"
                />
              </Field>
            </div>
          </section>

          {/* Pago */}
          <section className="card p-6">
            <div className="mb-5 flex items-center gap-3">
              <span className="rounded-xl bg-gold/10 p-2.5 text-gold"><CreditCard className="h-5 w-5" /></span>
              <div>
                <h2 className="font-serif text-2xl font-semibold">Tarjeta de crédito o débito</h2>
                <p className="flex items-center gap-1 text-xs text-coal/60"><Lock className="h-3 w-3" /> Pago simulado · no ingreses datos reales</p>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-[1fr_260px]">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Número de tarjeta" error={errors.cardNumber} className="sm:col-span-2">
                  <div className="relative">
                    <input
                      className={`input pr-24 font-mono tracking-wider ${errors.cardNumber ? 'input-error' : ''}`}
                      value={form.cardNumber}
                      inputMode="numeric"
                      onChange={(e) => set('cardNumber', formatCard(e.target.value))}
                      placeholder="4242 4242 4242 4242"
                    />
                    {brand && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gold">{brand}</span>}
                  </div>
                </Field>
                <Field label="Nombre en la tarjeta" error={errors.cardName} className="sm:col-span-2">
                  <input className={`input uppercase ${errors.cardName ? 'input-error' : ''}`} value={form.cardName} onChange={(e) => set('cardName', e.target.value.toUpperCase())} placeholder="MARÍA F RUIZ" />
                </Field>
                <Field label="Expiración (MM/AA)" error={errors.expiry}>
                  <input className={`input font-mono ${errors.expiry ? 'input-error' : ''}`} value={form.expiry} inputMode="numeric" onChange={(e) => set('expiry', formatExpiry(e.target.value))} placeholder="08/29" />
                </Field>
                <Field label="CVC / CVV" error={errors.cvc}>
                  <input type="password" className={`input font-mono ${errors.cvc ? 'input-error' : ''}`} value={form.cvc} inputMode="numeric" onChange={(e) => set('cvc', e.target.value.replace(/\D/g, '').slice(0, 4))} placeholder="•••" />
                </Field>
                <Field label="Número de cuotas" className="sm:col-span-2">
                  <select className="input" value={form.installments} onChange={(e) => set('installments', e.target.value)}>
                    {Array.from({ length: 36 }, (_, i) => i + 1).map((n) => (
                      <option key={n} value={n}>
                        {n} {n === 1 ? 'cuota' : 'cuotas'} {n > 1 ? `de ${formatCOP(totals.total / n)}` : ''}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>

              {/* Vista previa de la tarjeta */}
              <div className="relative hidden aspect-[1.6] self-start overflow-hidden rounded-2xl bg-gradient-to-br from-coal via-ink-600 to-gold p-5 text-cream shadow-xl md:block">
                <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gold-soft/30 blur-xl" />
                <div className="relative flex h-full flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="font-serif text-lg">Planify</span>
                    <span className="text-xs font-bold">{brand}</span>
                  </div>
                  <div className="h-7 w-10 rounded bg-gradient-to-br from-gold-soft to-gold" />
                  <p className="font-mono text-base tracking-widest">{form.cardNumber || '•••• •••• •••• ••••'}</p>
                  <div className="flex justify-between text-[10px] uppercase">
                    <span className="truncate pr-2">{form.cardName || 'NOMBRE APELLIDO'}</span>
                    <span>{form.expiry || 'MM/AA'}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-start gap-3 rounded-xl bg-gold/10 p-4 text-sm text-coal/80">
              <Landmark className="h-5 w-5 shrink-0 text-gold" />
              <p>
                <span className="font-semibold">Custodia de fondos:</span> un solo pago para tus {cartItems.length} servicios. Planify retiene el dinero y lo libera a cada proveedor solo cuando confirmas que cumplió.
              </p>
            </div>

            <label className="mt-6 flex cursor-pointer items-start gap-3 text-sm">
              <input type="checkbox" checked={form.terms} onChange={(e) => set('terms', e.target.checked)} className="mt-0.5 h-4 w-4 accent-[#8C6633]" />
              <span className="text-coal/70">
                Acepto los <span className="font-semibold text-gold underline">Términos y Condiciones</span>, la{' '}
                <span className="font-semibold text-gold underline">Política de Privacidad</span> y las políticas de cancelación de cada proveedor.
              </span>
            </label>
            {errors.terms && <p className="error-text ml-7">{errors.terms}</p>}
          </section>
        </div>

        <OrderSummary showCoupon={false}>
          {Number(form.installments) > 1 && (
            <p className="mt-2 text-right text-xs text-coal/60">
              {form.installments} cuotas de {formatCOP(installmentValue)}
            </p>
          )}
          <button type="submit" disabled={loading} className="btn-gold mt-5 w-full py-3.5 text-base">
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" /> Procesando pago…
              </>
            ) : (
              <>
                <Lock className="h-4 w-4" /> Pagar {formatCOP(totals.total)}
              </>
            )}
          </button>
        </OrderSummary>
      </form>

      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="card flex flex-col items-center px-10 py-8 text-center">
            <Loader2 className="h-10 w-10 animate-spin text-gold" />
            <p className="mt-4 font-serif text-2xl">Procesando tu pago</p>
            <p className="mt-1 text-sm text-coal/60">Dejando tus fondos en custodia y avisando a los proveedores…</p>
          </div>
        </div>
      )}
    </div>
  );
}
