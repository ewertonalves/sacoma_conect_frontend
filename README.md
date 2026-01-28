# Sacoma Conect

Aplicação web front-end desenvolvida em React para gestão administrativa de uma organização cristã, incluindo controle de membros, gestão financeira, assistência social e sistema de permissões de usuários.

## Visão Geral

O Sacoma Conect é uma aplicação SPA (Single Page Application) que oferece uma interface moderna e intuitiva para gerenciar diversos aspectos administrativos de uma organização cristã. A aplicação possui sistema de autenticação e autorização baseado em roles (ADMIN e USER), com controle granular de permissões por telas.

## Tecnologias Utilizadas

- **React 19.2.0** - Biblioteca JavaScript para construção de interfaces
- **TypeScript 5.9.3** - Superset do JavaScript com tipagem estática
- **Vite 7.2.4** - Build tool e dev server de alta performance
- **React Router DOM 7.11.0** - Roteamento para aplicações React
- **Zustand** - Gerenciamento de estado global leve e simples
- **Axios 1.13.2** - Cliente HTTP para requisições à API
- **React Hook Form 7.69.0** - Biblioteca para gerenciamento de formulários
- **Zod 4.2.1** - Validação de schemas TypeScript-first
- **Tailwind CSS 4.1.18** - Framework CSS utility-first
- **Lucide React 0.562.0** - Biblioteca de ícones

## Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- **Node.js** versão 18 ou superior
- **npm** ou **yarn** como gerenciador de pacotes
- Backend da aplicação rodando e acessível (API REST)

## Instalação

1. Clone o repositório ou navegue até o diretório do projeto:
```bash
cd sacoma-conect
```

2. Instale as dependências do projeto:
```bash
npm install
```

## Configuração

### Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:

```env
VITE_API_BASE_URL=http://localhost:8080/api
```

A variável `VITE_API_BASE_URL` define a URL base da API backend. Se não for definida, o padrão será `http://localhost:8080/api`.

## Executando a Aplicação

### Modo de Desenvolvimento

Para iniciar o servidor de desenvolvimento com hot-reload:

```bash
npm run dev
```

A aplicação estará disponível em `http://localhost:5173` (ou outra porta se 5173 estiver em uso).

### Build de Produção

Para gerar o build de produção:

```bash
npm run build
```

Os arquivos otimizados serão gerados na pasta `dist/`.

### Preview do Build

Para visualizar o build de produção localmente:

```bash
npm run preview
```

### Linting

Para verificar problemas de código:

```bash
npm run lint
```

## Estrutura do Projeto

