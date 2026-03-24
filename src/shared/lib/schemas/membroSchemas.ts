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

/** Cadastro novo membro: nenhum campo obrigatório; formatos validados quando preenchidos. */
export const membroCadastroSchema = z.object({
  nome: z.string().max(120, 'Nome deve ter no máximo 120 caracteres'),
  cpf: z
    .string()
    .max(14, 'CPF deve ter no máximo 14 caracteres')
    .refine(
      (val) => {
        const digits = (val || '').replace(/\D/g, '');
        return digits.length === 0 || (digits.length === 11 && validateCPF(digits));
      },
      'CPF inválido'
    ),
  rg: z.string().max(20, 'RG deve ter no máximo 20 caracteres'),
  ri: z.string().max(20, 'RI deve ter no máximo 20 caracteres'),
  cargo: z.string().max(60, 'Cargo deve ter no máximo 60 caracteres'),
  endereco: z.object({
    rua: z.string().max(120, 'Rua deve ter no máximo 120 caracteres'),
    numero: z.string().max(10, 'Número deve ter no máximo 10 caracteres'),
    cep: z
      .string()
      .max(9, 'CEP deve ter no máximo 9 caracteres')
      .refine(
        (val) => {
          const digits = (val || '').replace(/\D/g, '');
          return digits.length === 0 || validateCEP(val);
        },
        'CEP inválido'
      ),
    bairro: z.string().max(80, 'Bairro deve ter no máximo 80 caracteres'),
    cidade: z.string().max(100, 'Cidade deve ter no máximo 100 caracteres'),
    estado: z.string().max(2, 'Estado deve ter no máximo 2 caracteres'),
    complemento: z.string().max(120, 'Complemento deve ter no máximo 120 caracteres'),
  }),
});

export type MembroCadastroFormData = z.infer<typeof membroCadastroSchema>;
