import React, { useState, useEffect, useRef } from 'react';
import { AuthProvider } from './context/AuthContext';
import { StoreProvider, useStore } from './context/StoreContext';
import { CATEGORIES as FALLBACK_CATEGORIES } from './data';
import type { MenuItem } from './data';
import { Header } from './components/Header';
import { ProductCard } from './components/ProductCard';
import { ProductCustomizerModal } from './components/ProductCustomizerModal';
import { CartDrawer } from './components/CartDrawer';
import { LoginModal } from './components/LoginModal';
import { AdminPanel } from './components/AdminPanel';
import { Footer } from './components/Footer';
import { getCategorySlug } from './utils/helpers';
import { ShoppingBag, Flame } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const MainContent: React.FC = () => {
  const { products, categories, cartCount, cartTotalMin, cartTotalMax, addToCart } = useStore();
  const displayCategories = categories.length > 0 ? categories : FALLBACK_CATEGORIES;

  const [activeCategory, setActiveCategory] = useState<string>(displayCategories[0] || 'Tudo');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedProduct, setSelectedProduct] = useState<MenuItem | null>(null);
  const [isCustomizerOpen, setIsCustomizerOpen] = useState<boolean>(false);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isIOS, setIsIOS] = useState(false);

  // Ref locks to prevent IntersectionObserver from interrupting manual click-scroll
  const isManualScrollingRef = useRef<boolean>(false);
  const scrollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // IntersectionObserver: Detects which category section is currently visible in viewport
  useEffect(() => {
    const timer = setTimeout(() => {
      const observer = new IntersectionObserver(
        (entries) => {
          if (isManualScrollingRef.current) return;

          const visibleEntries = entries.filter((entry) => entry.isIntersecting);
          if (visibleEntries.length > 0) {
            visibleEntries.sort((a, b) => Math.abs(a.boundingClientRect.top) - Math.abs(b.boundingClientRect.top));
            const cat = visibleEntries[0].target.getAttribute('data-category');
            if (cat) {
              setActiveCategory(cat);
            }
          }
        },
        {
          rootMargin: '-110px 0px -45% 0px',
          threshold: 0.05
        }
      );

      displayCategories.forEach((cat) => {
        const slug = getCategorySlug(cat);
        const el = document.getElementById(`category-${slug}`);
        if (el) observer.observe(el);
      });

      return () => observer.disconnect();
    }, 150);

    return () => clearTimeout(timer);
  }, [displayCategories, products]);

  useEffect(() => {
    // Detect iOS for specific PWA instructions
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice && !('standalone' in window.navigator && (window.navigator as any).standalone));

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallPWA = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    } else if (isIOS) {
      alert('Para instalar no iOS, toque no ícone de "Compartilhar" e depois em "Adicionar à Tela de Início".');
    }
  };


  const handleSelectCategory = (category: string) => {
    // Lock IntersectionObserver updates for 1.2s while browser performs smooth scroll
    isManualScrollingRef.current = true;
    if (scrollTimerRef.current) clearTimeout(scrollTimerRef.current);
    
    setActiveCategory(category);

    scrollTimerRef.current = setTimeout(() => {
      isManualScrollingRef.current = false;
    }, 1200);
  };

  const handleOpenCustomizer = (product: MenuItem) => {
    setSelectedProduct(product);
    setIsCustomizerOpen(true);
  };

  // Filter products by search query
  const filteredProducts = products.filter(p => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return p.name.toLowerCase().includes(q) || (p.description && p.description.toLowerCase().includes(q));
  });

  const hasRangeInCart = cartTotalMin !== cartTotalMax;

  return (
    <div className="min-h-screen bg-[#09090b] text-white flex flex-col justify-between">
      <div>
        {/* Header */}
        <Header
          categories={displayCategories}
          activeCategory={activeCategory}
          onSelectCategory={handleSelectCategory}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        {/* Hero Banner */}
        <div className="container mx-auto px-4 pt-6">
          <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-red-900/40 via-[#ea580c]/30 to-amber-900/40 border border-[#ea580c]/30 p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
            <div className="space-y-2 text-center md:text-left z-10">
              <span className="inline-block bg-[#ea580c] text-white text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full">
                Assados Vaguinho • Sexta, Sábado e Domingo (11h30 - 14h30)
              </span>
              <h2 className="text-2xl sm:text-4xl font-black italic tracking-wide">
                Carnes Assadas na Brasa & Acompanhamentos Especiais
              </h2>
              <p className="text-xs sm:text-sm text-gray-300 max-w-xl leading-relaxed">
                Carnes nobres selecionadas, preparadas na brasa no ponto ideal, acompanhamentos frescos e a famosa maionese caseira do Vaguinho. Experimente nossa Marmita da Casa!
              </p>
              
              {(deferredPrompt || isIOS) && (
                <button
                  onClick={handleInstallPWA}
                  className="mt-4 bg-gradient-to-r from-[#ea580c] to-red-600 hover:from-[#f97316] hover:to-red-500 text-white font-black uppercase tracking-wider py-2.5 px-6 rounded-lg text-xs shadow-lg shadow-[#ea580c]/30 hover:scale-105 transition-transform"
                >
                  Baixar APP
                </button>
              )}
            </div>
            <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gradient-to-br from-[#ea580c] to-red-600 flex items-center justify-center shadow-[0_0_40px_rgba(234,88,12,0.4)] shrink-0">
              <Flame size={54} className="text-white animate-bounce" />
            </div>
          </div>
        </div>

        {/* Main Categories & Products Grid */}
        <main className="container mx-auto px-4 py-8 space-y-12">
          {displayCategories.map((category) => {
            const categoryProducts = filteredProducts.filter((p) => 
              p.category === category || (p.categories && p.categories.includes(category))
            );
            if (categoryProducts.length === 0) return null;
            const slug = getCategorySlug(category);

            return (
              <section
                key={category}
                id={`category-${slug}`}
                data-category={category}
                className="scroll-mt-36 pt-4"
              >
                <h2 className="text-xl sm:text-2xl font-black uppercase tracking-wider mb-6 text-white border-b border-[#27272a] pb-3 flex items-center gap-2">
                  <Flame className="text-[#ea580c]" size={24} />
                  {category}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                  {categoryProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onSelect={handleOpenCustomizer}
                    />
                  ))}
                </div>
              </section>
            );
          })}
        </main>
      </div>

      {/* Footer */}
      <Footer onOpenAdmin={() => setIsLoginModalOpen(true)} />

      {/* Floating Cart Button */}
      <AnimatePresence>
        {cartCount > 0 && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-6 left-0 right-0 z-30 px-4 md:px-0 md:max-w-[420px] md:mx-auto"
          >
            <button
              onClick={() => setIsCartOpen(true)}
              className="w-full bg-gradient-to-r from-[#ea580c] to-red-600 hover:from-[#f97316] hover:to-red-500 text-white px-6 py-4 rounded-2xl font-bold flex justify-between items-center shadow-[0_10px_30px_rgba(234,88,12,0.5)] transition-all active:scale-95"
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  <ShoppingBag size={24} />
                  <span className="absolute -top-2 -right-2 bg-white text-[#ea580c] text-xs w-5 h-5 flex items-center justify-center rounded-full font-black shadow">
                    {cartCount}
                  </span>
                </div>
                <span className="uppercase tracking-wider text-xs sm:text-sm">Ver Seu Pedido</span>
              </div>
              <span className="text-sm sm:text-base font-mono font-bold">
                {hasRangeInCart
                  ? `R$ ${cartTotalMin.toFixed(2).replace('.', ',')} ~ R$ ${cartTotalMax.toFixed(2).replace('.', ',')}`
                  : `R$ ${cartTotalMin.toFixed(2).replace('.', ',')}`}
              </span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <AdminPanel />

      {/* Modals & Drawers */}
      <ProductCustomizerModal
        product={selectedProduct}
        isOpen={isCustomizerOpen}
        onClose={() => setIsCustomizerOpen(false)}
        onAddToCart={(configured) => {
          addToCart({
            product: configured.product,
            selectedOptionLabel: configured.selectedOptionLabel,
            notes: configured.notes,
            quantity: configured.quantity,
            finalUnitPrice: configured.finalPrice,
            minUnitPrice: configured.minPrice,
            maxUnitPrice: configured.maxPrice
          });
        }}
      />

      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />

      {isLoginModalOpen && (
        <LoginModal onClose={() => setIsLoginModalOpen(false)} />
      )}
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <StoreProvider>
        <MainContent />
      </StoreProvider>
    </AuthProvider>
  );
}
