// Formatea un número como pesos colombianos: 2500000 -> "$2.500.000 COP"
export function formatCOP(value, { suffix = true } = {}) {
  const n = Math.round(Number(value) || 0);
  const formatted = String(Math.abs(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${n < 0 ? '-' : ''}$${formatted}${suffix ? ' COP' : ''}`;
}

// Separadores de miles sin símbolo (para inputs de precio)
export function formatThousands(digits) {
  return String(digits || '').replace(/\D/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

export const UNIT_LABEL = {
  hora: 'por hora',
  evento: 'por evento',
  persona: 'por persona',
};

export const UNIT_QTY_LABEL = {
  hora: (q) => (q === 1 ? 'hora' : 'horas'),
  persona: (q) => (q === 1 ? 'persona' : 'personas'),
  evento: () => 'evento',
};

// "2026-12-19" -> "19 de diciembre de 2026" (sin desfases de zona horaria)
export function formatDate(dateStr, opts = { day: 'numeric', month: 'long', year: 'numeric' }) {
  if (!dateStr) return 'Sin fecha';
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('es-CO', opts);
}

export function toDateKey(y, m, d) {
  return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

export function nowTime() {
  return new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
}

export function uid(prefix = '') {
  return prefix + Math.random().toString(36).slice(2, 9);
}

export function initials(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join('');
}
