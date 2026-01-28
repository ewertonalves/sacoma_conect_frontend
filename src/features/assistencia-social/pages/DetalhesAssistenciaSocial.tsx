import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { assistenciaSocialService } from '../services/assistenciaSocialService';
import type { AssistenciaSocial } from '../../../shared/types';
import { Card } from '../../../shared/ui/Card/Card';
import { Button } from '../../../shared/ui/Button/Button';
import { Loading } from '../../../shared/ui/Loading/Loading';
import { useUIStore } from '../../../app/stores/uiStore';
import { formatDate, formatDateTime } from '../../../shared/lib/formatters';
import { Edit, ArrowLeft } from 'lucide-react';
import './css/DetalhesAssistenciaSocial.css';

export const DetalhesAssistenciaSocial = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showNotification } = useUIStore();
  const [registro, setRegistro] = useState<AssistenciaSocial | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRegistro = async () => {
      if (!id) return;

      try {
        setLoading(true);
        const data = await assistenciaSocialService.get(Number(id));
        setRegistro(data);
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
  }, [id, navigate, showNotification]);

  if (loading) {
    return <Loading fullScreen />;
  }

  if (!registro) {
    return null;
  }

  return (
    <div className="detalhes-assistencia-social-container">
      <div className="detalhes-assistencia-social-header">
        <div className="detalhes-assistencia-social-header-content">
          <h1 className="detalhes-assistencia-social-title">Detalhes da Assistência Social</h1>
          <p className="detalhes-assistencia-social-subtitle">Informações completas do registro</p>
        </div>
        <div className="detalhes-assistencia-social-actions">
          <Button
            variant="outline"
            onClick={() => navigate('/assistencia-social')}
            icon={<ArrowLeft className="w-4 h-4" />}
          >
            Voltar
          </Button>
          <Button
            onClick={() => navigate(`/assistencia-social/${registro.id}/editar`)}
            icon={<Edit className="w-4 h-4" />}
          >
            Editar
          </Button>
        </div>
      </div>

      <Card title="Informações do Registro">
        <div className="detalhes-assistencia-social-info-grid">
          <div className="detalhes-assistencia-social-info-item">
            <p className="detalhes-assistencia-social-info-label">Nome do Alimento</p>
            <p className="detalhes-assistencia-social-info-value">{registro.nomeAlimento}</p>
          </div>
          <div className="detalhes-assistencia-social-info-item">
            <p className="detalhes-assistencia-social-info-label">Quantidade</p>
            <p className="detalhes-assistencia-social-info-value">{Number(registro.quantidade).toFixed(2)}</p>
          </div>
          <div className="detalhes-assistencia-social-info-item">
            <p className="detalhes-assistencia-social-info-label">Data de Validade</p>
            <p className="detalhes-assistencia-social-info-value">{formatDate(registro.dataValidade)}</p>
          </div>
          <div className="detalhes-assistencia-social-info-item">
            <p className="detalhes-assistencia-social-info-label">Família Beneficiada</p>
            <p className="detalhes-assistencia-social-info-value">{registro.familiaBeneficiada || '-'}</p>
          </div>
          <div className="detalhes-assistencia-social-info-item">
            <p className="detalhes-assistencia-social-info-label">Quantidade de Cestas Básicas</p>
            <p className="detalhes-assistencia-social-info-value">
              {registro.quantidadeCestasBasicas ? Number(registro.quantidadeCestasBasicas).toFixed(2) : '-'}
            </p>
          </div>
          <div className="detalhes-assistencia-social-info-item">
            <p className="detalhes-assistencia-social-info-label">Data de Entrega da Cesta</p>
            <p className="detalhes-assistencia-social-info-value">
              {registro.dataEntregaCesta ? formatDate(registro.dataEntregaCesta) : '-'}
            </p>
          </div>
          <div className="detalhes-assistencia-social-info-item">
            <p className="detalhes-assistencia-social-info-label">Data de Registro</p>
            <p className="detalhes-assistencia-social-info-value">{formatDateTime(registro.dataRegistro)}</p>
          </div>
        </div>
      </Card>
    </div>
  );
};
