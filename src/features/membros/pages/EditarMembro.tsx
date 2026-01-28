import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useParams } from 'react-router-dom';
import { membroService } from '../services/membroService';
import { Input } from '../../../shared/ui/Input/Input';
import { Button } from '../../../shared/ui/Button/Button';
import { Card } from '../../../shared/ui/Card/Card';
import { Loading } from '../../../shared/ui/Loading/Loading';
import { useUIStore } from '../../../app/stores/uiStore';
import { formatCPF, formatCEP } from '../../../shared/lib/formatters';
import { cepService } from '../../../shared/services/cepService';
import { membroSchema, type MembroFormData } from '../../../shared/lib/schemas/membroSchemas';
import './css/EditarMembro.css';

export const EditarMembro = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showNotification } = useUIStore();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadingCep, setLoadingCep] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
    setValue,
    watch,
    trigger,
  } = useForm<MembroFormData>({
    resolver: zodResolver(membroSchema),
    mode: 'onBlur',
  });

  const fetchAddressFromCep = async () => {
    const currentCep = watch('endereco.cep');
    if (!currentCep || typeof currentCep !== 'string') return;
    
    const cleanCep = currentCep.replace(/\D/g, '');
    
    if (cleanCep.length !== 8) {
      return;
    }

    try {
      setLoadingCep(true);
      const data = await cepService.buscar(cleanCep);

      if (data) {
        // Usa setTimeout para garantir que os setValue sejam aplicados após o blur
        setTimeout(() => {
          setValue('endereco.rua', data.logradouro || '', { shouldValidate: true, shouldDirty: true });
          setValue('endereco.bairro', data.bairro || '', { shouldValidate: true, shouldDirty: true });
          setValue('endereco.cidade', data.localidade || '', { shouldValidate: true, shouldDirty: true });
          setValue('endereco.estado', data.uf ? data.uf.toUpperCase() : '', { shouldValidate: true, shouldDirty: true });
          
          if (data.complemento) {
            setValue('endereco.complemento', data.complemento, { shouldDirty: true });
          }
          
          trigger(['endereco.rua', 'endereco.bairro', 'endereco.cidade', 'endereco.estado']);
        }, 0);
        
        showNotification({
          type: 'success',
          message: 'Endereço atualizado automaticamente',
        });
      } else {
        throw new Error('Dados do CEP não retornados');
      }
    } catch (error: any) {
      console.error('Erro ao buscar CEP:', error);
      const errorMessage = error.message || 'CEP não encontrado';
      showNotification({
        type: 'error',
        message: errorMessage,
      });
      
      setTimeout(() => {
        setValue('endereco.rua', '');
        setValue('endereco.bairro', '');
        setValue('endereco.cidade', '');
        setValue('endereco.estado', '');
      }, 0);
    } finally {
      setLoadingCep(false);
    }
  };

  useEffect(() => {
    const loadMembro = async () => {
      if (!id) return;

      try {
        setLoading(true);
        const membro = await membroService.get(Number(id));
        
        if (!membro) {
          throw new Error('Membro não encontrado');
        }
        
        reset({
          nome: membro.nome || '',
          cpf: membro.cpf ? formatCPF(membro.cpf) : '',
          rg: membro.rg || '',
          ri: membro.ri || '',
          cargo: membro.cargo || '',
          endereco: {
            rua: membro.endereco?.rua || '',
            numero: membro.endereco?.numero || '',
            cep: membro.endereco?.cep ? formatCEP(membro.endereco.cep) : '',
            bairro: membro.endereco?.bairro || '',
            cidade: membro.endereco?.cidade || '',
            estado: membro.endereco?.estado || '',
            complemento: membro.endereco?.complemento || '',
          },
        });
      } catch (error: any) {
        showNotification({
          type: 'error',
          message: error.message || 'Erro ao carregar membro',
        });
        navigate('/membros');
      } finally {
        setLoading(false);
      }
    };

    loadMembro();
  }, [id, reset, navigate, showNotification]);

  const onSubmit = async (data: MembroFormData) => {
    if (!id) return;

    try {
      setSaving(true);
      await membroService.update(Number(id), {
        ...data,
        cpf: data.cpf ? data.cpf.replace(/\D/g, '') : '',
        endereco: {
          rua: data.endereco.rua,
          numero: data.endereco.numero,
          cep: data.endereco.cep ? data.endereco.cep.replace(/\D/g, '') : '',
          bairro: data.endereco.bairro,
          cidade: data.endereco.cidade,
          estado: data.endereco.estado,
          complemento: data.endereco.complemento,
        },
      });
      showNotification({
        type: 'success',
        message: 'Membro atualizado com sucesso',
      });
      navigate('/membros');
    } catch (error: any) {
      showNotification({
        type: 'error',
        message: error.message || 'Erro ao atualizar membro',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <Loading fullScreen />;
  }

  return (
    <div className="editar-membro-container">
      <div className="editar-membro-header">
        <h1 className="editar-membro-title">Editar Membro</h1>
        <p className="editar-membro-subtitle">Atualize as informações do membro</p>
      </div>

      <Card>
        <form onSubmit={handleSubmit(onSubmit)} className="editar-membro-form">
          <div>
            <h3 className="editar-membro-section-title">Dados Pessoais</h3>
            <div className="editar-membro-grid">
              <Input
                label="Nome completo"
                type="text"
                error={errors.nome?.message}
                required
                {...register('nome')}
              />

              <Controller
                name="cpf"
                control={control}
                render={({ field }) => (
                  <Input
                    label="CPF"
                    type="text"
                    placeholder="000.000.000-00"
                    error={errors.cpf?.message}
                    required
                    value={formatCPF(field.value || '')}
                    onChange={(e) => {
                      const formatted = formatCPF(e.target.value);
                      field.onChange(formatted);
                    }}
                    onBlur={field.onBlur}
                    name={field.name}
                    ref={field.ref}
                  />
                )}
              />

              <Input
                label="RG"
                type="text"
                placeholder="Digite o RG"
                error={errors.rg?.message}
                required
                {...register('rg')}
              />

              <Input
                label="RI"
                type="text"
                placeholder="Digite o RI"
                error={errors.ri?.message}
                required
                {...register('ri')}
              />

              <Input
                label="Cargo (opcional)"
                type="text"
                placeholder="Digite o cargo"
                error={errors.cargo?.message}
                {...register('cargo')}
              />
            </div>
          </div>

          <div>
            <h3 className="editar-membro-section-title">Endereço</h3>
            <div className="editar-membro-grid">
              <div className="editar-membro-cep-wrapper">
                <Controller
                  name="endereco.cep"
                  control={control}
                  render={({ field }) => (
                    <Input
                      label="CEP"
                      type="text"
                      placeholder="00000-000"
                      error={errors.endereco?.cep?.message}
                      required
                      disabled={loadingCep}
                      value={formatCEP(field.value || '')}
                      onChange={(e) => {
                        const formatted = formatCEP(e.target.value);
                        field.onChange(formatted);
                      }}
                      onBlur={async (e) => {
                        field.onBlur();
                        e.preventDefault();
                        const isValid = await trigger('endereco.cep');
                        if (isValid) {
                          await fetchAddressFromCep();
                        }
                      }}
                      name={field.name}
                      ref={field.ref}
                    />
                  )}
                />
                {loadingCep && (
                  <div className="editar-membro-cep-loading">
                    <div className="editar-membro-cep-spinner"></div>
                  </div>
                )}
              </div>

              <Input
                label="Rua"
                type="text"
                disabled
                error={errors.endereco?.rua?.message}
                required
                {...register('endereco.rua')}
              />

              <Input
                label="Número"
                type="text"
                error={errors.endereco?.numero?.message}
                required
                {...register('endereco.numero')}
              />

              <Input
                label="Bairro"
                type="text"
                disabled
                error={errors.endereco?.bairro?.message}
                required
                {...register('endereco.bairro')}
              />

              <Input
                label="Cidade"
                type="text"
                disabled
                error={errors.endereco?.cidade?.message}
                required
                {...register('endereco.cidade')}
              />

              <Input
                label="Estado"
                type="text"
                disabled
                maxLength={2}
                placeholder="UF"
                error={errors.endereco?.estado?.message}
                required
                {...register('endereco.estado', {
                  onChange: (e) => {
                    setValue('endereco.estado', e.target.value.toUpperCase());
                  },
                })}
              />

              <Input
                label="Complemento (opcional)"
                type="text"
                placeholder="Apto, Bloco, etc."
                error={errors.endereco?.complemento?.message}
                {...register('endereco.complemento')}
              />
            </div>
          </div>

          <div className="editar-membro-actions">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/membros')}
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

