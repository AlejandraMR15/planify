import { formatCOP, formatDate, UNIT_LABEL } from './format';

// Genera una respuesta simulada del proveedor según el mensaje del cliente.
export function buildReply(text, service, event) {
  const t = text.toLowerCase();
  const date = formatDate(event.date);
  const busy = service.busyDates?.includes(event.date);

  if (/(disponib|fecha|libre|agenda)/.test(t)) {
    if (busy) {
      return {
        reply: `Revisé la agenda y el ${date} ya tenemos un compromiso 😕. ¿Podrían mover el evento un día antes o después?`,
        system: null,
      };
    }
    return {
      reply: `¡Claro que sí! Revisé la agenda y el ${date} lo tenemos libre para ustedes en ${event.city}.`,
      system: `Disponibilidad confirmada · ${date}`,
    };
  }
  if (/(precio|costo|valor|cuánto|cuanto|descuento|rebaja)/.test(t)) {
    return {
      reply: `El valor es de ${formatCOP(service.price)} ${UNIT_LABEL[service.unit]}. Si reservan esta semana con Planify les mantenemos la tarifa y les damos prioridad en la agenda.`,
      system: null,
    };
  }
  if (/(incluye|trae|ofrece|qué hay|que hay)/.test(t)) {
    return {
      reply: `Nuestro paquete incluye: ${service.includes.join(', ')}. ¿Quieren agregar algo más?`,
      system: null,
    };
  }
  if (/(gracias|perfecto|listo|genial)/.test(t)) {
    return {
      reply: '¡Con mucho gusto! Pueden reservar directamente desde el carrito y su pago queda en custodia de Planify hasta que confirmen que cumplimos con el servicio.',
      system: null,
    };
  }
  return {
    reply: 'Perfecto, tomo nota de todo 📝. ¿Les parece si lo dejamos en el carrito para asegurar la fecha?',
    system: null,
  };
}
