import type { MenuItem } from '../data';

export const getProductImage = (product: MenuItem): string | null => {
  if (product.image && typeof product.image === 'string' && product.image.trim() !== '') {
    return product.image.trim();
  }
  return null;
};