```
sacoma-conect/
├── public/                 # Arquivos estáticos públicos
├── src/
│   ├── app/               # Configuração da aplicação
│   │   ├── layout/        # Layouts da aplicação
│   │   │   ├── AuthLayout.tsx      # Layout para páginas de autenticação
│   │   │   ├── MainLayout.tsx      # Layout principal com sidebar e header
│   │   │   └── components/         # Componentes de layout (Header, Sidebar, Footer)
│   │   ├── providers/     # Context providers
│   │   │   ├── AuthProvider.tsx    # Provider de autenticação
│   │   │   └── ToastProvider.tsx   # Provider de notificações
│   │   ├── router/        # Configuração de rotas
│   │   │   ├── AppRouter.tsx       # Definição de todas as rotas
│   │   │   ├── AuthGuard.tsx       # Guard de autenticação
│   │   │   └── ProtectedRoute.tsx  # Componente de rota protegida
│   │   └── stores/        # Stores do Zustand
│   │       ├── authStore.ts        # Store de autenticação
│   │       └── uiStore.ts          # Store de estado da UI
│   ├── assets/            # Recursos estáticos (imagens, etc)
│   ├── features/          # Módulos de funcionalidades
│   │   ├── assistencia-social/    # Gestão de assistência social
│   │   ├── auth/                  # Autenticação e login
│   │   ├── dashboard/             # Dashboard principal
│   │   ├── financeiro/            # Gestão financeira
│   │   ├── membros/               # Gestão de membros
│   │   ├── permissoes/            # Gestão de permissões
│   │   └── usuarios/              # Gestão de usuários
│   ├── shared/            # Código compartilhado
│   │   ├── api/          # Configuração da API
│   │   │   ├── client.ts          # Cliente Axios configurado
│   │   │   └── endpoints.ts       # Definição de endpoints
│   │   ├── hooks/        # Hooks customizados
│   │   ├── lib/          # Bibliotecas e utilitários
│   │   │   ├── constants/         # Constantes da aplicação
│   │   │   ├── formatters/        # Funções de formatação
│   │   │   ├── schemas/           # Schemas Zod para validação
│   │   │   └── validators/        # Validadores customizados
│   │   ├── services/     # Serviços compartilhados
│   │   ├── types/        # Definições de tipos TypeScript
│   │   ├── ui/           # Componentes UI reutilizáveis
│   │   │   ├── Badge/
│   │   │   ├── Button/
│   │   │   ├── Card/
│   │   │   ├── ConfirmModal/
│   │   │   ├── Input/
│   │   │   ├── Loading/
│   │   │   ├── Modal/
│   │   │   ├── Select/
│   │   │   ├── Table/
│   │   │   └── Textarea/
│   │   └── utils/        # Funções utilitárias
│   ├── index.css         # Estilos globais
│   └── main.tsx          # Ponto de entrada da aplicação
├── .gitignore
├── eslint.config.js      # Configuração do ESLint
├── package.json
├── postcss.config.js     # Configuração do PostCSS
├── tailwind.config.js    # Configuração do Tailwind CSS
├── tsconfig.json         # Configuração do TypeScript
└── vite.config.ts        # Configuração do Vite
```

## Funcionalidades Principais

### Autenticação e Autorização

- Login de usuários com email e senha
- Sistema de roles: **ADMIN** e **USER**
- Controle granular de permissões por telas
- Proteção de rotas baseada em roles e permissões
- Redirecionamento automático baseado no perfil do usuário
- Persistência de sessão via localStorage

### Gestão de Usuários (Apenas ADMIN)

- Listagem de todos os usuários cadastrados
- Criação de novos usuários
- Edição de usuários existentes
- Promoção/rebaixamento de roles (ADMIN/USER)
- Gerenciamento de permissões por usuário

### Gestão de Membros

- Listagem de membros com busca avançada
- Cadastro de novos membros com dados completos
- Visualização de detalhes do membro
- Edição de informações do membro
- Busca por nome, CPF ou RI (Registro de Identidade)
- Integração com serviço de CEP para preenchimento automático de endereço

### Gestão Financeira

- Controle de entradas e saídas financeiras
- Tipos de transações: Dízimo, Despesas, Reformas, Ofertas
- Associação de transações com membros
- Visualização de saldo
- Busca por tipo ou membro
- Registro de observações

### Assistência Social

- Cadastro de alimentos e produtos
- Controle de quantidade e validade
- Gestão de cestas básicas
- Registro de famílias beneficiadas
- Controle de entregas

### Dashboard

- Visão geral da organização
- Estatísticas e métricas principais
- Acesso rápido às funcionalidades principais

## Arquitetura e Padrões

### Arquitetura por Features

A aplicação segue uma arquitetura baseada em features, onde cada módulo funcional possui sua própria estrutura:

