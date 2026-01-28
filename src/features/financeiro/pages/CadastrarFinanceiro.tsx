import { useEffect, useState, useRef } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { financeiroService } from '../services/financeiroService';
import { membroService } from '../../membros/services/membroService';
import type { Membro, TipoFinanceiro } from '../../../shared/types';
import { Input } from '../../../shared/ui/Input/Input';
import { Select } from '../../../shared/ui/Select/Select';
import { Textarea } from '../../../shared/ui/Textarea/Textarea';
import { Button } from '../../../shared/ui/Button/Button';
import { Card } from '../../../shared/ui/Card/Card';
import { useUIStore } from '../../../app/stores/uiStore';
import { TIPO_FINANCEIRO_LABELS, TIPOS_FINANCEIRO } from '../../../shared/lib/constants';
import { parseCurrency, formatCurrencyInput } from '../../../shared/lib/formatters';
import { Search, X, ChevronDown } from 'lucide-react';
import './css/CadastrarFinanceiro.css';

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
  )
  .refine(
    (data) => {
      const entrada = data.entrada ? parseCurrency(data.entrada) : 0;
      return entrada >= 0;
    },
    {
      message: 'Entrada deve ser maior ou igual a zero',
      path: ['entrada'],
    }
  )
  .refine(
    (data) => {
      const saida = data.saida ? parseCurrency(data.saida) : 0;
      return saida >= 0;
    },
    {
      message: 'Saída deve ser maior ou igual a zero',
      path: ['saida'],
    }
  );

type FinanceiroFormData = z.infer<typeof financeiroSchema>;

export const CadastrarFinanceiro = () => {
  const navigate = useNavigate();
  const { showNotification } = useUIStore();
  const [loading, setLoading] = useState(false);
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
    formState: { errors }
  } = useForm<FinanceiroFormData>({
    resolver: zodResolver(financeiroSchema),
  });

  const membroId = watch('membroId');

  useEffect(() => {
    const loadMembros = async () => {
      try {
        const data = await membroService.list();
        setMembros(data);
      } catch (error) {
        // Silently fail
      }
    };
    loadMembros();
  }, []);

  // Fecha o dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (membroSelectRef.current && !membroSelectRef.current.contains(event.target as Node)) {
        setMembroSelectOpen(false);
      }
    };

    if (membroSelectOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [membroSelectOpen]);

  const onSubmit = async (data: FinanceiroFormData) => {
    try {
      setLoading(true);
      await financeiroService.create({
        tipo: data.tipo as TipoFinanceiro,
        entrada: data.entrada ? parseCurrency(data.entrada) : 0,
        saida: data.saida ? parseCurrency(data.saida) : 0,
        membroId: data.membroId ? Number(data.membroId) : undefined,
        observacao: data.observacao || undefined,
      });
      showNotification({
        type: 'success',
        message: 'Registro financeiro cadastrado com sucesso',
      });
      navigate('/financeiro');
    } catch (error: any) {
      showNotification({
        type: 'error',
        message: error.message || 'Erro ao cadastrar registro financeiro',
      });
    } finally {
      setLoading(false);
    }
  };

  const tipoOptions = Object.entries(TIPOS_FINANCEIRO).map(([key]) => ({
    value: key,
    label: TIPO_FINANCEIRO_LABELS[key],
  }));

  const membroOptions = [
    { value: '', label: 'Selecione um membro (opcional)' },
    ...membros.map((m) => ({
      value: String(m.id),
      label: m.nome,
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
    <div className="cadastrar-financeiro-container">
      <div className="cadastrar-financeiro-header">
        <h1 className="cadastrar-financeiro-title">Cadastrar Registro Financeiro</h1>
        <p className="cadastrar-financeiro-subtitle">Adicione um novo registro financeiro</p>
      </div>

      <Card>
        <form onSubmit={handleSubmit(onSubmit)} className="cadastrar-financeiro-form">
          <Select
            label="Tipo"
            options={tipoOptions}
            error={errors.tipo?.message}
            required
            {...register('tipo')}
          />

          <div className="cadastrar-financeiro-values-grid">
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

          <div className="cadastrar-financeiro-membro-select-wrapper" ref={membroSelectRef}>
            <label className="cadastrar-financeiro-membro-select-label">
              Membro (opcional)
            </label>
            <div className="cadastrar-financeiro-membro-select-container">
              <button
                type="button"
                onClick={() => setMembroSelectOpen(!membroSelectOpen)}
                className={`cadastrar-financeiro-membro-select-button ${errors.membroId ? 'cadastrar-financeiro-membro-select-button-error' : 'cadastrar-financeiro-membro-select-button-normal'}`}
              >
                <span className={membroId ? 'cadastrar-financeiro-membro-select-text' : 'cadastrar-financeiro-membro-select-text-placeholder'}>
                  {selectedMembroLabel}
                </span>
                <ChevronDown className={`cadastrar-financeiro-membro-select-icon ${membroSelectOpen ? 'cadastrar-financeiro-membro-select-icon-open' : ''}`} />
              </button>

              {membroSelectOpen && (
                <div className="cadastrar-financeiro-membro-dropdown">
                  <div className="cadastrar-financeiro-membro-search-container">
                    <div className="cadastrar-financeiro-membro-search-wrapper">
                      <Search className="cadastrar-financeiro-membro-search-icon" />
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
                          className="cadastrar-financeiro-membro-search-clear"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="cadastrar-financeiro-membro-options">
                    {filteredMembroOptions.length > 0 ? (
                      filteredMembroOptions.map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => handleMembroSelect(option.value)}
                          className={`cadastrar-financeiro-membro-option ${membroId === option.value ? 'cadastrar-financeiro-membro-option-selected' : 'cadastrar-financeiro-membro-option-normal'}`}
                        >
                          {option.label}
                        </button>
                      ))
                    ) : (
                      <div className="cadastrar-financeiro-membro-empty">
                        Nenhum membro encontrado
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            {errors.membroId && (
              <p className="cadastrar-financeiro-membro-error" role="alert">
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

          <div className="cadastrar-financeiro-actions">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/financeiro')}
            >
              Cancelar
            </Button>
            <Button type="submit" loading={loading}>
              Cadastrar
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

