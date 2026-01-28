import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../../app/stores/authStore';
import { useUIStore } from '../../../app/stores/uiStore';
import { authService } from '../services/authService';
import { Input } from '../../../shared/ui/Input/Input';
import { Button } from '../../../shared/ui/Button/Button';
import { Card } from '../../../shared/ui/Card/Card';
import './css/Login.css';

const loginSchema = z.object({
  email: z.string().email('Email inválido').min(1, 'Email é obrigatório'),
  senha: z.string().min(1, 'Senha é obrigatória'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const { showNotification } = useUIStore();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
    setValue,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const formRef = useRef<HTMLFormElement>(null);

  const onSubmit = async (data: LoginFormData) => {
    try {
      setLoading(true);
      const response = await authService.login(data);

      if (!response || !response.token || !response.user) {
        throw new Error('Resposta inválida do servidor');
      }

      login(response.token, response.user, response.permissoes || []);

      const savedToken = localStorage.getItem('auth_token');
      const savedUser = localStorage.getItem('auth_user');

      if (!savedToken || !savedUser) {
        throw new Error('Erro ao salvar dados de autenticação');
      }

      showNotification({
        type: 'success',
        message: 'Login realizado com sucesso!',
      });

      await new Promise(resolve => setTimeout(resolve, 200));

      if (response.user.role === 'USER' && (!response.permissoes || response.permissoes.length === 0)) {
        navigate('/sem-permissoes', { replace: true });
      } else if (response.user.role === 'USER' && response.permissoes && response.permissoes.length > 0) {
        const getPrimeiraRotaPermitida = (permissoes: string[]): string => {
          const rotasPorPermissao: Record<string, string> = {
            'dashboard': '/dashboard',
            'membros': '/membros',
            'financeiro': '/financeiro',
            'assistencia-social': '/assistencia-social',
          };
          
          const prioridade = ['dashboard', 'membros', 'financeiro', 'assistencia-social'];
          
          for (const telaId of prioridade) {
            if (permissoes.includes(telaId) || permissoes.some(p => p.startsWith(telaId + '-'))) {
              return rotasPorPermissao[telaId] || '/dashboard';
            }
          }
          
          return '/dashboard';
        };
        
        const primeiraRota = getPrimeiraRotaPermitida(response.permissoes);
        navigate(primeiraRota, { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    } catch (error: any) {
      showNotification({
        type: 'error',
        message: error.message || 'Erro ao fazer login. Verifique suas credenciais.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <div className="login-header">
        <h2 className="login-title">Login</h2>
        <p className="login-subtitle">Entre com suas credenciais</p>
      </div>

      <form 
        ref={formRef}
        onSubmit={(e) => {
          e.preventDefault();

          const formData = new FormData(e.currentTarget);
          const email = formData.get('email') as string;
          const senha = formData.get('senha') as string;

          if (email && !getValues('email')) {
            setValue('email', email);
          }
          if (senha && !getValues('senha')) {
            setValue('senha', senha, { shouldValidate: true, shouldDirty: true });
          }

          handleSubmit(onSubmit)(e);
        }} 
        className="login-form"
      >
        <Input
          label="Email"
          type="email"
          placeholder="exemplo@email.com"
          error={errors.email?.message}
          required
          {...register('email')}
        />

        <Input
          label="Senha"
          type="password"
          placeholder="Digite sua senha"
          showPasswordToggle
          error={errors.senha?.message}
          required
          {...register('senha')}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && loading) {
              e.preventDefault();
            }
          }}
        />

        <Button 
          type="submit" 
          loading={loading} 
          className="login-button"
        >
          Entrar
        </Button>
      </form>
    </Card>
  );
};
