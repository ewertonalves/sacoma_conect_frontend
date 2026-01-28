import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { usuarioService } from '../services/usuarioService';
import { Input } from '../../../shared/ui/Input/Input';
import { Select } from '../../../shared/ui/Select/Select';
import { Button } from '../../../shared/ui/Button/Button';
import { Card } from '../../../shared/ui/Card/Card';
import { useUIStore } from '../../../app/stores/uiStore';
import './css/CriarUsuario.css';
import { ROLE_LABELS } from '../../../shared/lib/constants';

const usuarioSchema = z.object({
  nome: z.string().min(3, 'Nome deve ter entre 3 e 120 caracteres').max(120, 'Nome deve ter entre 3 e 120 caracteres'),
  email: z.string().email('Email inválido').min(1, 'Email é obrigatório').max(120, 'Email deve ter no máximo 120 caracteres'),
  senha: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
  role: z.enum(['ADMIN', 'USER']),
});

type UsuarioFormData = z.infer<typeof usuarioSchema>;

export const CriarUsuario = () => {
  const navigate = useNavigate();
  const { showNotification } = useUIStore();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UsuarioFormData>({
    resolver: zodResolver(usuarioSchema),
    defaultValues: {
      role: 'USER',
    },
  });

  const onSubmit = async (data: UsuarioFormData) => {
    try {
      setLoading(true);
      await usuarioService.create(data as any);
      showNotification({
        type: 'success',
        message: 'Usuário criado com sucesso',
      });
      navigate('/usuarios');
    } catch (error: any) {
      showNotification({
        type: 'error',
        message: error.message || 'Erro ao criar usuário',
      });
    } finally {
      setLoading(false);
    }
  };

  const roleOptions = [
    { value: 'USER', label: ROLE_LABELS.USER },
    { value: 'ADMIN', label: ROLE_LABELS.ADMIN },
  ];

  return (
    <div className="criar-usuario-container">
      <div className="criar-usuario-header">
        <h1 className="criar-usuario-title">Novo Usuário</h1>
        <p className="criar-usuario-subtitle">Crie um novo usuário no sistema</p>
      </div>

      <Card>
        <form onSubmit={handleSubmit(onSubmit)} className="criar-usuario-form">
          <Input
            label="Nome completo"
            type="text"
            error={errors.nome?.message}
            required
            {...register('nome')}
          />

          <Input
            label="Email"
            type="email"
            error={errors.email?.message}
            required
            {...register('email')}
          />

          <Input
            label="Senha"
            type="password"
            placeholder="Mínimo 6 caracteres"
            showPasswordToggle
            error={errors.senha?.message}
            required
            {...register('senha')}
          />

          <Select
            label="Perfil"
            options={roleOptions}
            error={errors.role?.message}
            required
            {...register('role')}
          />

          <div className="criar-usuario-actions">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/usuarios')}
            >
              Cancelar
            </Button>
            <Button type="submit" loading={loading}>
              Criar
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