- **pages/**: Componentes de página
- **services/**: Serviços de comunicação com a API
- **css/**: Estilos específicos da feature

### Gerenciamento de Estado

- **Zustand** para estado global (autenticação, UI)
- **React Hook Form** para estado de formulários
- Estado local com hooks do React quando apropriado

### Roteamento

- **React Router DOM** para navegação
- Rotas protegidas com `ProtectedRoute`
- Redirecionamento inteligente baseado em permissões
- Guards de autenticação e autorização

### Comunicação com API

- Cliente Axios configurado com interceptors
- Tratamento centralizado de erros
- Injeção automática de token de autenticação
- Timeout configurado para requisições
- Tratamento de erros 401, 403 e 500

### Validação de Formulários

- **React Hook Form** para gerenciamento de formulários
- **Zod** para validação de schemas
- Validação client-side e server-side
- Mensagens de erro personalizadas

### Componentes UI

Componentes reutilizáveis organizados em `shared/ui/`:

- **Badge**: Exibição de status e labels
- **Button**: Botões padronizados
- **Card**: Containers de conteúdo
- **ConfirmModal**: Modais de confirmação
- **Input**: Campos de entrada de texto
- **Loading**: Indicadores de carregamento
- **Modal**: Modais genéricos
- **Select**: Seletores dropdown
- **Table**: Tabelas de dados
- **Textarea**: Áreas de texto

## Fluxo de Autenticação

1. Usuário acessa a aplicação
2. Se não autenticado, é redirecionado para `/login`
3. Após login bem-sucedido:
   - Token e dados do usuário são salvos no localStorage
   - Permissões são carregadas (se USER)
   - Redirecionamento baseado no role:
     - **ADMIN**: `/dashboard`
     - **USER**: Primeira rota permitida ou `/sem-permissoes`
4. Rotas protegidas verificam autenticação e permissões
5. Token é injetado automaticamente em todas as requisições
6. Em caso de 401, logout automático e redirecionamento para login

## Permissões e Controle de Acesso

### Roles

- **ADMIN**: Acesso completo a todas as funcionalidades
- **USER**: Acesso limitado baseado em permissões de telas

### Sistema de Permissões

- Cada tela possui um ID único (`telaId`)
- Usuários USER recebem permissões específicas por tela
- Verificação de permissão antes de renderizar componentes
- Redirecionamento para `/sem-permissoes` se não houver permissões

## Desenvolvimento

### Adicionando uma Nova Feature

1. Crie a estrutura de pastas em `src/features/nova-feature/`:
   ```
   nova-feature/
   ├── pages/
   │   └── css/
   └── services/
   ```

2. Crie os componentes de página necessários
3. Crie o serviço de comunicação com a API
4. Adicione as rotas em `src/app/router/AppRouter.tsx`
5. Adicione os endpoints em `src/shared/api/endpoints.ts`
6. Configure as permissões necessárias no backend

### Adicionando um Novo Componente UI

1. Crie a pasta do componente em `src/shared/ui/`
2. Implemente o componente seguindo os padrões existentes
3. Exporte o componente para uso em outras partes da aplicação

### Padrões de Código

- Use TypeScript para tipagem forte
- Siga os padrões de nomenclatura existentes
- Componentes em PascalCase
- Arquivos de serviço em camelCase com sufixo `Service`
- Hooks customizados com prefixo `use`

## Scripts Disponíveis

- `npm run dev`: Inicia o servidor de desenvolvimento
- `npm run build`: Gera o build de produção
- `npm run preview`: Visualiza o build de produção
- `npm run lint`: Executa o linter para verificar código

## Dependências Principais

### Produção

- `react` e `react-dom`: Biblioteca React
- `react-router-dom`: Roteamento
- `axios`: Cliente HTTP
- `react-hook-form`: Gerenciamento de formulários
- `zod`: Validação de schemas
- `zustand`: Gerenciamento de estado
- `lucide-react`: Ícones

### Desenvolvimento

- `vite`: Build tool
- `typescript`: TypeScript compiler
- `tailwindcss`: Framework CSS
- `eslint`: Linter
- `@vitejs/plugin-react`: Plugin React para Vite

## Notas Importantes

- A aplicação requer um backend API REST funcionando
- O token de autenticação é armazenado no localStorage
- Todas as requisições (exceto login/cadastro) incluem o token no header Authorization
- A aplicação trata automaticamente erros 401 (não autorizado) fazendo logout
- O sistema de permissões é baseado em IDs de telas configurados no backend
