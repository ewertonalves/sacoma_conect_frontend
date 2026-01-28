import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, useParams } from 'react-router-dom';
import { assistenciaSocialService } from '../services/assistenciaSocialService';
import type { AssistenciaSocial } from '../../../shared/types';
import { Input } from '../../../shared/ui/Input/Input';
import { Button } from '../../../shared/ui/Button/Button';
import { Card } from '../../../shared/ui/Card/Card';
import { Loading } from '../../../shared/ui/Loading/Loading';
import { useUIStore } from '../../../app/stores/uiStore';
import './css/EditarAssistenciaSocial.css';

const assistenciaSocialSchema = z.object({
  nomeAlimento: z.string().min(1, 'Nome do alimento é obrigatório').max(255, 'Nome do alimento deve ter no máximo 255 caracteres').optional(),
  quantidade: z.string().refine((val) => {
    if (!val || val === '') return true;
    const num = parseFloat(val.replace(',', '.'));
    return !isNaN(num) && num > 0;
  }, 'Quantidade deve ser maior que zero').optional().or(z.literal('')),
  dataValidade: z.string().optional().or(z.literal('')),
  familiaBeneficiada: z.string().max(255, 'Família beneficiada deve ter no máximo 255 caracteres').optional().or(z.literal('')),
  quantidadeCestasBasicas: z.string().optional().refine((val) => {
    if (!val || val === '') return true;
    const num = parseFloat(val.replace(',', '.'));
    return !isNaN(num) && num >= 0;
  }, 'Quantidade de cestas básicas deve ser maior ou igual a zero').or(z.literal('')),
  dataEntregaCesta: z.string().optional().or(z.literal('')),
});

type AssistenciaSocialFormData = z.infer<typeof assistenciaSocialSchema>;

export const EditarAssistenciaSocial = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showNotification } = useUIStore();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [registro, setRegistro] = useState<AssistenciaSocial | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<AssistenciaSocialFormData>({
    resolver: zodResolver(assistenciaSocialSchema),
  });

  useEffect(() => {
    const loadRegistro = async () => {
      if (!id) return;

      try {
        setLoading(true);
        const data = await assistenciaSocialService.get(Number(id));
        setRegistro(data);
        // Formata datas para o formato YYYY-MM-DD esperado pelo input date
        const formatDateForInput = (dateStr: string) => {
          if (!dateStr) return '';
          const date = new Date(dateStr);
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const day = String(date.getDate()).padStart(2, '0');
          return `${year}-${month}-${day}`;
        };

        reset({
          nomeAlimento: data.nomeAlimento,
          quantidade: String(data.quantidade),
          dataValidade: data.dataValidade ? formatDateForInput(data.dataValidade) : '',
          familiaBeneficiada: data.familiaBeneficiada || '',
          quantidadeCestasBasicas: data.quantidadeCestasBasicas ? String(data.quantidadeCestasBasicas) : '',
          dataEntregaCesta: data.dataEntregaCesta ? formatDateForInput(data.dataEntregaCesta) : '',
        });
      } catch (error: any) {
        showNotification({
          type: 'error',
          message: error.message || 'Erro ao carregar registro de assistência social',
        });
        navigate('/assistencia-social');
      } finally {
        setLoading(false);
      }
    };

    loadRegistro();
  }, [id, navigate, showNotification, reset]);

  const onSubmit = async (data: AssistenciaSocialFormData) => {
    if (!id) return;

    try {
      setSaving(true);
      await assistenciaSocialService.update(Number(id), {
        nomeAlimento: data.nomeAlimento || undefined,
        quantidade: data.quantidade ? parseFloat(data.quantidade.replace(',', '.')) : undefined,
        dataValidade: data.dataValidade || undefined,
        familiaBeneficiada: data.familiaBeneficiada || undefined,
        quantidadeCestasBasicas: data.quantidadeCestasBasicas ? parseFloat(data.quantidadeCestasBasicas.replace(',', '.')) : undefined,
        dataEntregaCesta: data.dataEntregaCesta || undefined,
      });
      showNotification({
        type: 'success',
        message: 'Registro de assistência social atualizado com sucesso',
      });
      navigate('/assistencia-social');
    } catch (error: any) {
      showNotification({
        type: 'error',
        message: error.message || 'Erro ao atualizar registro de assistência social',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <Loading fullScreen />;
  }

  if (!registro) {
    return null;
  }

  return (
    <div className="editar-assistencia-social-container">
      <div className="editar-assistencia-social-header">
        <h1 className="editar-assistencia-social-title">Editar Assistência Social</h1>
        <p className="editar-assistencia-social-subtitle">Atualize as informações do registro</p>
      </div>

      <Card>
        <form onSubmit={handleSubmit(onSubmit)} className="editar-assistencia-social-form">
          <Input
            label="Nome do Alimento"
            type="text"
            placeholder="Ex: Arroz, Feijão, etc."
            error={errors.nomeAlimento?.message}
            {...register('nomeAlimento')}
          />

          <Input
            label="Quantidade"
            type="text"
            placeholder="Ex: 10.5"
            helperText="Informe a quantidade (use ponto ou vírgula para decimais)"
            error={errors.quantidade?.message}
            {...register('quantidade')}
          />

          <Input
            label="Data de Validade"
            type="date"
            error={errors.dataValidade?.message}
            {...register('dataValidade')}
          />

          <Input
            label="Família Beneficiada (opcional)"
            type="text"
            placeholder="Ex: Família Silva"
            helperText="Nome da família que recebeu a assistência"
            error={errors.familiaBeneficiada?.message}
            {...register('familiaBeneficiada')}
          />

          <Input
            label="Quantidade de Cestas Básicas (opcional)"
            type="text"
            placeholder="Ex: 2.5"
            helperText="Quantidade de cestas básicas entregues à família"
            error={errors.quantidadeCestasBasicas?.message}
            {...register('quantidadeCestasBasicas')}
          />

          <Input
            label="Data de Entrega da Cesta (opcional)"
            type="date"
            error={errors.dataEntregaCesta?.message}
            {...register('dataEntregaCesta')}
          />

          <div className="editar-assistencia-social-actions">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/assistencia-social')}
            >
              Cancelar
            </Button>
            <Button type="submit" loading={saving}>
              Salvar Alterações
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
