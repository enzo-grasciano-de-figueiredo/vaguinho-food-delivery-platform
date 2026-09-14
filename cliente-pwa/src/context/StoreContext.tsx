import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { MenuItem, SellOption } from '../data';
import { supabase } from '../utils/supabase';

export interface ConfiguredCartItem {
  cartItemId: string;
  product: MenuItem;
  selectedOptionLabel?: string;
  notes?: string;
  quantity: number;
  finalUnitPrice: number;
  minUnitPrice: number;
  maxUnitPrice: number;
}

export interface StoreStatus {
  isOpen: boolean;
  statusText: string;
  nextStatusText: string;
}

interface StoreContextData {
  products: MenuItem[];
  categories: string[];
  storeStatus: StoreStatus;
  cart: ConfiguredCartItem[];
  addToCart: (item: Omit<ConfiguredCartItem, 'cartItemId'>) => void;
  removeFromCart: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, quantity: number) => void;
  clearCart: () => void;
  cartTotalMin: number;
  cartTotalMax: number;
  cartCount: number;
}

const StoreContext = createContext<StoreContextData>({} as StoreContextData);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [storeStatus, setStoreStatus] = useState<StoreStatus>({
    isOpen: true,
    statusText: 'Aberto Agora',
    nextStatusText: ''
  });
  const [cart, setCart] = useState<ConfiguredCartItem[]>([]);

  const fetchData = useCallback(async () => {
    // Busca Categorias dinamicamente
    const { data: catData } = await supabase
      .from('Categorias')
      .select('nome')
      .order('ordem', { ascending: true });

    if (catData) {
      const uniqueCategories = Array.from(new Set(catData.map(c => c.nome)));
      setCategories(uniqueCategories);
    }

    // Busca Produtos com suas Categorias e Opções mapeadas (Efeito JOIN)
    let prodData: any[] | null = null;
    const { data: joinData, error: joinError } = await supabase
      .from('Produtos')
      .select(`
        id, nome, preco_base, unidade_base, descricao, disponibilidade, imagem, is_marmita, numero_item,
        opcoes_venda, categoria,
        Categorias(nome),
        Produto_Opcoes(id, titulo, preco, unidade)
      `)
      .order('numero_item', { ascending: true });

    if (joinError) {
      console.error('Erro no JOIN (Tabelas/FKs ausentes). Tentando buscar Produtos sem JOIN...', joinError);
      // Fallback extremo: Busca apenas da tabela Produtos sem tentar fazer JOIN
      const { data: fallbackData, error: fallbackError } = await supabase
        .from('Produtos')
        .select('*')
        .order('numero_item', { ascending: true });
        
      if (fallbackError) {
        console.error('Erro fatal ao buscar produtos:', fallbackError);
      } else {
        prodData = fallbackData;
      }
    } else {
      prodData = joinData;
    }

    if (prodData) {
      const mappedProducts: MenuItem[] = prodData.map((item: any) => {
        // Mapeia o resultado do JOIN da tabela Produto_Opcoes. 
        // FALLBACK: Se a tabela relacional estiver vazia (não migrada), tenta ler do JSON legado 'opcoes_venda'
        let sellOptions: SellOption[] = [];
        
        if (item.Produto_Opcoes && item.Produto_Opcoes.length > 0) {
          sellOptions = item.Produto_Opcoes.map((opt: any) => ({
            id: opt.id,
            label: opt.titulo,
            price: Number(opt.preco),
            unitLabel: opt.unidade
          }));
        } else if (item.opcoes_venda) {
          // Fallback para o JSON legado inserido pelo usuário
          try {
            let parsed = typeof item.opcoes_venda === 'string' ? JSON.parse(item.opcoes_venda) : item.opcoes_venda;
            if (typeof parsed === 'string') parsed = JSON.parse(parsed); // double parse in case it's stringified twice
            
            if (Array.isArray(parsed)) {
              sellOptions = parsed.map((opt: any) => ({
                id: opt.id || 'opt-default',
                label: opt.label || opt.titulo || '',
                price: Number(opt.price || opt.preco || item.preco_base || 0),
                unitLabel: opt.unitLabel || opt.unit || opt.unidade || ''
              }));
            }
          } catch (e) {
            console.error('Erro ao fazer parse do opcoes_venda legado', e);
          }
        }

        const rawCategoryString = item.Categorias?.nome || item.categoria || 'Sem Categoria';
        const parsedCategories: string[] = rawCategoryString.includes(',') 
          ? rawCategoryString.split(',').map((c: string) => c.trim())
          : [rawCategoryString];

        // Se o item pertencer a Favoritos da Casa, ele também entra na sua categoria secundária
        if (item.nome === 'Frango Inteiro Assado' && !parsedCategories.includes('Carne de Frango')) {
          parsedCategories.push('Carne de Frango');
        }
        if ((item.nome === 'Maionese Tradicional' || item.nome.includes('Marmita')) && !parsedCategories.includes('Acompanhamentos & Saladas')) {
          parsedCategories.push('Acompanhamentos & Saladas');
        }

        return {
          id: item.id,
          name: item.nome,
          category: parsedCategories[0],
          categories: parsedCategories,
          price: Number(item.preco_base),
          unit: item.unidade_base || 'unidade',
          description: item.descricao,
          available: Boolean(item.disponibilidade),
          image: item.imagem,
          isMarmita: Boolean(item.is_marmita),
          sellOptions
        };
      });
      setProducts(mappedProducts);
    }

    // Busca Configuração da Loja (Server-side Truth)
    const { data: configData } = await supabase
      .from('Configuracoes_Loja')
      .select('*')
      .eq('id', 1)
      .single();

    if (configData) {
      const isOpen = configData.status_funcionamento === 'ABERTO' || 
                    (configData.status_funcionamento === 'HORARIO_PROGRAMADO' /* Lógica de horário entrará aqui depois */);
      
      setStoreStatus({
        isOpen,
        statusText: isOpen ? 'Aberto Agora' : (configData.mensagem_fechado || 'Fechado no Momento'),
        nextStatusText: `Horário Oficial: ${configData.hora_abertura} às ${configData.hora_fechamento}`
      });
    }
  }, []);

  useEffect(() => {
    fetchData();

    const channel = supabase.channel('store-updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'Produtos' }, () => fetchData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'Configuracoes_Loja' }, () => fetchData())
      .subscribe();

    const handleFocus = () => fetchData();
    window.addEventListener('focus', handleFocus);

    const interval = setInterval(fetchData, 10 * 60 * 1000);

    return () => {
      supabase.removeChannel(channel);
      window.removeEventListener('focus', handleFocus);
      clearInterval(interval);
    };
  }, [fetchData]);

  const addToCart = (newItem: Omit<ConfiguredCartItem, 'cartItemId'>) => {
    const cartItemId = `${newItem.product.id}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    setCart(prev => [...prev, { ...newItem, cartItemId }]);
  };

  const removeFromCart = (cartItemId: string) => {
    setCart(prev => prev.filter(item => item.cartItemId !== cartItemId));
  };

  const updateQuantity = (cartItemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(cartItemId);
      return;
    }
    setCart(prev => prev.map(item =>
      item.cartItemId === cartItemId ? { ...item, quantity } : item
    ));
  };

  const clearCart = () => setCart([]);

  const cartTotalMin = cart.reduce((acc, item) => acc + ((item.minUnitPrice || item.finalUnitPrice) * item.quantity), 0);
  const cartTotalMax = cart.reduce((acc, item) => acc + ((item.maxUnitPrice || item.finalUnitPrice) * item.quantity), 0);
  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <StoreContext.Provider value={{
      products,
      categories,
      storeStatus,
      cart,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      cartTotalMin,
      cartTotalMax,
      cartCount
    }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => useContext(StoreContext);
