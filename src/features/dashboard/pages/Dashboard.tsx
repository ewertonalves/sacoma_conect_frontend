import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../../shared/ui/Card/Card';
import { Loading } from '../../../shared/ui/Loading/Loading';
import { Table } from '../../../shared/ui/Table/Table';
import type { TableColumn } from '../../../shared/ui/Table/Table';
import { Badge } from '../../../shared/ui/Badge/Badge';
import { Button } from '../../../shared/ui/Button/Button';
import { financeiroService } from '../../financeiro/services/financeiroService';
import { membroService } from '../../membros/services/membroService';
import { usuarioService } from '../../usuarios/services/usuarioService';
import type { Financeiro } from '../../../shared/types';
import { formatCurrency } from '../../../shared/lib/formatters';
import { TIPO_FINANCEIRO_LABELS, TIPO_FINANCEIRO_COLORS } from '../../../shared/lib/constants';
import { Users, UserCircle, TrendingUp, TrendingDown, DollarSign, Eye, ArrowRight } from 'lucide-react';
import './css/Dashboard.css';

interface Statistics {
  totalMembros: number;
  totalUsuarios: number;
  entradasMes: number;
  saidasMes: number;
  saldoMes: number;
  totalEntradas: number;
  totalSaidas: number;
  saldoTotal: number;
}

