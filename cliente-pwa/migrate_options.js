import { config } from 'dotenv';
config({ path: '.env.local' });
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Faltam variáveis de ambiente VITE_SUPABASE_URL ou VITE_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function migrateOptions() {
  console.log('Iniciando migração de opcoes_venda para Produto_Opcoes...');

  // 1. Buscar todos os produtos que possuem opcoes_venda preenchidas
  const { data: produtos, error: fetchError } = await supabase
    .from('Produtos')
    .select('id, opcoes_venda')
    .not('opcoes_venda', 'is', null);

  if (fetchError) {
    console.error('Erro ao buscar produtos:', fetchError);
    return;
  }

  console.log(`Encontrados ${produtos.length} produtos com opções em JSONB.`);
  
  let insertedCount = 0;

  for (const produto of produtos) {
    try {
      let opcoes = [];
      
      // Lidar com o fato de que pode ser uma string JSON ou já um objeto dependendo de como foi salvo
      if (typeof produto.opcoes_venda === 'string') {
        opcoes = JSON.parse(produto.opcoes_venda);
      } else if (Array.isArray(produto.opcoes_venda)) {
        opcoes = produto.opcoes_venda;
      }

      if (opcoes.length > 0) {
        // Preparar os dados para a nova tabela
        const novasOpcoes = opcoes.map(opt => ({
          produto_id: produto.id,
          titulo: opt.label,
          preco: opt.price,
          unidade: opt.unitLabel || 'un'
        }));

        const { error: insertError } = await supabase
          .from('Produto_Opcoes')
          .insert(novasOpcoes);

        if (insertError) {
          console.error(`Erro ao inserir opções para o produto ${produto.id}:`, insertError);
        } else {
          insertedCount += novasOpcoes.length;
        }
      }
    } catch (e) {
      console.error(`Falha ao dar parse nas opções do produto ${produto.id}:`, e);
    }
  }

  console.log(`Migração concluída! Foram criadas ${insertedCount} opções relacionais.`);
}

migrateOptions();
