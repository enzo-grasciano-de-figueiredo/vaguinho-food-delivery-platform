export const getCategorySlug = (category: string): string => {
  return category
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

export interface StoreStatus {
  isOpen: boolean;
  statusText: string;
  nextStatusText: string;
}

export const isOrderingOpen = (currentTime?: Date): boolean => {
  const now = currentTime || new Date();
  const day = now.getDay(); // 0 = Domingo, 5 = Sexta, 6 = Sábado
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const currentMin = hours * 60 + minutes;

  // Horário de pedidos: 06:30 (390 min) às 14:30 (870 min)
  const openMin = 6 * 60 + 30;
  const closeMin = 14 * 60 + 30;

  const isOperatingDay = day === 0 || day === 5 || day === 6;

  return isOperatingDay && currentMin >= openMin && currentMin < closeMin;
};

export const checkIsOpenNow = (currentTime?: Date): StoreStatus => {
  const now = currentTime || new Date();
  const day = now.getDay(); // 0 = Domingo, 5 = Sexta, 6 = Sábado
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const currentMin = hours * 60 + minutes;

  // Horário oficial: 11:30 (690 min) às 14:30 (870 min)
  const openMin = 11 * 60 + 30;
  const closeMin = 14 * 60 + 30;

  const isOperatingDay = day === 0 || day === 5 || day === 6;
  const isOperatingHours = currentMin >= openMin && currentMin < closeMin;

  const isOpen = isOperatingDay && isOperatingHours;

  let nextStatusText = '';
  if (isOpen) {
    nextStatusText = 'Aberto Agora';
  } else if (isOperatingDay && currentMin < openMin) {
    nextStatusText = 'Abre hoje às 11h30';
  } else if (day === 5 && currentMin >= closeMin) {
    nextStatusText = 'Abre amanhã (Sáb) às 11h30';
  } else if (day === 6 && currentMin >= closeMin) {
    nextStatusText = 'Abre domingo às 11h30';
  } else {
    nextStatusText = 'Abre sexta-feira às 11h30';
  }

  return {
    isOpen,
    statusText: isOpen ? 'Aberto Agora' : 'Fechado no Momento',
    nextStatusText
  };
};
