export const formatCPF = (cpf: string | null | undefined): string => {
  if (!cpf || typeof cpf !== 'string') return '';
  const cleanCPF = cpf.replace(/\D/g, '');
  
  if (cleanCPF.length <= 3) {
    return cleanCPF;
  } else if (cleanCPF.length <= 6) {
    return cleanCPF.replace(/(\d{3})(\d+)/, '$1.$2');
  } else if (cleanCPF.length <= 9) {
    return cleanCPF.replace(/(\d{3})(\d{3})(\d+)/, '$1.$2.$3');
  } else {
    return cleanCPF.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  }
};

export const formatCEP = (cep: string | null | undefined): string => {
  if (!cep || typeof cep !== 'string') return '';
  const cleanCEP = cep.replace(/\D/g, '');
  
  if (cleanCEP.length <= 5) {
    return cleanCEP;
  } else {
    return cleanCEP.replace(/(\d{5})(\d{3})/, '$1-$2');
  }
};

export const formatCurrency = (value: number | string): string => {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(numValue);
};

export const formatDate = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(dateObj);
};

export const formatDateTime = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(dateObj);
};

export const parseCurrency = (value: string): number => {
  if (!value) return 0;
  // Remove R$ e espaços antes de processar
  const cleanValue = value.replace(/R\$\s*/g, '').trim().replace(/[^\d,.-]/g, '');
  if (cleanValue.includes(',')) {
    return parseFloat(cleanValue.replace(/\./g, '').replace(',', '.')) || 0;
  }
  return parseFloat(cleanValue) || 0;
};

export const formatCurrencyInput = (value: string | null | undefined): string => {
  if (!value || typeof value !== 'string') return '';
  
  // Remove R$ e espaços para processar apenas os números
  const cleanValue = value.replace(/R\$\s*/g, '').trim();
  const numbers = cleanValue.replace(/\D/g, '');
  
  if (numbers === '') return '';
  
  const amount = parseFloat(numbers) / 100;
  
  const formatted = new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
  
  return `R$ ${formatted}`;
};

