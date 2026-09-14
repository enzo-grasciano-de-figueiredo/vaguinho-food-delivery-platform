import React from 'react';
import type { MenuItem } from '../data';
import { Plus, Flame } from 'lucide-react';
import { motion } from 'framer-motion';
import { getProductImage } from '../utils/images';

interface ProductCardProps {
  product: MenuItem;
  onSelect: (product: MenuItem) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onSelect }) => {
  const getBadgeText = () => {
    if (!product.available) return 'INDISPONÍVEL';

    if (product.sellOptions && product.sellOptions.length > 0) {
      const labels = product.sellOptions.map(o => o.label.toLowerCase());
      if (labels.some(l => l.includes('fatia'))) return 'Por Kg ou Fatias';
      if (labels.some(l => l.includes('unidade'))) return 'Por Kg ou Unidade';
      if (labels.some(l => l.includes('porção'))) return 'Por Kg ou Porção M/G';
    }
    if (product.unit === 'kg') return 'Venda por Kg';
    return 'Venda por Unidade';
  };

  const badgeText = getBadgeText();
  const imageUrl = getProductImage(product);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={product.available ? { y: -4 } : {}}
      onClick={() => product.available && onSelect(product)}
      className={`group relative rounded-2xl p-4 flex flex-col justify-between bg-[#121214] border border-[#27272a] shadow-lg transition-all overflow-hidden ${
        !product.available 
          ? 'cursor-not-allowed opacity-60 grayscale' 
          : 'cursor-pointer hover:border-[#ea580c]'
      }`}
    >
      <div>
        {/* Product Image */}
        {imageUrl ? (
          <div className="relative h-40 w-full mb-3 rounded-xl overflow-hidden bg-[#18181b]">
            <img 
              src={imageUrl} 
              alt={product.name} 
              className={`w-full h-full object-cover transition-transform duration-300 ${product.available ? 'group-hover:scale-105' : ''}`}
              loading="lazy"
            />
          </div>
        ) : (
          <div className="relative h-40 w-full mb-3 rounded-xl overflow-hidden bg-gradient-to-br from-[#1c1917] to-[#09090b] border border-[#27272a]/60 flex flex-col items-center justify-center gap-2 group-hover:border-[#ea580c]/50 transition-colors">
            <Flame className="text-[#ea580c]/40 group-hover:text-[#ea580c] transition-colors" size={36} />
            <span className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider">Assados Vaguinho</span>
          </div>
        )}
        
        <h3 className={`text-base font-bold transition-colors line-clamp-1 mt-2 ${product.available ? 'text-white group-hover:text-[#ea580c]' : 'text-gray-400'}`}>
          {product.name}
        </h3>
        
        {product.description && (
          <p className="text-xs text-gray-400 mt-1 line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        )}
      </div>

      {/* Category / Availability Badge */}
      <span className="absolute top-6 left-6 text-[#ea580c] text-[10px] font-black uppercase tracking-wide px-2.5 py-1 rounded-md border border-[#ea580c]/50 shadow-md bg-black/80 backdrop-blur-md">
        {badgeText}
      </span>

      <div className="mt-4 pt-3 border-t border-[#27272a]/60 flex items-center justify-between">
        <div>
          <span className="text-[10px] text-gray-400 uppercase font-semibold block">A partir de</span>
          <span className="text-lg font-black text-white font-mono">
            R$ {product.price.toFixed(2).replace('.', ',')}
          </span>
          <span className="text-[11px] text-gray-400 ml-1">/ {product.unit}</span>
        </div>

        <button
          disabled={!product.available}
          onClick={(e) => {
            e.stopPropagation();
            if (product.available) onSelect(product);
          }}
          className={`w-10 h-10 rounded-xl font-bold flex items-center justify-center transition-all ${
            !product.available 
              ? 'bg-gray-800 text-gray-600 cursor-not-allowed' 
              : 'bg-gradient-to-r from-[#ea580c] to-red-600 hover:from-[#f97316] hover:to-red-500 text-white shadow-[0_4px_12px_rgba(234,88,12,0.3)] group-hover:scale-105'
          }`}
        >
          <Plus size={20} />
        </button>
      </div>
    </motion.div>
  );
};

