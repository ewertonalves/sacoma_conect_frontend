import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { financeiroService } from '../services/financeiroService';
import type { Financeiro } from '../../../shared/types';
import { Card } from '../../../shared/ui/Card/Card';
import { Button } from '../../../shared/ui/Button/Button';
import { Loading } from '../../../shared/ui/Loading/Loading';
import { Badge } from '../../../shared/ui/Badge/Badge';
import { useUIStore } from '../../../app/stores/uiStore';
import { TIPO_FINANCEIRO_LABELS, TIPO_FINANCEIRO_COLORS } from '../../../shared/lib/constants';
import { formatCurrency, formatDateTime } from '../../../shared/lib/formatters';
import { Edit, ArrowLeft } from 'lucide-react';
import './css/DetalhesFinanceiro.css';

export const DetalhesFinanceiro = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showNotification } = useUIStore();
  const [registro, setRegistro] = useState<Financeiro | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRegistro = async () => {
      if (!id) return;

      try {
        setLoading(true);
        const data = await financeiroService.get(Number(id));
        setRegistro(data);
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

    loadRegistro();
  }, [id, navigate, showNotification]);

  if (loading) {
    return <Loading fullScreen />;
  }

  if (!registro) {
    return null;
  }

  const saldo = (registro.entrada || 0) - (registro.saida || 0);

  return (
    <div className="detalhes-financeiro-container">
      <div className="detalhes-financeiro-header">
        <div className="detalhes-financeiro-header-content">
          <h1 className="detalhes-financeiro-title">Detalhes do Registro Financeiro</h1>
          <p className="detalhes-financeiro-subtitle">Informações completas do registro</p>
        </div>
        <div className="detalhes-financeiro-actions">
          <Button
            variant="outline"
            onClick={() => navigate('/financeiro')}
            icon={<ArrowLeft className="w-4 h-4" />}
          >
            Voltar
          </Button>
          <Button
            onClick={() => navigate(`/financeiro/${registro.id}/editar`)}
            icon={<Edit className="w-4 h-4" />}
          >
            Editar
          </Button>
        </div>
      </div>

      <Card title="Informações do Registro">
        <div className="detalhes-financeiro-info-grid">
          <div className="detalhes-financeiro-info-item">
            <p className="detalhes-financeiro-info-label">Tipo</p>
            <p className="detalhes-financeiro-info-value">
              <Badge color={TIPO_FINANCEIRO_COLORS[registro.tipo] || 'default'}>
                {TIPO_FINANCEIRO_LABELS[registro.tipo] || registro.tipo}
              </Badge>
            </p>
          </div>
          <div className="detalhes-financeiro-info-item">
            <p className="detalhes-financeiro-info-label">Data de Registro</p>
            <p className="detalhes-financeiro-info-value">{formatDateTime(registro.dataRegistro)}</p>
          </div>
          <div className="detalhes-financeiro-info-item">
            <p className="detalhes-financeiro-info-label">Entrada</p>
            <p className="detalhes-financeiro-info-value-green">
              {formatCurrency(registro.entrada || 0)}
            </p>
          </div>
          <div className="detalhes-financeiro-info-item">
            <p className="detalhes-financeiro-info-label">Saída</p>
            <p className="detalhes-financeiro-info-value-red">
              {formatCurrency(registro.saida || 0)}
            </p>
          </div>
          <div className="detalhes-financeiro-info-item">
            <p className="detalhes-financeiro-info-label">Saldo</p>
            <p className={saldo >= 0 ? 'detalhes-financeiro-info-value-saldo-positive' : 'detalhes-financeiro-info-value-saldo-negative'}>
              {formatCurrency(saldo)}
            </p>
          </div>
          {registro.observacao && (
            <div className="detalhes-financeiro-info-item detalhes-financeiro-info-full-width">
              <p className="detalhes-financeiro-info-label">Observação</p>
              <p className="detalhes-financeiro-info-value">{registro.observacao}</p>
            </div>
          )}
        </div>
      </Card>

      {registro.membro && (
        <Card title="Membro Associado">
          <div className="detalhes-financeiro-info-item">
            <p className="detalhes-financeiro-info-label">Nome</p>
            <p className="detalhes-financeiro-info-value">
              <Link
                to={`/membros/${registro.membro.id}`}
                className="detalhes-financeiro-membro-link"
              >
                {registro.membro.nome}
              </Link>
            </p>
          </div>
        </Card>
      )}
    </div>
  );
};

