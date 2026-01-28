import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { Users, CheckCircle2 } from 'lucide-react';
import { assistenciaSocialService } from '../services/assistenciaSocialService';
import { Input } from '../../../shared/ui/Input/Input';
import { Button } from '../../../shared/ui/Button/Button';
import { Card } from '../../../shared/ui/Card/Card';
import { Modal } from '../../../shared/ui/Modal/Modal';
import { useUIStore } from '../../../app/stores/uiStore';
import './css/CadastrarAssistenciaSocial.css';

const assistenciaSocialSchema = z.object({
  nomeAlimento: z.string().min(1, 'Nome do alimento é obrigatório').max(255, 'Nome do alimento deve ter no máximo 255 caracteres'),
  quantidade: z.string().min(1, 'Quantidade é obrigatória').refine((val) => {
    const num = parseFloat(val.replace(',', '.'));
    return !isNaN(num) && num > 0;
  }, 'Quantidade deve ser maior que zero'),
  dataValidade: z.string().min(1, 'Data de validade é obrigatória'),
  familiaBeneficiada: z.string().max(255, 'Família beneficiada deve ter no máximo 255 caracteres').optional().or(z.literal('')),
  quantidadeCestasBasicas: z.string().optional().refine((val) => {
    if (!val || val === '') return true;
    const num = parseFloat(val.replace(',', '.'));
    return !isNaN(num) && num >= 0;
  }, 'Quantidade de cestas básicas deve ser maior ou igual a zero').or(z.literal('')),
  dataEntregaCesta: z.string().optional().or(z.literal('')),
});

type AssistenciaSocialFormData = z.infer<typeof assistenciaSocialSchema>;

export const CadastrarAssistenciaSocial = () => {
  const navigate = useNavigate();
  const { showNotification } = useUIStore();
  const [loading, setLoading] = useState(false);
  const [modalFamiliaOpen, setModalFamiliaOpen] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors }
  } = useForm<AssistenciaSocialFormData>({
    resolver: zodResolver(assistenciaSocialSchema),
  });

  // Observa os campos da família para mostrar indicador
  const familiaBeneficiada = watch('familiaBeneficiada');
  const quantidadeCestasBasicas = watch('quantidadeCestasBasicas');
  const dataEntregaCesta = watch('dataEntregaCesta');
  
  const temDadosFamilia = !!(familiaBeneficiada || quantidadeCestasBasicas || dataEntregaCesta);

  const onSubmit = async (data: AssistenciaSocialFormData) => {
    try {
      setLoading(true);
      await assistenciaSocialService.create({
        nomeAlimento: data.nomeAlimento,
        quantidade: parseFloat(data.quantidade.replace(',', '.')),
        dataValidade: data.dataValidade,
        familiaBeneficiada: data.familiaBeneficiada || undefined,
        quantidadeCestasBasicas: data.quantidadeCestasBasicas ? parseFloat(data.quantidadeCestasBasicas.replace(',', '.')) : undefined,
        dataEntregaCesta: data.dataEntregaCesta || undefined,
      });
      showNotification({
        type: 'success',
        message: 'Registro de assistência social cadastrado com sucesso',
      });
      navigate('/assistencia-social');
    } catch (error: any) {
      showNotification({
        type: 'error',
        message: error.message || 'Erro ao cadastrar registro de assistência social',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="cadastrar-assistencia-social-container">
      <div className="cadastrar-assistencia-social-header">
        <h1 className="cadastrar-assistencia-social-title">Cadastrar Assistência Social</h1>
        <p className="cadastrar-assistencia-social-subtitle">Adicione um novo registro de assistência social</p>
      </div>

      <Card>
        <form onSubmit={handleSubmit(onSubmit)} className="cadastrar-assistencia-social-form">
          <Input
            label="Nome do Alimento"
            type="text"
            placeholder="Ex: Arroz, Feijão, etc."
            error={errors.nomeAlimento?.message}
            required
            {...register('nomeAlimento')}
          />

          <Input
            label="Quantidade"
            type="text"
            placeholder="Ex: 10.5"
            helperText="Informe a quantidade (use ponto ou vírgula para decimais)"
            error={errors.quantidade?.message}
            required
            {...register('quantidade')}
          />

          <Input
            label="Data de Validade"
            type="date"
            error={errors.dataValidade?.message}
            required
            {...register('dataValidade')}
          />

          {/* Seção Família Beneficiada */}
          <div className="familia-beneficiada-section">
            <div className="familia-beneficiada-header">
              <h3 className="familia-beneficiada-title">Registrar famílias ou pessoas beneficiadas</h3>
              {temDadosFamilia && (
                <span className="familia-beneficiada-badge">
                  <CheckCircle2 className="w-4 h-4" />
                  Dados preenchidos
                </span>
              )}
            </div>
            <p className="familia-beneficiada-description">
              Informações sobre quem recebeu ajuda da assistência (opcional)
            </p>
            <Button
              type="button"
              variant="outline"
              icon={<Users className="w-4 h-4" />}
              onClick={() => setModalFamiliaOpen(true)}
            >
              {temDadosFamilia ? 'Editar Dados da Família' : 'Registrar famílias ou pessoas beneficiadas'}
            </Button>
          </div>

          <div className="cadastrar-assistencia-social-actions">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/assistencia-social')}
            >
              Cancelar
            </Button>
            <Button type="submit" loading={loading}>
              Cadastrar
            </Button>
          </div>
        </form>
      </Card>

      {/* Modal Família Beneficiada */}
      <Modal
        open={modalFamiliaOpen}
        onClose={() => setModalFamiliaOpen(false)}
        title="Dados da família ou pessoa beneficiada"
        size="medium"
        footer={
          <>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setValue('familiaBeneficiada', '');
                setValue('quantidadeCestasBasicas', '');
                setValue('dataEntregaCesta', '');
                setModalFamiliaOpen(false);
              }}
            >
              Limpar
            </Button>
            <Button
              type="button"
              onClick={() => setModalFamiliaOpen(false)}
            >
              Confirmar
            </Button>
          </>
        }
      >
        <div className="modal-familia-content">
          <Input
            label="Família Beneficiada"
            type="text"
            placeholder="Ex: Família Silva"
            helperText="Nome da família que recebeu a assistência"
            error={errors.familiaBeneficiada?.message}
            {...register('familiaBeneficiada')}
          />

          <Input
            label="Quantidade de Cestas Básicas"
            type="text"
            placeholder="Ex: 2.5"
            helperText="Quantidade de cestas básicas entregues à família"
            error={errors.quantidadeCestasBasicas?.message}
            {...register('quantidadeCestasBasicas')}
          />

          <Input
            label="Data de Entrega da Cesta"
            type="date"
            error={errors.dataEntregaCesta?.message}
            {...register('dataEntregaCesta')}
          />
        </div>
      </Modal>
    </div>
  );
};
