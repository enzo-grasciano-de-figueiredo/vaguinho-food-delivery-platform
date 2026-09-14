import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Faltando VITE_SUPABASE_URL ou VITE_SUPABASE_ANON_KEY no .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const idPainelMap = {
  'Alcatra Nobre': 1, 'Costela na Brasa': 2, 'Filé Argentino': 3, 'Frango Inteiro Assado': 4,
  'Linguiça de Porco na Brasa': 5, 'Medalhão de Porco c/ Bacon': 6, 'Panceta Pururuca': 7,
  'Coxa com Sobrecoxa': 8, 'Meio Frango Assado': 9, 'Fraldinha Especial': 10,
  'Maminha Selecionada': 11, 'Cupim de Cupinzeiro': 12, 'Arroz à Grega': 13,
  'Farofa Especial da Casa': 14, 'Maionese Tradicional': 15, 'Maionese Verde com Cheiro Verde': 16,
  'Risoto de Frango': 17, 'Salpicão de Frango': 18, 'Banana Frita ao Leite': 19,
  'Batata Frita Rodela': 20, 'Polenta Frita Crocante': 21, 'Nhoque Receita Dona Isa': 22,
  'Macarronese Especial': 23, 'Salada de Repolho Cozido': 24, 'Salada de Tomate c/ Cebola': 25,
  'Salada de Feijão Cavalo': 26, 'Salada de Vagem': 27, 'Farofas Gourmet': 28
};

