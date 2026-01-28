import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { membroService } from '../services/membroService';
import type { Membro } from '../../../shared/types';
import { Card } from '../../../shared/ui/Card/Card';
import { Button } from '../../../shared/ui/Button/Button';
import { Loading } from '../../../shared/ui/Loading/Loading';
import { useUIStore } from '../../../app/stores/uiStore';
import { formatCPF, formatCEP } from '../../../shared/lib/formatters';
import { Edit, ArrowLeft } from 'lucide-react';
import './css/DetalhesMembro.css';

export const DetalhesMembro = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showNotification } = useUIStore();
  const [membro, setMembro] = useState<Membro | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMembro = async () => {
      if (!id) return;

      try {
        setLoading(true);
        const data = await membroService.get(Number(id));
        setMembro(data);
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
  }, [id, navigate, showNotification]);

  if (loading) {
    return <Loading fullScreen />;
  }

  if (!membro) {
    return null;
  }

  return (
    <div className="detalhes-membro-container">
      <div className="detalhes-membro-header">
        <div className="detalhes-membro-header-content">
          <h1 className="detalhes-membro-title">Detalhes do Membro</h1>
          <p className="detalhes-membro-subtitle">Informações completas do membro</p>
        </div>
        <div className="detalhes-membro-actions">
          <Button
            variant="outline"
            onClick={() => navigate('/membros')}
            icon={<ArrowLeft className="w-4 h-4" />}
          >
            Voltar
          </Button>
          <Button
            onClick={() => navigate(`/membros/${membro.id}/editar`)}
            icon={<Edit className="w-4 h-4" />}
          >
            Editar
          </Button>
        </div>
      </div>

      <Card title="Dados Pessoais">
        <div className="detalhes-membro-info-grid">
          <div className="detalhes-membro-info-item">
            <p className="detalhes-membro-info-label">ID</p>
            <p className="detalhes-membro-info-value">{membro.id}</p>
          </div>
          <div className="detalhes-membro-info-item">
            <p className="detalhes-membro-info-label">Nome</p>
            <p className="detalhes-membro-info-value">{membro.nome}</p>
          </div>
          <div className="detalhes-membro-info-item">
            <p className="detalhes-membro-info-label">CPF</p>
            <p className="detalhes-membro-info-value">{formatCPF(membro.cpf)}</p>
          </div>
          <div className="detalhes-membro-info-item">
            <p className="detalhes-membro-info-label">RG</p>
            <p className="detalhes-membro-info-value">{membro.rg}</p>
          </div>
          <div className="detalhes-membro-info-item">
            <p className="detalhes-membro-info-label">RI</p>
            <p className="detalhes-membro-info-value">{membro.ri}</p>
          </div>
          {membro.cargo && (
            <div className="detalhes-membro-info-item">
              <p className="detalhes-membro-info-label">Cargo</p>
              <p className="detalhes-membro-info-value">{membro.cargo}</p>
            </div>
          )}
        </div>
      </Card>

      <Card title="Endereço">
        <div className="detalhes-membro-info-grid">
          <div className="detalhes-membro-info-item">
            <p className="detalhes-membro-info-label">Rua</p>
            <p className="detalhes-membro-info-value">{membro.endereco.rua}</p>
          </div>
          <div className="detalhes-membro-info-item">
            <p className="detalhes-membro-info-label">Número</p>
            <p className="detalhes-membro-info-value">{membro.endereco.numero}</p>
          </div>
          <div className="detalhes-membro-info-item">
            <p className="detalhes-membro-info-label">CEP</p>
            <p className="detalhes-membro-info-value">{formatCEP(membro.endereco.cep)}</p>
          </div>
          <div className="detalhes-membro-info-item">
            <p className="detalhes-membro-info-label">Bairro</p>
            <p className="detalhes-membro-info-value">{membro.endereco.bairro}</p>
          </div>
          {membro.endereco.complemento && (
            <div className="detalhes-membro-info-item">
              <p className="detalhes-membro-info-label">Complemento</p>
              <p className="detalhes-membro-info-value">{membro.endereco.complemento}</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

