import { useEffect, useState, useRef } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, useParams } from 'react-router-dom';
import { financeiroService } from '../services/financeiroService';
import { membroService } from '../../membros/services/membroService';
import type { Membro, TipoFinanceiro } from '../../../shared/types';
import { Input } from '../../../shared/ui/Input/Input';
import { Select } from '../../../shared/ui/Select/Select';
import { Textarea } from '../../../shared/ui/Textarea/Textarea';
import { Button } from '../../../shared/ui/Button/Button';
import { Card } from '../../../shared/ui/Card/Card';
import { Loading } from '../../../shared/ui/Loading/Loading';
import { useUIStore } from '../../../app/stores/uiStore';
import { TIPO_FINANCEIRO_LABELS, TIPOS_FINANCEIRO } from '../../../shared/lib/constants';
import { parseCurrency, formatCurrencyInput } from '../../../shared/lib/formatters';
import { Search, X, ChevronDown } from 'lucide-react';
import './css/EditarFinanceiro.css';

const financeiroSchema = z
  .object({
    tipo: z.enum(['DIZIMO', 'DESPESAS', 'REFORMAS', 'OFERTAS']),
    entrada: z.string().optional(),
    saida: z.string().optional(),
    membroId: z.string().optional(),
    observacao: z.string().max(255, 'Observação deve ter no máximo 255 caracteres').optional(),
  })
  .refine(
    (data) => {
      const entrada = data.entrada ? parseCurrency(data.entrada) : 0;
      const saida = data.saida ? parseCurrency(data.saida) : 0;
      return entrada > 0 || saida > 0;
    },
    {
      message: 'É necessário informar pelo menos um valor de entrada ou saída',
      path: ['entrada'],
    }
  );

type FinanceiroFormData = z.infer<typeof financeiroSchema>;

