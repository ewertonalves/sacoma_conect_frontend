import { StrictMode, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AppRouter } from './app/router/AppRouter'
import { AuthProvider } from './app/providers/AuthProvider'
import { ToastProvider } from './app/providers/ToastProvider'
import { Loading } from './shared/ui/Loading/Loading'
import './index.css'

const root = document.getElementById('root')

if (!root) {
  throw new Error('Root element not found')
}

createRoot(root).render(
  <StrictMode>
    <Suspense fallback={<Loading fullScreen message="Carregando..." />}>
      <BrowserRouter>
        <ToastProvider>
          <AuthProvider>
            <AppRouter />
          </AuthProvider>
        </ToastProvider>
      </BrowserRouter>
    </Suspense>
  </StrictMode>,
)