export const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [ultimosRegistros, setUltimosRegistros] = useState<Financeiro[]>([]);
  const [stats, setStats] = useState<Statistics>({
    totalMembros: 0,
    totalUsuarios: 0,
    entradasMes: 0,
    saidasMes: 0,
    saldoMes: 0,
    totalEntradas: 0,
    totalSaidas: 0,
    saldoTotal: 0,
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [membros, usuarios, financeiro] = await Promise.all([
          membroService.list().catch(() => []),
          usuarioService.list().catch(() => []),
          financeiroService.list().catch(() => []),
        ]);

        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        // Filtra registros do mês atual
        const financeiroMes = financeiro.filter((f) => {
          if (!f || !f.dataRegistro) return false;
          const dataRegistro = new Date(f.dataRegistro);
          return (
            dataRegistro.getMonth() === currentMonth &&
            dataRegistro.getFullYear() === currentYear
          );
        });

        // Calcula totais do mês
        const entradasMes = financeiroMes.reduce((sum, f) => sum + (f.entrada || 0), 0);
        const saidasMes = financeiroMes.reduce((sum, f) => sum + (f.saida || 0), 0);
        const saldoMes = entradasMes - saidasMes;

        // Calcula totais gerais
        const totalEntradas = financeiro.reduce((sum, f) => sum + (f.entrada || 0), 0);
        const totalSaidas = financeiro.reduce((sum, f) => sum + (f.saida || 0), 0);
        const saldoTotal = totalEntradas - totalSaidas;

        // Ordena registros por data (mais recentes primeiro) e pega os 5 últimos
        const registrosOrdenados = [...financeiro]
          .sort((a, b) => {
            const dateA = a.dataRegistro ? new Date(a.dataRegistro).getTime() : 0;
            const dateB = b.dataRegistro ? new Date(b.dataRegistro).getTime() : 0;
            return dateB - dateA;
          })
          .slice(0, 5);

        setUltimosRegistros(registrosOrdenados);
        setStats({
          totalMembros: membros.length,
          totalUsuarios: usuarios.length,
          entradasMes,
          saidasMes,
          saldoMes,
          totalEntradas,
          totalSaidas,
          saldoTotal,
        });
      } catch (error) {
        console.error('Erro ao carregar dados do dashboard:', error);
        setStats({
          totalMembros: 0,
          totalUsuarios: 0,
          entradasMes: 0,
          saidasMes: 0,
          saldoMes: 0,
          totalEntradas: 0,
          totalSaidas: 0,
          saldoTotal: 0,
        });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return <Loading fullScreen />;
  }

  const cards = [
    {
      title: 'Total de Membros',
      value: stats.totalMembros,
      icon: UserCircle,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Total de Usuários',
      value: stats.totalUsuarios,
      icon: Users,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Entradas do Mês',
      value: formatCurrency(stats.entradasMes),
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Saídas do Mês',
      value: formatCurrency(stats.saidasMes),
      icon: TrendingDown,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
    },
    {
      title: 'Saldo do Mês',
      value: formatCurrency(stats.saldoMes),
      icon: DollarSign,
      color: stats.saldoMes >= 0 ? 'text-green-600' : 'text-red-600',
      bgColor: stats.saldoMes >= 0 ? 'bg-green-50' : 'bg-red-50',
    },
    {
      title: 'Saldo Total',
      value: formatCurrency(stats.saldoTotal),
      icon: DollarSign,
      color: stats.saldoTotal >= 0 ? 'text-green-600' : 'text-red-600',
      bgColor: stats.saldoTotal >= 0 ? 'bg-green-50' : 'bg-red-50',
    },
  ];

  const columns: TableColumn<Financeiro>[] = [
    {
      field: 'tipo',
      label: 'Tipo',
      render: (value) => (
        <Badge color={TIPO_FINANCEIRO_COLORS[value as string] || 'default'}>
          {TIPO_FINANCEIRO_LABELS[value as string] || value}
        </Badge>
      ),
    },
    {
      field: 'entrada',
      label: 'Entrada',
      format: 'currency',
    },
    {
      field: 'saida',
      label: 'Saída',
      format: 'currency',
    },
    {
      field: 'dataRegistro',
      label: 'Data',
      format: 'datetime',
    },
    {
      field: 'observacao',
      label: 'Observação',
      truncate: 30,
    },
  ];

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1 className="dashboard-title">Dashboard</h1>
        <p className="dashboard-subtitle">Visão geral do sistema</p>
      </div>

      <div className="dashboard-cards-grid">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.title} variant="elevated">
              <div className="dashboard-card-content">
                <div className="dashboard-card-info">
                  <p className="dashboard-card-title">{card.title}</p>
                  <p className="dashboard-card-value">{card.value}</p>
                </div>
                <div className={`dashboard-card-icon-wrapper ${card.bgColor}`}>
                  <Icon className={`dashboard-card-icon ${card.color}`} />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="dashboard-content-grid">
        <Card>
          <div className="dashboard-section-header">
            <div className="dashboard-section-header-content">
              <h2 className="dashboard-section-title">Últimos Registros Financeiros</h2>
              <p className="dashboard-section-subtitle">5 registros mais recentes</p>
            </div>
            <Button
              variant="ghost"
              size="small"
              onClick={() => navigate('/financeiro')}
              icon={<ArrowRight className="w-4 h-4" />}
            >
              Ver todos
            </Button>
          </div>
          {ultimosRegistros.length > 0 ? (
            <Table
              columns={columns}
              data={ultimosRegistros}
              actions={(row) => (
                <Button
                  variant="ghost"
                  size="small"
                  onClick={() => navigate(`/financeiro/${row.id}`)}
                  icon={<Eye className="w-4 h-4" />}
                  aria-label="Ver detalhes"
                >
                  <span className="sr-only">Ver</span>
                </Button>
              )}
            />
          ) : (
            <div className="dashboard-empty-state">
              <p>Nenhum registro financeiro encontrado</p>
            </div>
          )}
        </Card>

        <Card>
          <div className="dashboard-financial-summary">
            <h2 className="dashboard-section-title">Resumo Financeiro</h2>
            <p className="dashboard-section-subtitle">Totais gerais do sistema</p>
          </div>
          <div className="dashboard-summary-list">
            <div className="dashboard-summary-item">
              <span className="dashboard-summary-label">Total de Entradas</span>
              <span className="dashboard-summary-value-green">
                {formatCurrency(stats.totalEntradas)}
              </span>
            </div>
            <div className="dashboard-summary-item">
              <span className="dashboard-summary-label">Total de Saídas</span>
              <span className="dashboard-summary-value-red">
                {formatCurrency(stats.totalSaidas)}
              </span>
            </div>
            <div className="dashboard-summary-total">
              <span className="dashboard-summary-total-label">Saldo Total</span>
              <span className={stats.saldoTotal >= 0 ? 'dashboard-summary-total-value-green' : 'dashboard-summary-total-value-red'}>
                {formatCurrency(stats.saldoTotal)}
              </span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