export const EditarFinanceiro = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showNotification } = useUIStore();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [membros, setMembros] = useState<Membro[]>([]);
  const [membroSearchTerm, setMembroSearchTerm] = useState('');
  const [membroSelectOpen, setMembroSelectOpen] = useState(false);
  const membroSelectRef = useRef<HTMLDivElement>(null);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
    reset,
  } = useForm<FinanceiroFormData>({
    resolver: zodResolver(financeiroSchema),
  });

  const membroId = watch('membroId');

  useEffect(() => {
    const loadData = async () => {
      if (!id) return;

      try {
        setLoading(true);
        const [registro, membrosData] = await Promise.all([
          financeiroService.get(Number(id)),
          membroService.list(),
        ]);

        setMembros(membrosData);
        const entradaValue = registro.entrada ? String(Math.round(registro.entrada * 100)) : '';
        const saidaValue = registro.saida ? String(Math.round(registro.saida * 100)) : '';
        reset({
          tipo: registro.tipo,
          entrada: entradaValue,
          saida: saidaValue,
          membroId: registro.membroId ? String(registro.membroId) : '',
          observacao: registro.observacao || '',
        });
      } catch (error: any) {
        showNotification({
          type: 'error',
          message: error.message || 'Erro ao carregar registro financeiro',
        });
        navigate('/financeiro');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id, reset, navigate, showNotification]);

  const onSubmit = async (data: FinanceiroFormData) => {
    if (!id) return;

    try {
      setSaving(true);
      await financeiroService.update(Number(id), {
        tipo: data.tipo as TipoFinanceiro,
        entrada: data.entrada ? parseCurrency(data.entrada) : 0,
        saida: data.saida ? parseCurrency(data.saida) : 0,
        membroId: data.membroId ? Number(data.membroId) : undefined,
        observacao: data.observacao || undefined,
      });
      showNotification({
        type: 'success',
        message: 'Registro financeiro atualizado com sucesso',
      });
      navigate('/financeiro');
    } catch (error: any) {
      showNotification({
        type: 'error',
        message: error.message || 'Erro ao atualizar registro financeiro',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <Loading fullScreen />;
  }

  const tipoOptions = Object.entries(TIPOS_FINANCEIRO).map(([key]) => ({
    value: key,
    label: TIPO_FINANCEIRO_LABELS[key],
  }));

  const membroOptions = [
    { value: '', label: 'Selecione um membro (opcional)' },
    ...membros.map((m) => ({
      value: String(m.id),
      label: m.nome?.trim() || `Membro #${m.id}`,
    })),
  ];

  // Filtra membros baseado no termo de busca
  const filteredMembroOptions = membroSearchTerm
    ? membroOptions.filter((option) =>
      option.label.toLowerCase().includes(membroSearchTerm.toLowerCase())
    )
    : membroOptions;

  const selectedMembroLabel = membroId
    ? membroOptions.find((opt) => opt.value === membroId)?.label || 'Selecione um membro (opcional)'
    : 'Selecione um membro (opcional)';

  const handleMembroSelect = (value: string) => {
    setValue('membroId', value);
    setMembroSelectOpen(false);
    setMembroSearchTerm('');
  };

  return (
    <div className="editar-financeiro-container">
      <div className="editar-financeiro-header">
        <h1 className="editar-financeiro-title">Editar Registro Financeiro</h1>
        <p className="editar-financeiro-subtitle">Atualize as informações do registro</p>
      </div>

      <Card>
        <form onSubmit={handleSubmit(onSubmit)} className="editar-financeiro-form">
          <Select
            label="Tipo"
            options={tipoOptions}
            error={errors.tipo?.message}
            required
            {...register('tipo')}
          />

          <div className="editar-financeiro-values-grid">
            <Controller
              name="entrada"
              control={control}
              render={({ field }) => (
                <Input
                  label="Valor de Entrada"
                  type="text"
                  placeholder="R$ 0,00"
                  helperText="Deixe em branco se não houver entrada"
                  error={errors.entrada?.message}
                  value={formatCurrencyInput(field.value || '')}
                  onChange={(e) => {
                    const formatted = formatCurrencyInput(e.target.value);
                    field.onChange(formatted);
                  }}
                  onBlur={field.onBlur}
                  name={field.name}
                  ref={field.ref}
                />
              )}
            />

            <Controller
              name="saida"
              control={control}
              render={({ field }) => (
                <Input
                  label="Valor de Saída"
                  type="text"
                  placeholder="R$ 0,00"
                  helperText="Deixe em branco se não houver saída"
                  error={errors.saida?.message}
                  value={formatCurrencyInput(field.value || '')}
                  onChange={(e) => {
                    const formatted = formatCurrencyInput(e.target.value);
                    field.onChange(formatted);
                  }}
                  onBlur={field.onBlur}
                  name={field.name}
                  ref={field.ref}
                />
              )}
            />
          </div>

          <div className="editar-financeiro-membro-select-wrapper" ref={membroSelectRef}>
            <label className="editar-financeiro-membro-select-label">
              Membro (opcional)
            </label>
            <div className="editar-financeiro-membro-select-container">
              <button
                type="button"
                onClick={() => setMembroSelectOpen(!membroSelectOpen)}
                className={`editar-financeiro-membro-select-button ${errors.membroId ? 'editar-financeiro-membro-select-button-error' : 'editar-financeiro-membro-select-button-normal'}`}
              >
                <span className={membroId ? 'editar-financeiro-membro-select-text' : 'editar-financeiro-membro-select-text-placeholder'}>
                  {selectedMembroLabel}
                </span>
                <ChevronDown className={`editar-financeiro-membro-select-icon ${membroSelectOpen ? 'editar-financeiro-membro-select-icon-open' : ''}`} />
              </button>

              {membroSelectOpen && (
                <div className="editar-financeiro-membro-dropdown">
                  <div className="editar-financeiro-membro-search-container">
                    <div className="editar-financeiro-membro-search-wrapper">
                      <Search className="editar-financeiro-membro-search-icon" />
                      <Input
                        type="text"
                        placeholder="Buscar membro..."
                        value={membroSearchTerm}
                        onChange={(e) => setMembroSearchTerm(e.target.value)}
                        className="pl-8"
                        autoFocus
                      />
                      {membroSearchTerm && (
                        <button
                          type="button"
                          onClick={() => setMembroSearchTerm('')}
                          className="editar-financeiro-membro-search-clear"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="editar-financeiro-membro-options">
                    {filteredMembroOptions.length > 0 ? (
                      filteredMembroOptions.map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => handleMembroSelect(option.value)}
                          className={`editar-financeiro-membro-option ${membroId === option.value ? 'editar-financeiro-membro-option-selected' : 'editar-financeiro-membro-option-normal'}`}
                        >
                          {option.label}
                        </button>
                      ))
                    ) : (
                      <div className="editar-financeiro-membro-empty">
                        Nenhum membro encontrado
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            {errors.membroId && (
              <p className="editar-financeiro-membro-error" role="alert">
                {errors.membroId.message}
              </p>
            )}
          </div>

          <Textarea
            label="Observação"
            placeholder="Digite uma observação (opcional)"
            rows={4}
            error={errors.observacao?.message}
            {...register('observacao')}
          />

          <div className="editar-financeiro-actions">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/financeiro')}
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