const menuData = [
  { name: 'Frango Inteiro Assado', category: '★ Favoritos da Casa', price: 59.90, unit: 'unidade', description: 'Estrela do Vaguinho! Frango de máquina assado lentamente.', available: true, isMarmita: false, estoque: 25 },
  { name: 'Maionese Tradicional', category: '★ Favoritos da Casa', price: 49.90, unit: 'kg', description: 'Famosa maionese caseira do Vaguinho.', available: true, isMarmita: false, estoque: 15, sellOptions: [ { id: 'opt-kg', label: 'Por Quilo (kg)', price: 49.90, unitLabel: 'kg' }, { id: 'opt-pm', label: 'Porção M (~500g)', price: 25.00, unitLabel: 'porção M' }, { id: 'opt-pg', label: 'Porção G (~1kg)', price: 49.90, unitLabel: 'porção G' } ] },
  { name: 'Marmita da Casa (~600g)', category: '★ Favoritos da Casa', price: 35.00, unit: 'unidade', description: 'Marmita farta e completa (~600g).', available: true, isMarmita: true, estoque: 10 },
  { name: 'Costela na Brasa', category: 'Carne de Boi', price: 89.90, unit: 'kg', description: 'Costela bovina assada lentamente no fogo de chão.', available: true, isMarmita: false, estoque: 8, sellOptions: [ { id: 'opt-kg', label: 'Por Quilo (kg)', price: 89.90, unitLabel: 'kg' }, { id: 'opt-fatia', label: 'Por Fatia (~400g)', price: 36.00, unitLabel: 'fatia' } ] },
  { name: 'Alcatra Nobre', category: 'Carne de Boi', price: 139.90, unit: 'kg', description: 'Corte fino de alcatra selecionada.', available: true, isMarmita: false, estoque: 5, sellOptions: [ { id: 'opt-kg', label: 'Por Quilo (kg)', price: 139.90, unitLabel: 'kg' }, { id: 'opt-fatia', label: 'Por Fatia (~300g)', price: 42.00, unitLabel: 'fatia' } ] },
  { name: 'Filé Argentino', category: 'Carne de Boi', price: 139.90, unit: 'kg', description: 'Carne nobre argentina com marmoreio superior.', available: true, isMarmita: false, estoque: 4, sellOptions: [ { id: 'opt-kg', label: 'Por Quilo (kg)', price: 139.90, unitLabel: 'kg' }, { id: 'opt-und', label: 'Por Unidade / Peça', price: 70.00, unitLabel: 'unidade' } ] },
  { name: 'Cupim de Cupinzeiro', category: 'Carne de Boi', price: 139.90, unit: 'kg', description: 'Cupim fatiado e assado na brasa.', available: true, isMarmita: false, estoque: 5, sellOptions: [ { id: 'opt-kg', label: 'Por Quilo (kg)', price: 139.90, unitLabel: 'kg' }, { id: 'opt-fatia', label: 'Por Fatia (~300g)', price: 42.00, unitLabel: 'fatia' } ] },
  { name: 'Fraldinha Especial', category: 'Carne de Boi', price: 139.90, unit: 'kg', description: 'Corte fino de fraldinha grelhada na brasa.', available: true, isMarmita: false, estoque: 6, sellOptions: [ { id: 'opt-kg', label: 'Por Quilo (kg)', price: 139.90, unitLabel: 'kg' }, { id: 'opt-fatia', label: 'Por Fatia (~300g)', price: 42.00, unitLabel: 'fatia' } ] },
  { name: 'Maminha Selecionada', category: 'Carne de Boi', price: 139.90, unit: 'kg', description: 'Maminha com capa delicada de gordura.', available: true, isMarmita: false, estoque: 5, sellOptions: [ { id: 'opt-kg', label: 'Por Quilo (kg)', price: 139.90, unitLabel: 'kg' }, { id: 'opt-fatia', label: 'Por Fatia (~300g)', price: 42.00, unitLabel: 'fatia' } ] },
  { name: 'Frango Selado na Brasa', category: 'Carne de Frango', price: 59.90, unit: 'unidade', description: 'Frango assado na brasa com tempero de ervas.', available: true, isMarmita: false, estoque: 10 },
  { name: 'Meio Frango Assado', category: 'Carne de Frango', price: 35.00, unit: 'unidade', description: 'Metade do frango de máquina.', available: true, isMarmita: false, estoque: 10 },
  { name: 'Coxa com Sobrecoxa', category: 'Carne de Frango', price: 59.90, unit: 'kg', description: 'Coxa e sobrecoxa marinadas.', available: true, isMarmita: false, estoque: 15, sellOptions: [ { id: 'opt-kg', label: 'Por Quilo (kg)', price: 59.90, unitLabel: 'kg' }, { id: 'opt-und', label: 'Por Unidade / Peça', price: 19.00, unitLabel: 'unidade' } ] },
  { name: 'Medalhão de Frango c/ Bacon', category: 'Carne de Frango', price: 109.90, unit: 'kg', description: 'Cubos selecionados de peito de frango.', available: true, isMarmita: false, estoque: 10, sellOptions: [ { id: 'opt-kg', label: 'Por Quilo (kg)', price: 109.90, unitLabel: 'kg' }, { id: 'opt-und', label: 'Por Unidade / Espeto', price: 32.00, unitLabel: 'unidade' } ] },
  { name: 'Espetinho de Coração', category: 'Carne de Frango', price: 12.00, unit: 'unidade', description: 'Coraçõezinhos de frango temperados.', available: true, isMarmita: false, estoque: 20 },
  { name: 'Panceta Pururuca', category: 'Carne de Porco', price: 79.90, unit: 'kg', description: 'Panceta suína com pele pururucada.', available: true, isMarmita: false, estoque: 8, sellOptions: [ { id: 'opt-kg', label: 'Por Quilo (kg)', price: 79.90, unitLabel: 'kg' }, { id: 'opt-fatia', label: 'Por Fatia (~300g)', price: 24.00, unitLabel: 'fatia' } ] },
  { name: 'Linguiça de Porco na Brasa', category: 'Carne de Porco', price: 59.90, unit: 'kg', description: 'Linguiça artesanal suína temperada.', available: true, isMarmita: false, estoque: 15, sellOptions: [ { id: 'opt-kg', label: 'Por Quilo (kg)', price: 59.90, unitLabel: 'kg' }, { id: 'opt-und', label: 'Por Unidade / Gomo', price: 16.00, unitLabel: 'unidade' } ] },
  { name: 'Medalhão de Porco c/ Bacon', category: 'Carne de Porco', price: 109.90, unit: 'kg', description: 'Gomos de lombo suíno temperado.', available: true, isMarmita: false, estoque: 10, sellOptions: [ { id: 'opt-kg', label: 'Por Quilo (kg)', price: 109.90, unitLabel: 'kg' }, { id: 'opt-und', label: 'Por Unidade / Espeto', price: 32.00, unitLabel: 'unidade' } ] },
  { name: 'Arroz à Grega', category: 'Acompanhamentos & Saladas', price: 49.90, unit: 'kg', description: 'Arroz soltinho.', available: true, isMarmita: false, estoque: 10, sellOptions: [ { id: 'opt-kg', label: 'Por Quilo (kg)', price: 49.90, unitLabel: 'kg' }, { id: 'opt-pm', label: 'Porção M (~500g)', price: 25.00, unitLabel: 'porção M' }, { id: 'opt-pg', label: 'Porção G (~1kg)', price: 49.90, unitLabel: 'porção G' } ] },
  { name: 'Risoto de Frango', category: 'Acompanhamentos & Saladas', price: 49.90, unit: 'kg', description: 'Suculento risoto caseiro.', available: true, isMarmita: false, estoque: 10, sellOptions: [ { id: 'opt-kg', label: 'Por Quilo (kg)', price: 49.90, unitLabel: 'kg' }, { id: 'opt-pm', label: 'Porção M (~500g)', price: 25.00, unitLabel: 'porção M' }, { id: 'opt-pg', label: 'Porção G (~1kg)', price: 49.90, unitLabel: 'porção G' } ] },
  { name: 'Maionese Verde com Cheiro Verde', category: 'Acompanhamentos & Saladas', price: 49.90, unit: 'kg', description: 'Maionese refrescante.', available: true, isMarmita: false, estoque: 10, sellOptions: [ { id: 'opt-kg', label: 'Por Quilo (kg)', price: 49.90, unitLabel: 'kg' }, { id: 'opt-pm', label: 'Porção M (~500g)', price: 25.00, unitLabel: 'porção M' }, { id: 'opt-pg', label: 'Porção G (~1kg)', price: 49.90, unitLabel: 'porção G' } ] },
  { name: 'Salpicão de Frango', category: 'Acompanhamentos & Saladas', price: 49.90, unit: 'kg', description: 'Frango desfiado com maionese cremosa.', available: true, isMarmita: false, estoque: 8, sellOptions: [ { id: 'opt-kg', label: 'Por Quilo (kg)', price: 49.90, unitLabel: 'kg' }, { id: 'opt-pm', label: 'Porção M (~500g)', price: 25.00, unitLabel: 'porção M' }, { id: 'opt-pg', label: 'Porção G (~1kg)', price: 49.90, unitLabel: 'porção G' } ] },
  { name: 'Farofa Especial da Casa', category: 'Acompanhamentos & Saladas', price: 49.90, unit: 'kg', description: 'Farofa de mandioca.', available: true, isMarmita: false, estoque: 10, sellOptions: [ { id: 'opt-kg', label: 'Por Quilo (kg)', price: 49.90, unitLabel: 'kg' }, { id: 'opt-pm', label: 'Porção M (~500g)', price: 25.00, unitLabel: 'porção M' }, { id: 'opt-pg', label: 'Porção G (~1kg)', price: 49.90, unitLabel: 'porção G' } ] },
  { name: 'Nhoque Receita Dona Isa', category: 'Acompanhamentos & Saladas', price: 15.00, unit: 'unidade', description: 'Tradicional nhoque de batata.', available: true, isMarmita: false, estoque: 15 },
  { name: 'Macarronese Especial', category: 'Acompanhamentos & Saladas', price: 15.00, unit: 'unidade', description: 'Salada cremosa de macarrão.', available: true, isMarmita: false, estoque: 15 },
  { name: 'Polenta Frita Crocante', category: 'Acompanhamentos & Saladas', price: 15.00, unit: 'unidade', description: 'Polenta frita em palitos.', available: true, isMarmita: false, estoque: 15 },
  { name: 'Batata Frita Rodela', category: 'Acompanhamentos & Saladas', price: 12.00, unit: 'unidade', description: 'Batatas em rodelas fritas.', available: true, isMarmita: false, estoque: 15 },
  { name: 'Banana Frita ao Leite', category: 'Acompanhamentos & Saladas', price: 12.00, unit: 'unidade', description: 'Bananas ao leite empanadas.', available: true, isMarmita: false, estoque: 15 },
  { name: 'Salada de Feijão Cavalo', category: 'Acompanhamentos & Saladas', price: 10.00, unit: 'unidade', description: 'Salada temperada.', available: true, isMarmita: false, estoque: 8 },
  { name: 'Salada de Repolho Cozido', category: 'Acompanhamentos & Saladas', price: 10.00, unit: 'unidade', description: 'Salada leve.', available: true, isMarmita: false, estoque: 8 },
  { name: 'Salada de Tomate c/ Cebola', category: 'Acompanhamentos & Saladas', price: 10.00, unit: 'unidade', description: 'Rodelas de tomate fresco.', available: true, isMarmita: false, estoque: 8 },
  { name: 'Salada de Vagem', category: 'Acompanhamentos & Saladas', price: 10.00, unit: 'unidade', description: 'Salada de vagem verde.', available: true, isMarmita: false, estoque: 8 },
  { name: 'Coca-Cola 2 Litros', category: 'Bebidas Geladas', price: 16.00, unit: 'unidade', description: 'Garrafa 2L.', available: true, isMarmita: false, estoque: 40 },
  { name: 'Guaraná Antarctica 2 Litros', category: 'Bebidas Geladas', price: 14.00, unit: 'unidade', description: 'Garrafa 2L.', available: true, isMarmita: false, estoque: 40 },
  { name: 'Coca-Cola Lata 350ml', category: 'Bebidas Geladas', price: 7.00, unit: 'unidade', description: 'Lata 350ml.', available: true, isMarmita: false, estoque: 50 },
  { name: 'Guaraná Antarctica Lata 350ml', category: 'Bebidas Geladas', price: 6.50, unit: 'unidade', description: 'Lata 350ml.', available: true, isMarmita: false, estoque: 50 },
  { name: 'Água Mineral sem Gás 500ml', category: 'Bebidas Geladas', price: 4.50, unit: 'unidade', description: 'Garrafa 500ml.', available: true, isMarmita: false, estoque: 30 },
  { name: 'Cerveja Heineken Long Neck 330ml', category: 'Bebidas Geladas', price: 12.00, unit: 'unidade', description: 'Garrafa 330ml.', available: true, isMarmita: false, estoque: 50 }
];

