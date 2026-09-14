# 🍗 Vaguinho Food Delivery & Operations Platform

[![Live App](https://img.shields.io/badge/Production%20URL-assados--vaguinho.grasciano.com.br-success?style=for-the-badge&logo=google-chrome&logoColor=white)](https://assados-vaguinho.grasciano.com.br)

[![Frontend](https://img.shields.io/badge/Frontend-React%2019%20%7C%20TypeScript%20%7C%20Vite-61DAFB.svg)](https://react.dev/)
[![UI](https://img.shields.io/badge/UI-Tailwind%20CSS%20%7C%20Shadcn%20UI-38B2AC.svg)](https://ui.shadcn.com/)
[![Database](https://img.shields.io/badge/Backend-Supabase%20PostgreSQL-emerald.svg)](https://supabase.com/)
[![Automation](https://img.shields.io/badge/Automation-n8n%20%7C%20WhatsApp%20API-FF6584.svg)](https://n8n.io/)

> 🤖 **Nota de Transparência**: A documentação técnica, diagramas e estruturação deste repositório foram gerados/organizados de forma automatizada com assistência de Inteligência Artificial (Google DeepMind Antigravity / Gemini), com base no código-fonte, capturas de tela e fluxos de automação originais desenvolvidos pelo autor.

---

## 🌐 Acesso em Produção

A aplicação web do cliente está publicada e acessível em:  
👉 **[https://assados-vaguinho.grasciano.com.br](https://assados-vaguinho.grasciano.com.br)**

---

## 📱 Demonstração Visual da Aplicação Mobile (PWA)

> **Interface real em produção no smartphone:** Navegação rápida, personalização de carnes e guarnições, carrinho deslizante e checkout automático:

<p align="center">
  <img src="./cliente-pwa/screenshots/app%20clientes%201.jpeg" width="18%" alt="Cardápio Principal" />
  <img src="./cliente-pwa/screenshots/app%20clientes%202.jpeg" width="18%" alt="Personalização de Produto" />
  <img src="./cliente-pwa/screenshots/app%20clientes%203.jpeg" width="18%" alt="Acompanhamentos" />
  <img src="./cliente-pwa/screenshots/app%20clientes%204.jpeg" width="18%" alt="Carrinho Deslizante" />
  <img src="./cliente-pwa/screenshots/app%20clientes%205.jpeg" width="18%" alt="Checkout" />
</p>

---

## 📱 Visão Geral da Solução Comercial

**Plataforma comercial e operacional completa para gastronomia e delivery**, desenvolvida para o restaurante *Assados na Brasa Vaguinho*. O projeto resolve integralmente o ciclo de vida do pedido: desde o autoatendimento e carrinho digital do consumidor até a gestão de estoque em tempo real na cozinha e campanhas ativas de WhatsApp com proteção antiban.

### 2. Painel Administrativo de Cozinha (Shadcn UI + Supabase Realtime)
Permite aos operadores da cozinha e administradores alterar a disponibilidade de carnes e guarnições com atualização instantânea na ponta do cliente via WebSockets:

- **Controle de Estoque em Tempo Real**: Switches para marcar itens como *Disponível* ou *Esgotado*.
- **Indicador de Status Global**: Métricas ao vivo de itens cadastrados e prontos para venda.
- **Suporte a PWA**: Banner para instalação direta no celular da equipe de balcão.

---

## 🏗️ Arquitetura do Sistema

```
                        ┌────────────────────────┐
                        │   CLIENTE FINAL (PWA)  │
                        │      (cliente-pwa)     │
                        └───────────┬────────────┘
                                    │ Pedidos via WebSockets / Checkout WhatsApp
                                    ▼
┌────────────────────────┐      ┌────────────────────────┐
│  PAINEL OPERACIONAL    │◄────►│   SUPABASE DATABASE    │
│    (painel-admin)      │      │ (Postgres & Realtime)  │
└────────────────────────┘      └───────────▲────────────┘
 Gestão de Estoque e Comandas               │
 com Atualização em Tempo Real              │ Gatilho de Campanhas
                                            ▼
                                ┌────────────────────────┐
                                │   ROBÔ DE MARKETING    │
                                │(n8n + Z-API + GPT-4o)  │
                                └────────────────────────┘
```

---

## ⚙️ Detalhamento dos Componentes

### 1. Aplicativo do Cliente (`cliente-pwa/`)
- **Framework**: React 19 + TypeScript + Vite.
- **Experiência do Consumidor**:
  - Modal customizador de pedidos (`ProductCustomizerModal.tsx`).
  - Drawer dinâmico de carrinho de compras (`CartDrawer.tsx`).
  - Persistência de dados locais com `StoreContext` e autenticação com `AuthContext`.
  - Integração de checkout com envio formatado automático para o WhatsApp do restaurante.

### 2. Painel de Operações da Cozinha (`painel-admin/`)
- **Design System**: Shadcn UI + Radix UI + Tailwind CSS.
- **Sincronização em Tempo Real**: Assinatura de canais do Supabase Realtime para que alterações de disponibilidade feitas no painel reflitam sem recarregar no app dos clientes.

### 3. Robô de Marketing Anti-Ban no WhatsApp (`marketing-automacao-n8n/`)
- **Aquecimento Progressivo de Chip (*Warm-up Control*)**:
  - Algoritmo que escalona os disparos diários para proteger o número contra bloqueios do WhatsApp:
    - *Dia 1*: 3 disparos/hora (delay de 800s a 1000s)
    - *Dia 2*: 7 disparos/hora (delay de 300s a 450s)
    - *Dia 3*: 12 disparos/hora (delay de 61s a 240s)
    - *Dia 4*: 4 disparos/hora
    - *Dia 5*: 5 disparos/hora
    - *Dia 6 a 10*: Progressão controlada até 180 contatos/hora
- **Jitter & Random Delays**: Delays aleatórios entre envios calculados via nó JavaScript para simular comportamento humano.
- **Copywriting com IA (OpenAI GPT-4o)**: Nó LangChain Agent no n8n que personaliza a saudação ("Sr" ou "Sra") e a chamada da mensagem para cada contato.
- **Workflow de Cancelamento de Inscrição (*Unsubscribe*)**: Respeito integral às normas de privacidade — se o cliente clicar no botão *"❌ Não quero receber ofertas"*, o webhook desativa imediatamente os envios e atualiza a planilha de contatos.

---

## 📂 Estrutura do Repositório

```bash
vaguinho-food-delivery-platform/
├── cliente-pwa/                  # Web App do consumidor final (React 19, TypeScript, Tailwind)
│   ├── src/                      # Componentes, telas e fluxo de pedidos
│   ├── screenshots/              # Capturas de tela do app em funcionamento
│   ├── Dockerfile                # Containerização para deploy
│   └── nginx.conf                # Configuração de proxy reverso e cache
├── painel-admin/                 # Dashboard administrativo (Shadcn UI, Radix, Tailwind)
│   ├── src/components/ui/        # Componentes reutilizáveis (Dialogs, Badges, Tabs, etc.)
│   └── src/                      # Telas de controle de estoque e comandas
└── marketing-automacao-n8n/      # Fluxos de automação n8n e controle de disparos
    ├── disparador-antiban-whatsapp-vaguinho.json # Fluxo completo higienizado
    └── Controle envios.xlsx
```

---

## 👨‍💻 Autor

Desenvolvido por **Enzo Grasciano de Figueiredo**  
Universidade Federal do Paraná (UFPR)  
E-mail: enzo.g.figueiredo@gmail.com  
GitHub: [@enzo-grasciano-de-figueiredo](https://github.com/enzo-grasciano-de-figueiredo)
