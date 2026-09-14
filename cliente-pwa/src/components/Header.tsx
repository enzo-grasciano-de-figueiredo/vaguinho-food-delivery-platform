import React, { useState, useEffect, useRef } from 'react';
import { Flame, Search, ShieldCheck, MapPin, Truck, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { checkIsOpenNow, getCategorySlug } from '../utils/helpers';
import { motion, AnimatePresence } from 'framer-motion';

interface HeaderProps {
  categories: string[];
  activeCategory: string;
  onSelectCategory: (category: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  categories,
  activeCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange
}) => {
  const { isAuthenticated, logout, adminConfig } = useAuth();
  const [storeStatus, setStoreStatus] = useState(checkIsOpenNow(adminConfig?.simulatedTime || undefined));
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const categoryBarRef = useRef<HTMLDivElement>(null);
  
  const now = adminConfig?.simulatedTime || new Date();
  const isSunday = now.getDay() === 0;

  useEffect(() => {
    const timer = setInterval(() => {
      setStoreStatus(checkIsOpenNow(adminConfig?.simulatedTime || undefined));
    }, 30000);
    return () => clearInterval(timer);
  }, [adminConfig?.simulatedTime]);

  // Auto-scroll horizontal category bar to center active category button on mobile/desktop
  useEffect(() => {
    if (!categoryBarRef.current) return;
    const activeSlug = getCategorySlug(activeCategory);
    const activeButton = categoryBarRef.current.querySelector(`#nav-btn-${activeSlug}`);
    if (activeButton) {
      activeButton.scrollIntoView({
        behavior: 'smooth',
        inline: 'center',
        block: 'nearest'
      });
    }
  }, [activeCategory]);

  return (
    <header className="sticky top-0 z-30 bg-[#0f0f11]/95 backdrop-blur-md border-b border-[#27272a]">
      {/* Top Banner / Store Info */}
      <div className="container mx-auto px-4 py-3 sm:py-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Brand & Logo */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-[#ea580c] to-red-600 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(234,88,12,0.5)] shrink-0">
              <Flame className="text-white" size={28} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black italic tracking-wider uppercase bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-200 to-gray-400">
                  Assados <span className="text-[#ea580c]">Vaguinho</span>
                </h1>
                {/* Delivery Badge */}
                {isSunday && storeStatus.isOpen && (
                  <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 border bg-green-500/10 border-green-500/30 text-green-400">
                    <Truck size={12} /> FAZEMOS ENTREGA!
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-400 mt-1">
                {/* Dynamic Status Indicator as Button */}
                <button 
                  onClick={() => setIsScheduleOpen(true)}
                  className="hover:scale-105 transition-transform"
                >
                  {storeStatus.isOpen ? (
                    <span className="flex items-center gap-1.5 text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20 cursor-pointer">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      Aberto Agora
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 text-red-400 font-semibold bg-red-500/10 px-2 py-0.5 rounded-md border border-red-500/20 cursor-pointer">
                      <span className="w-2 h-2 rounded-full bg-red-500" />
                      Fechado ({storeStatus.nextStatusText})
                    </span>
                  )}
                </button>

                <a href="https://maps.app.goo.gl/cmnmaNtLkVCRe1w7A" target="_blank" rel="noreferrer" className="flex items-center gap-1 text-gray-400 font-normal hover:text-[#ea580c] transition-colors cursor-pointer group">
                  <MapPin size={13} className="text-gray-400 group-hover:text-[#ea580c] transition-colors" /> Curitiba - PR
                </a>
              </div>
            </div>
          </div>

          {/* Search bar & Dev Lock Status */}
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Buscar carnes, acompanhamentos, saladas..."
                className="w-full bg-[#18181b] border border-[#27272a] rounded-xl py-2 px-3 pl-9 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#ea580c] transition-all"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={15} />
            </div>

            {isAuthenticated && (
              <button
                onClick={logout}
                title="Sair do modo Admin"
                className="bg-[#18181b] hover:bg-[#27272a] border border-[#27272a] text-gray-400 hover:text-white p-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shrink-0"
              >
                <ShieldCheck size={16} className="text-emerald-400" />
                <span className="hidden sm:inline">Modo Admin</span>
              </button>
            )}
          </div>

        </div>
      </div>

      {/* Horizontal Category Scroll Bar (Compact Single Line with Auto-Centering Scroll-Spy) */}
      <div className="overflow-x-auto no-scrollbar border-t border-[#27272a] bg-[#09090b] scroll-smooth">
        <div
          ref={categoryBarRef}
          className="container mx-auto px-4 flex items-center py-2 gap-2 whitespace-nowrap scroll-smooth"
        >
          {categories.map((category) => {
            const slug = getCategorySlug(category);
            const isActive = activeCategory === category;

            return (
              <a
                id={`nav-btn-${slug}`}
                key={category}
                href={`#category-${slug}`}
                onClick={() => onSelectCategory(category)}
                className={`px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all inline-block shrink-0 ${
                  isActive
                    ? 'bg-gradient-to-r from-[#ea580c] to-red-600 text-white shadow-[0_4px_12px_rgba(234,88,12,0.4)] scale-[1.02]'
                    : 'bg-[#18181b] text-gray-400 hover:bg-[#27272a] hover:text-gray-200 border border-[#27272a]'
                }`}
              >
                {category}
              </a>
            );
          })}
        </div>
      </div>

      {/* SCHEDULE MODAL */}
      <AnimatePresence>
        {isScheduleOpen && (
          <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-sm bg-[#18181b] rounded-2xl overflow-hidden shadow-2xl relative border border-[#27272a] max-h-[90vh] overflow-y-auto no-scrollbar"
            >
              <button
                onClick={() => setIsScheduleOpen(false)}
                className="absolute top-4 right-4 z-10 bg-black/50 text-white p-2 rounded-full backdrop-blur-md hover:bg-black/70 transition-colors"
              >
                <X size={20} />
              </button>

              {/* Card Image Cover */}
              <div className="w-full h-48 relative">
                <img 
                  src="/vaguinho-logo-capa.png" 
                  alt="Assados Vaguinho" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#18181b] via-[#18181b]/50 to-transparent" />
              </div>

              {/* Card Content */}
              <div className="p-5 -mt-6 relative z-10">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-sm uppercase tracking-wider bg-[#27272a] text-gray-300">
                    INFORMAÇÕES
                  </span>
                </div>
                
                <h3 className="text-xl font-black text-white uppercase tracking-wider mb-2">Horários de Funcionamento</h3>
                <p className="text-sm text-gray-400 mb-5 leading-relaxed">
                  Confira nossos dias e horários de atendimento.
                </p>

                <div className="w-full space-y-3 text-sm">
                  <div className="bg-[#09090b] border border-[#27272a] rounded-xl p-3 flex flex-col gap-1">
                    <div className="font-black text-[#ea580c] uppercase text-xs tracking-wider">Sexta-feira</div>
                    <div className="text-gray-300 text-sm font-semibold">11:30 às 14:30</div>
                    <div className="text-gray-500 text-xs">Retirada no local e consumo local</div>
                  </div>
                  <div className="bg-[#09090b] border border-[#27272a] rounded-xl p-3 flex flex-col gap-1">
                    <div className="font-black text-[#ea580c] uppercase text-xs tracking-wider">Sábado</div>
                    <div className="text-gray-300 text-sm font-semibold">11:30 às 14:30</div>
                    <div className="text-gray-500 text-xs">Retirada no local e consumo local</div>
                  </div>
                  <div className="bg-[#09090b] border border-[#27272a] rounded-xl p-3 flex flex-col gap-1">
                    <div className="font-black text-[#ea580c] uppercase text-xs tracking-wider">Domingo</div>
                    <div className="text-gray-300 text-sm font-semibold">11:30 às 14:30</div>
                    <div className="text-gray-500 text-xs">Retirada no local e Entregas (Delivery)</div>
                  </div>
                </div>

                <div className="mt-6">
                  <button
                    onClick={() => setIsScheduleOpen(false)}
                    className="w-full bg-[#27272a] hover:bg-[#3f3f46] text-white py-3.5 rounded-xl font-bold text-xs uppercase transition-colors flex items-center justify-center gap-2"
                  >
                    Fechar Aba
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </header>
  );
};
