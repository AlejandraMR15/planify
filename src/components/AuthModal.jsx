import { useEffect, useState } from 'react';
import { Briefcase, Eye, EyeOff, PartyPopper } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Modal } from './ui';

const EMPTY = { name: '', email: '', password: '', role: '' };

const ROLES = [
  { id: 'cliente', title: 'Quiero organizar un evento', desc: 'Encuentra y reserva todo para tu gran día.', icon: PartyPopper },
  { id: 'proveedor', title: 'Ofrezco servicios para eventos', desc: 'Músicos, fotógrafos, salones, catering…', icon: Briefcase },
];

export default function AuthModal() {
  const { authModal, setAuthModal, login } = useApp();
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [showPwd, setShowPwd] = useState(false);
  const tab = authModal;

  useEffect(() => {
    setErrors({});
    if (!authModal) setForm(EMPTY);
  }, [authModal]);

  const set = (k, v) => {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => ({ ...e, [k]: undefined }));
  };

  const validate = () => {
    const e = {};
    if (tab === 'register' && form.name.trim().length < 3) e.name = 'Ingresa tu nombre completo';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Correo electrónico inválido';
    if (form.password.length < 6) e.password = 'Mínimo 6 caracteres';
    if (!form.role) e.role = 'Selecciona cómo quieres usar Planify';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    if (tab === 'login') {
      // Simulación: el nombre se deriva del correo
      const name = form.email.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
      login({ name, email: form.email, role: form.role });
    } else {
      login({ name: form.name.trim(), email: form.email, role: form.role });
    }
  };

  return (
    <Modal open={!!authModal} onClose={() => setAuthModal(null)} className="max-w-md">
      <div className="p-7">
        <p className="font-serif text-3xl font-semibold">
          {tab === 'login' ? 'Bienvenido de vuelta' : 'Únete a Planify'}
        </p>
        <p className="mt-1 text-sm text-coal/60">
          {tab === 'login' ? 'Continúa planeando tu evento soñado.' : 'El marketplace de eventos de Colombia.'}
        </p>

        <div className="mt-6 grid grid-cols-2 rounded-full bg-cream-300 p-1">
          {[
            ['login', 'Iniciar sesión'],
            ['register', 'Registrarse'],
          ].map(([id, label]) => (
            <button
              key={id}
              onClick={() => setAuthModal(id)}
              className={`rounded-full py-2 text-sm font-semibold transition ${tab === id ? 'bg-white text-coal shadow' : 'text-coal/50'}`}
            >
              {label}
            </button>
          ))}
        </div>

        <form onSubmit={submit} className="mt-6 space-y-4" noValidate>
          {tab === 'register' && (
            <div>
              <label className="label">Nombre completo</label>
              <input className={`input ${errors.name ? 'input-error' : ''}`} value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="María Fernanda Ruiz" />
              {errors.name && <p className="error-text">{errors.name}</p>}
            </div>
          )}
          <div>
            <label className="label">Correo electrónico</label>
            <input type="email" className={`input ${errors.email ? 'input-error' : ''}`} value={form.email} onChange={(e) => set('email', e.target.value)} placeholder="tu@correo.com" />
            {errors.email && <p className="error-text">{errors.email}</p>}
          </div>
          <div>
            <label className="label">Contraseña</label>
            <div className="relative">
              <input
                type={showPwd ? 'text' : 'password'}
                className={`input pr-10 ${errors.password ? 'input-error' : ''}`}
                value={form.password}
                onChange={(e) => set('password', e.target.value)}
                placeholder="••••••••"
              />
              <button type="button" onClick={() => setShowPwd((s) => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-coal/40 hover:text-coal">
                {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && <p className="error-text">{errors.password}</p>}
          </div>

          <div>
              <label className="label">{tab === 'login' ? 'Entrar como' : '¿Cómo usarás Planify?'}</label>
              <div className="grid gap-3">
                {ROLES.map(({ id, title, desc, icon: Icon }) => (
                  <button
                    type="button"
                    key={id}
                    onClick={() => set('role', id)}
                    className={`flex items-start gap-3 rounded-xl border p-3.5 text-left transition ${
                      form.role === id ? 'border-gold bg-gold/5 ring-2 ring-gold/20' : 'border-coal/15 hover:border-gold/50'
                    }`}
                  >
                    <span className={`rounded-lg p-2 ${form.role === id ? 'bg-gold text-white' : 'bg-cream-300 text-gold'}`}>
                      <Icon className="h-5 w-5" />
                    </span>
                    <span>
                      <span className="block text-sm font-semibold">{title}</span>
                      <span className="block text-xs text-coal/60">{desc}</span>
                    </span>
                  </button>
                ))}
              </div>
              {errors.role && <p className="error-text">{errors.role}</p>}
            </div>

          <button type="submit" className="btn-gold w-full py-3">
            {tab === 'login' ? 'Iniciar sesión' : 'Crear mi cuenta'}
          </button>
          <p className="text-center text-xs text-coal/50">Prototipo: cualquier correo válido y contraseña de 6+ caracteres funcionan.</p>
        </form>
      </div>
    </Modal>
  );
}
