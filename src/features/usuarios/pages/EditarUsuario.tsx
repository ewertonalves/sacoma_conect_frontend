import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, useParams } from 'react-router-dom';
import { usuarioService } from '../services/usuarioService';
import type { User } from '../../../shared/types';
import { Input } from '../../../shared/ui/Input/Input';
import { Button } from '../../../shared/ui/Button/Button';
import { Card } from '../../../shared/ui/Card/Card';
import { Loading } from '../../../shared/ui/Loading/Loading';
import { useUIStore } from '../../../app/stores/uiStore';
import './css/EditarUsuario.css';

const usuarioSchema = z.object({
  nome: z.string().min(3, 'Nome deve ter entre 3 e 120 caracteres').max(120, 'Nome deve ter entre 3 e 120 caracteres'),
  email: z.string().email('Email inválido').min(1, 'Email é obrigatório').max(120, 'Email deve ter no máximo 120 caracteres'),
  senha: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres').optional().or(z.literal('')),
});

type UsuarioFormData = z.infer<typeof usuarioSchema>;

export const EditarUsuario = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showNotification } = useUIStore();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<UsuarioFormData>({
    resolver: zodResolver(usuarioSchema),
  });

  useEffect(() => {
    const loadUsuario = async () => {
      if (!id) return;

      try {
        setLoading(true);
        const usuario = await usuarioService.get(Number(id));
        
        // Verifica se é o admin master (não pode ser editado)
        const isMaster = usuario.nome.toLowerCase().includes('administrador master') || 
                        (usuario.role === 'ADMIN' && usuario.id === 1);
        
        if (isMaster) {
          showNotification({
            type: 'error',
            message: 'O administrador master não pode ser editado',
          });
          navigate('/usuarios');
          return;
        }
        
        reset({
          nome: usuario.nome,
          email: usuario.email,
          senha: '',
        });
      } catch (error: any) {
        showNotification({
          type: 'error',
          message: error.message || 'Erro ao carregar usuário',
        });
        navigate('/usuarios');
      } finally {
        setLoading(false);
      }
    };

    loadUsuario();
  }, [id, reset, navigate, showNotification]);

  const onSubmit = async (data: UsuarioFormData) => {
    if (!id) return;

    try {
      setSaving(true);
      
      // Verifica novamente se é o admin master antes de atualizar
      const usuario = await usuarioService.get(Number(id));
      const isMaster = usuario.nome.toLowerCase().includes('administrador master') || 
                      (usuario.role === 'ADMIN' && usuario.id === 1);
      
      if (isMaster) {
        showNotification({
          type: 'error',
          message: 'O administrador master não pode ser editado',
        });
        navigate('/usuarios');
        return;
      }
      
      const updateData: Partial<User> = {
        nome: data.nome,
        email: data.email,
      };

      if (data.senha && data.senha.trim() !== '') {
        (updateData as any).senha = data.senha;
      }

      await usuarioService.update(Number(id), updateData);
      showNotification({
        type: 'success',
        message: 'Usuário atualizado com sucesso',
      });
      navigate('/usuarios');
    } catch (error: any) {
      showNotification({
        type: 'error',
        message: error.message || 'Erro ao atualizar usuário',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <Loading fullScreen />;
  }

  return (
    <div className="editar-usuario-container">
      <div className="editar-usuario-header">
        <h1 className="editar-usuario-title">Editar Usuário</h1>
        <p className="editar-usuario-subtitle">Atualize as informações do usuário</p>
      </div>

      <Card>
        <form onSubmit={handleSubmit(onSubmit)} className="editar-usuario-form">
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
            label="Nova senha (opcional)"
            type="password"
            placeholder="Deixe em branco para manter a senha atual"
            showPasswordToggle
            error={errors.senha?.message}
            {...register('senha')}
          />

          <div className="editar-usuario-actions">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/usuarios')}
            >
              Cancelar
            </Button>
            <Button type="submit" loading={saving}>
              Salvar
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

