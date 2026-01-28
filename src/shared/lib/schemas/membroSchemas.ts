import { z } from 'zod';
import { validateCPF, validateCEP } from '../validators';

/**
 * Schema para validação de campo obrigatório de texto
 */
export const requiredString = (minLength: number, maxLength: number, fieldName: string) =>
  z.string()
    .min(1, `${fieldName} é obrigatório`)
    .min(minLength, `${fieldName} deve ter entre ${minLength} e ${maxLength} caracteres`)
    .max(maxLength, `${fieldName} deve ter entre ${minLength} e ${maxLength} caracteres`);

/**
 * Schema para validação de campo obrigatório de texto simples
 */
export const requiredStringSimple = (fieldName: string, maxLength: number) =>
  z.string()
    .min(1, `${fieldName} é obrigatório`)
    .max(maxLength, `${fieldName} deve ter no máximo ${maxLength} caracteres`);

/**
 * Schema para validação de CPF
 */
export const cpfSchema = z.string()
  .min(1, 'CPF é obrigatório')
  .refine((val: string) => {
    if (!val || val.trim() === '') return false;
    const cleanCpf = val.replace(/\D/g, '');
    return cleanCpf.length === 11 && validateCPF(cleanCpf);
  }, 'CPF inválido');

/**
 * Schema para validação de CEP
 */
export const cepSchema = z.string()
  .min(1, 'CEP é obrigatório')
  .refine((val: string) => {
    if (!val || val.trim() === '') return false;
    return validateCEP(val);
  }, 'CEP inválido');

/**
 * Schema para validação de campo opcional de texto
 */
export const optionalString = (maxLength: number, fieldName: string) =>
  z.string().max(maxLength, `${fieldName} deve ter no máximo ${maxLength} caracteres`).optional();

/**
 * Schema completo para validação de membro
 */
export const membroSchema = z.object({
  nome: requiredString(3, 120, 'Nome'),
  cpf: cpfSchema,
  rg: requiredStringSimple('RG', 20),
  ri: requiredStringSimple('RI', 20),
  cargo: optionalString(60, 'Cargo'),
  endereco: z.object({
    rua: requiredStringSimple('Rua', 120),
    numero: requiredStringSimple('Número', 10),
    cep: cepSchema,
    bairro: requiredStringSimple('Bairro', 80),
    cidade: requiredStringSimple('Cidade', 100),
    estado: z.string()
      .min(1, 'Estado é obrigatório')
      .min(2, 'Estado deve ter 2 caracteres')
      .max(2, 'Estado deve ter 2 caracteres'),
    complemento: optionalString(120, 'Complemento'),
  }),
});

export type MembroFormData = z.infer<typeof membroSchema>;
