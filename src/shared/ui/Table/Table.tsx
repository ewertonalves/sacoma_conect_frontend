import { ReactNode } from 'react';
import { formatCurrency, formatDate, formatDateTime } from '../../lib/formatters';
import { Loading } from '../Loading/Loading';

export interface TableColumn<T = any> {
  field: keyof T | string;
  label: string;
  sortable?: boolean;
  format?: 'currency' | 'date' | 'datetime' | 'cpf' | 'cep';
  render?: (value: any, row: T) => ReactNode;
  truncate?: number;
}

export interface TableProps<T = any> {
  columns: TableColumn<T>[];
  data: T[];
  loading?: boolean;
  onSort?: (field: string, direction: 'asc' | 'desc') => void;
  sortField?: string;
  sortDirection?: 'asc' | 'desc';
  actions?: (row: T) => ReactNode;
  emptyMessage?: string;
}

const formatValue = (value: any, format?: string): string => {
  if (value === null || value === undefined) return '-';

  switch (format) {
    case 'currency':
      return formatCurrency(typeof value === 'number' ? value : parseFloat(value));
    case 'date':
      return formatDate(value);
    case 'datetime':
      return formatDateTime(value);
    default:
      return String(value);
  }
};

export const Table = <T extends Record<string, any>>({
  columns,
  data,
  loading = false,
  onSort,
  sortField,
  sortDirection,
  actions,
  emptyMessage = 'Nenhum registro encontrado',
}: TableProps<T>) => {
  const handleSort = (field: string) => {
    if (!onSort || !columns.find((col) => col.field === field)?.sortable) return;

    const direction =
      sortField === field && sortDirection === 'asc' ? 'desc' : 'asc';
    onSort(field, direction);
  };

  // Garante que data seja sempre um array
  const safeData = Array.isArray(data) ? data : [];

  if (loading) {
    return (
      <div className="py-8">
        <Loading />
      </div>
    );
  }

  if (safeData.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((column) => (
              <th
                key={String(column.field)}
                className={`
                  px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider
                  ${column.sortable ? 'cursor-pointer hover:bg-gray-100' : ''}
                `}
                onClick={() => column.sortable && handleSort(String(column.field))}
              >
                <div className="flex items-center gap-2">
                  {column.label}
                  {column.sortable && sortField === column.field && (
                    <span className="text-gray-400">
                      {sortDirection === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </div>
              </th>
            ))}
            {actions && <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {safeData.map((row, index) => (
            <tr key={index} className="hover:bg-gray-50">
              {columns.map((column) => {
                const field = column.field as keyof T;
                let value = row[field];

                // Handle nested fields (e.g., "endereco.rua")
                if (typeof field === 'string' && field.includes('.')) {
                  const parts = field.split('.');
                  value = parts.reduce((obj: any, part) => obj?.[part], row);
                }

                let displayValue: ReactNode;

                if (column.render) {
                  displayValue = column.render(value, row);
                } else {
                  const formatted = formatValue(value, column.format);
                  displayValue = column.truncate && formatted.length > column.truncate
                    ? `${formatted.substring(0, column.truncate)}...`
                    : formatted;
                }

                return (
                  <td key={String(column.field)} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {displayValue}
                  </td>
                );
              })}
              {actions && (
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <div className="flex gap-2">{actions(row)}</div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

