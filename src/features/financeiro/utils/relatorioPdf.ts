import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { RelatorioFinanceiroResponse } from '../../../shared/types';
import { formatCurrency, formatDate, formatDateTime } from '../../../shared/lib/formatters';
import { CATEGORIA_FINANCEIRA_LABELS } from '../../../shared/lib/constants';

const TITULO = 'Relatório Financeiro';
const FONTE_TITULO = 18;
const FONTE_SUBTITULO = 11;
const MARGEM = 20;
const LARGURA_PAGINA = 210;

function formatDatePdf(dateStr: string): string {
  if (!dateStr) return '-';
  return formatDate(dateStr);
}

function formatCurrencyPdf(value: number): string {
  return formatCurrency(value);
}

function getMembroNome(item: RelatorioFinanceiroResponse['itens'][0]): string {
  const m = item.membro;
  if (!m) return '-';
  if (!('nome' in m)) return '-';
  const n = m.nome;
  return n != null && String(n).trim() !== '' ? String(n) : '-';
}

/**
 * Gera o layout do PDF a partir dos dados do relatório e dispara o download.
 */
export function downloadRelatorioPdf(relatorio: RelatorioFinanceiroResponse): void {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  let y = MARGEM;

  // Título
  doc.setFontSize(FONTE_TITULO);
  doc.setFont('helvetica', 'bold');
  doc.text(TITULO, MARGEM, y);
  y += 10;

  // Período
  const periodoLabel =
    relatorio.tipoPeriodo === 'PERSONALIZADO'
      ? 'Período personalizado'
      : relatorio.tipoPeriodo === 'SEMANAL'
        ? 'Período semanal'
        : 'Período mensal';
  doc.setFontSize(FONTE_SUBTITULO);
  doc.setFont('helvetica', 'normal');
  doc.text(
    `${periodoLabel}: ${formatDatePdf(relatorio.dataInicial)} a ${formatDatePdf(relatorio.dataFinal)}`,
    MARGEM,
    y
  );
  y += 12;

  // Tabela de itens
  const itens = relatorio.itens || [];
  const tableData = itens.map((item) => {
    const codigoDesc =
      item.descricaoCodigoFinanceiro != null && item.descricaoCodigoFinanceiro !== ''
        ? `${item.codigoFinanceiro} ${item.descricaoCodigoFinanceiro}`
        : String(item.codigoFinanceiro ?? '');
    const categoria = CATEGORIA_FINANCEIRA_LABELS[item.categoria] ?? item.categoria ?? '';
    return [
      String(item.id),
      codigoDesc,
      categoria,
      formatCurrencyPdf(item.entrada ?? 0),
      formatCurrencyPdf(item.saida ?? 0),
      getMembroNome(item),
      item.observacao?.slice(0, 24) ?? '-',
      formatDateTime(item.dataRegistro),
    ];
  });

  autoTable(doc, {
    startY: y,
    head: [['ID', 'Código', 'Categoria', 'Entrada', 'Saída', 'Membro', 'Obs.', 'Data']],
    body: tableData,
    theme: 'grid',
    headStyles: { fillColor: [66, 139, 202], textColor: 255, fontStyle: 'bold' },
    styles: { fontSize: 8 },
    columnStyles: {
      0: { cellWidth: 10 },
      1: { cellWidth: 26 },
      2: { cellWidth: 22 },
      3: { cellWidth: 22 },
      4: { cellWidth: 22 },
      5: { cellWidth: 28 },
      6: { cellWidth: 22 },
      7: { cellWidth: 30 },
    },
    margin: { left: MARGEM },
    tableWidth: LARGURA_PAGINA - 2 * MARGEM,
  });

  const finalY = (doc as any).lastAutoTable?.finalY ?? y;
  let nextY = finalY + 14;

  // Resumo (totais)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('Resumo do período', MARGEM, nextY);
  nextY += 7;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(`Total de entradas: ${formatCurrencyPdf(relatorio.totalEntrada ?? 0)}`, MARGEM, nextY);
  nextY += 6;
  doc.text(`Total de saídas: ${formatCurrencyPdf(relatorio.totalSaida ?? 0)}`, MARGEM, nextY);
  nextY += 6;
  doc.setFont('helvetica', 'bold');
  doc.text(`Saldo: ${formatCurrencyPdf(relatorio.saldo ?? 0)}`, MARGEM, nextY);

  // Rodapé (A4 height = 297mm)
  const pageHeightMm = 297;
  const totalPages = doc.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text(
      `Página ${p} de ${totalPages} - Gerado em ${formatDateTime(new Date().toISOString())}`,
      MARGEM,
      pageHeightMm - 10
    );
  }

  const nomeArquivo = `relatorio-financeiro-${relatorio.dataInicial}-${relatorio.dataFinal}.pdf`;
  doc.save(nomeArquivo);
}
