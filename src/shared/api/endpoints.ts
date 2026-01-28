export const endpoints = {
  auth: {
    login: '/auth/login',
    cadastro: '/auth/cadastro',
    usuarios: {
      list: '/auth/usuarios',
      search: (nome: string) => `/auth/usuarios/buscar/${nome}`,
      update: (id: number) => `/auth/usuarios/${id}`,
      delete: (id: number) => `/auth/usuarios/${id}`,
      promote: (id: number) => `/auth/usuarios/${id}/promover-admin`,
      demote: (id: number) => `/auth/usuarios/${id}/rebaixar-user`,
    },
  },
  membros: {
    list: '/membros',
    get: (id: number) => `/membros/${id}`,
    create: '/membros',
    update: (id: number) => `/membros/${id}`,
    delete: (id: number) => `/membros/${id}`,
    search: {
      byName: (nome: string) => `/membros/buscar/nome/${nome}`,
      byCpf: (cpf: string) => `/membros/buscar/cpf/${cpf}`,
      byRi: (ri: string) => `/membros/buscar/ri/${ri}`,
    },
  },
  financeiro: {
    list: '/financeiro',
    get: (id: number) => `/financeiro/${id}`,
    create: '/financeiro',
    update: (id: number) => `/financeiro/${id}`,
    delete: (id: number) => `/financeiro/${id}`,
    search: {
      byType: (tipo: string) => `/financeiro/buscar/tipo/${tipo}`,
      byMember: (membroId: number) => `/financeiro/buscar/membro/${membroId}`,
    },
  },
  cep: {
    buscar: (cep: string) => `/cep/${cep}`,
  },
  permissoes: {
    list: '/permissoes',
    telas: '/permissoes/telas',
    minhas: '/permissoes/minhas',
    usuario: (usuarioId: number) => `/permissoes/usuario/${usuarioId}`,
    update: (usuarioId: number) => `/permissoes/usuario/${usuarioId}`,
  },
  assistenciaSocial: {
    list: '/assistencia-social',
    get: (id: number) => `/assistencia-social/${id}`,
    create: '/assistencia-social',
    update: (id: number) => `/assistencia-social/${id}`,
    delete: (id: number) => `/assistencia-social/${id}`,
  },
};

