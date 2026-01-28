import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { MainLayout } from '../layout/MainLayout';
import { AuthLayout } from '../layout/AuthLayout';
import { useAuthStore } from '../stores/authStore';
import { getPrimeiraRotaPermitida } from '../../shared/utils/routeUtils';

import { Login } from '../../features/auth/pages/Login';
import { SemPermissoes } from '../../features/auth/pages/SemPermissoes';
import { Dashboard } from '../../features/dashboard/pages/Dashboard';
import { ListaUsuarios } from '../../features/usuarios/pages/ListaUsuarios';
import { CriarUsuario } from '../../features/usuarios/pages/CriarUsuario';
import { EditarUsuario } from '../../features/usuarios/pages/EditarUsuario';
import { GerenciarPermissoes } from '../../features/permissoes/pages/GerenciarPermissoes';

import { ListaMembros } from '../../features/membros/pages/ListaMembros';
import { CadastrarMembro } from '../../features/membros/pages/CadastrarMembro';
import { EditarMembro } from '../../features/membros/pages/EditarMembro';
import { DetalhesMembro } from '../../features/membros/pages/DetalhesMembro';

import { ListaFinanceiro } from '../../features/financeiro/pages/ListaFinanceiro';
import { CadastrarFinanceiro } from '../../features/financeiro/pages/CadastrarFinanceiro';
import { EditarFinanceiro } from '../../features/financeiro/pages/EditarFinanceiro';
import { DetalhesFinanceiro } from '../../features/financeiro/pages/DetalhesFinanceiro';

import { ListaAssistenciaSocial } from '../../features/assistencia-social/pages/ListaAssistenciaSocial';
import { CadastrarAssistenciaSocial } from '../../features/assistencia-social/pages/CadastrarAssistenciaSocial';
import { EditarAssistenciaSocial } from '../../features/assistencia-social/pages/EditarAssistenciaSocial';
import { DetalhesAssistenciaSocial } from '../../features/assistencia-social/pages/DetalhesAssistenciaSocial';

const DefaultRedirect = () => {
  const { role, permissoes } = useAuthStore();
  
  if (role === 'ADMIN') {
    return <Navigate to="/dashboard" replace />;
  }
  
  if (role === 'USER') {
    if (permissoes.length === 0) {
      return <Navigate to="/sem-permissoes" replace />;
    }
    
    const primeiraRota = getPrimeiraRotaPermitida(permissoes);
    if (primeiraRota) {
      return <Navigate to={primeiraRota} replace />;
    }
    
    return <Navigate to="/sem-permissoes" replace />;
  }
  
  return <Navigate to="/login" replace />;
};

export const AppRouter = () => {
  return (
    <Routes>
        {/* Public Routes */}
        <Route
          path="/login"
          element={
            <AuthLayout>
              <Login />
            </AuthLayout>
          }
        />

        {/* Protected Routes */}
        <Route
          path="/sem-permissoes"
          element={
            <ProtectedRoute>
              <MainLayout>
                <SemPermissoes />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute roles={['ADMIN', 'USER']} telaId="dashboard">
              <MainLayout>
                <Dashboard />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        {/* Usuários - Admin only */}
        <Route
          path="/usuarios"
          element={
            <ProtectedRoute roles={['ADMIN']}>
              <MainLayout>
                <ListaUsuarios />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/usuarios/novo"
          element={
            <ProtectedRoute roles={['ADMIN']}>
              <MainLayout>
                <CriarUsuario />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/usuarios/:id/editar"
          element={
            <ProtectedRoute roles={['ADMIN']}>
              <MainLayout>
                <EditarUsuario />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/usuarios/permissoes"
          element={
            <ProtectedRoute roles={['ADMIN']}>
              <MainLayout>
                <GerenciarPermissoes />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        {/* Membros */}
        <Route
          path="/membros"
          element={
            <ProtectedRoute roles={['ADMIN', 'USER']} telaId="membros">
              <MainLayout>
                <ListaMembros />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/membros/novo"
          element={
            <ProtectedRoute roles={['ADMIN', 'USER']} telaId="membros-novo">
              <MainLayout>
                <CadastrarMembro />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/membros/:id"
          element={
            <ProtectedRoute roles={['ADMIN', 'USER']} telaId="membros-detalhes">
              <MainLayout>
                <DetalhesMembro />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/membros/:id/editar"
          element={
            <ProtectedRoute roles={['ADMIN', 'USER']} telaId="membros-editar">
              <MainLayout>
                <EditarMembro />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        {/* Financeiro */}
        <Route
          path="/financeiro"
          element={
            <ProtectedRoute roles={['ADMIN', 'USER']} telaId="financeiro">
              <MainLayout>
                <ListaFinanceiro />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/financeiro/novo"
          element={
            <ProtectedRoute roles={['ADMIN', 'USER']} telaId="financeiro-novo">
              <MainLayout>
                <CadastrarFinanceiro />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/financeiro/:id"
          element={
            <ProtectedRoute roles={['ADMIN', 'USER']} telaId="financeiro-detalhes">
              <MainLayout>
                <DetalhesFinanceiro />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/financeiro/:id/editar"
          element={
            <ProtectedRoute roles={['ADMIN', 'USER']} telaId="financeiro-editar">
              <MainLayout>
                <EditarFinanceiro />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        {/* Assistência Social */}
        <Route
          path="/assistencia-social"
          element={
            <ProtectedRoute roles={['ADMIN', 'USER']} telaId="assistencia-social">
              <MainLayout>
                <ListaAssistenciaSocial />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/assistencia-social/novo"
          element={
            <ProtectedRoute roles={['ADMIN', 'USER']} telaId="assistencia-social-novo">
              <MainLayout>
                <CadastrarAssistenciaSocial />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/assistencia-social/:id"
          element={
            <ProtectedRoute roles={['ADMIN', 'USER']} telaId="assistencia-social-detalhes">
              <MainLayout>
                <DetalhesAssistenciaSocial />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/assistencia-social/:id/editar"
          element={
            <ProtectedRoute roles={['ADMIN', 'USER']} telaId="assistencia-social-editar">
              <MainLayout>
                <EditarAssistenciaSocial />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        {/* Default redirect */}
        <Route path="/" element={<DefaultRedirect />} />
        <Route path="*" element={<DefaultRedirect />} />
      </Routes>
  );
};

