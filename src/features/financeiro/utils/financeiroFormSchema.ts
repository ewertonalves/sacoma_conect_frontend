import { z } from 'zod';
import type { CodigoFinanceiro } from '../../../shared/types';
import { parseCurrency } from '../../../shared/lib/formatters';

export function buildFinanceiroFormSchema(codigos: CodigoFinanceiro[]) {
  return z
    .object({
      codigoFinanceiro: z.string().min(1, 'Selecione o código financeiro'),
      entrada: z.string().optional(),
      saida: z.string().optional(),
      membroId: z.string().optional(),
      observacao: z.string().max(255, 'Observação deve ter no máximo 255 caracteres').optional(),
    })
    .superRefine((data, ctx) => {
      const def = codigos.find((c) => String(c.codigo) === data.codigoFinanceiro);
      if (!def) {
        if (codigos.length > 0) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Código financeiro inválido',
            path: ['codigoFinanceiro'],
          });
        }
        return;
      }
      const entrada = data.entrada ? parseCurrency(data.entrada) : 0;
      const saida = data.saida ? parseCurrency(data.saida) : 0;
      if (def.tipo === 'ENTRADA') {
        if (entrada <= 0) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Informe o valor de entrada (maior que zero)',
            path: ['entrada'],
          });
        }
        if (saida > 0) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Para receitas, o valor de saída deve ser zero',
            path: ['saida'],
          });
        }
      } else {
        if (saida <= 0) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Informe o valor de saída (maior que zero)',
            path: ['saida'],
          });
        }
        if (entrada > 0) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Para despesas, o valor de entrada deve ser zero',
            path: ['entrada'],
          });
        }
      }
    });
}