async function populate() {
  console.log("Iniciando população V2 da tabela Produtos...");
  
  // Limpar a tabela antes de popular
  await supabase.from('Produtos').delete().neq('id', '00000000-0000-0000-0000-000000000000');

  const rowsToInsert = menuData.map((item, index) => {
    // Definir peso mínimo e máximo padrão dependendo da unidade
    let pMin = null;
    let pMax = null;
    
    if (item.unit === 'kg') {
      pMin = 0.3; // 300g
      pMax = 2.5; // 2.5kg
    }

    return {
      nome: item.name,
      categoria: item.category,
      preco_base: item.price,
      unidade_base: item.unit,
      descricao: item.description,
      disponibilidade: item.available,
      opcoes_venda: item.sellOptions && item.sellOptions.length > 0 ? item.sellOptions : null,
      is_marmita: item.isMarmita,
      id_painel: idPainelMap[item.name] || null,
      id_balanca: null, // Será preenchido manualmente no painel
      numero_item: index + 1, // Restaura a coluna position da tabela antiga
      peso_minimo: pMin,
      peso_maximo: pMax,
      estoque_inicial: item.estoque, // Estoque realista para cada item
      estoque_vendido: 0,
      margem_seguranca: 1,
      trava_venda: false
    };
  });

  const { data, error } = await supabase.from('Produtos').insert(rowsToInsert).select();
  
  if (error) {
    console.error("Erro ao inserir:", error);
  } else {
    console.log(`Sucesso! ${data.length} produtos inseridos com números de itens (posições), margens e pesos!`);
  }
}

populate();
