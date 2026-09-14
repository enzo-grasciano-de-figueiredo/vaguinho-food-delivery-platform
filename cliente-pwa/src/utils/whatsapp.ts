import type { ConfiguredCartItem } from "../context/StoreContext";

interface OrderData {
  name: string;
  cpf?: string;
  deliveryType: 'ENTREGA' | 'RETIRADA';
  paymentMethod: string;
  address?: string;
  complement?: string;
  number?: string;
  pickupTime?: string;
}

export function generateWhatsAppLink(
  phone: string, 
  order: OrderData, 
  cart: ConfiguredCartItem[], 
  total: number
): string {
  let text = `*NOVO PEDIDO: ASSADOS VAGUINHO* 🔥\n`;
  text += `===========================\n`;
  text += `*Cliente:* ${order.name}\n`;
  if (order.cpf) text += `*CPF:* ${order.cpf}\n`;
  text += `*Opção:* ${order.deliveryType === 'ENTREGA' ? '🚚 Entrega' : '🏪 Retirada'}\n\n`;

  text += `*Itens:*\n`;
  cart.forEach(item => {
    let qStr = item.product.unit === 'kg' ? `${item.quantity.toFixed(1)}kg` : `${item.quantity}x`;
    text += `${qStr} ${item.product.name} - R$ ${(item.finalUnitPrice * item.quantity).toFixed(2).replace('.', ',')}\n`;
  });

  text += `\n*Pagamento:* ${order.paymentMethod}\n`;

  if (order.deliveryType === 'ENTREGA') {
    text += `*Endereço:* ${order.address}, ${order.number || 'S/N'}`;
    if (order.complement) text += ` - Compl: ${order.complement}`;
    text += `\n`;
  } else if (order.pickupTime) {
    text += `*Horário da Retirada:* ${order.pickupTime}\n`;
  }

  text += `*Total:* R$ ${total.toFixed(2).replace('.', ',')}\n`;
  text += `===========================\n`;

  const encodedText = encodeURIComponent(text);
  return `https://wa.me/${phone}?text=${encodedText}`;
}
