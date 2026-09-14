export type Unit = 'kg' | 'unidade' | 'porção' | 'fatia';

export interface SellOption {
  id: string;
  label: string;      // Ex: "Por Quilo (kg)", "Por Fatia", "Porção M", "Unidade"
  price: number;      // Preço daquela opção
  unitLabel: string;  // Ex: "kg", "unidade", "porção M", "fatia"
}

export interface MenuItem {
  id: string;
  name: string;
  category: string;
  categories?: string[];
  price: number;
  unit: string;
  description?: string;
  available: boolean;
  image?: string;
  isMarmita?: boolean;
  sellOptions?: SellOption[];
}

export const menuData: MenuItem[] = [];

export const CATEGORIES = [
  '★ Favoritos da Casa',
  'Carne de Boi',
  'Carne de Frango',
  'Carne de Porco',
  'Acompanhamentos & Saladas',
  'Bebidas Geladas'
];
