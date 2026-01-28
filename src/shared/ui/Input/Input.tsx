import { forwardRef, useState } from 'react';
import type { InputHTMLAttributes } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { formatCPF, formatCEP } from '../../lib/formatters';

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  helperText?: string;
  mask?: 'cpf' | 'cep' | 'phone' | 'currency';
  showPasswordToggle?: boolean;
  size?: 'small' | 'medium' | 'large';
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      mask,
      showPasswordToggle = false,
      type = 'text',
      size = 'medium',
      className = '',
      required,
      value: controlledValue,
      onChange,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);
    const [internalValue, setInternalValue] = useState('');

    const isControlled = controlledValue !== undefined || onChange !== undefined;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      let newValue = e.target.value;

      // Aplica máscara apenas se especificada
      if (mask) {
        if (mask === 'cpf') {
          newValue = formatCPF(newValue);
        } else if (mask === 'cep') {
          newValue = formatCEP(newValue);
        }
      }

      if (!isControlled) {
        setInternalValue(newValue);
      }
      
      if (onChange) {
        const syntheticEvent = {
          ...e,
          target: { ...e.target, value: newValue },
        } as React.ChangeEvent<HTMLInputElement>;
        onChange(syntheticEvent);
      }
    };

    // Formata o valor quando é controlado e tem máscara
    const getFormattedValue = (value: string | number | readonly string[] | undefined): string => {
      if (value === undefined || value === null || value === '') return '';
      const stringValue = String(value);
      
      if (mask === 'cpf') {
        if (stringValue.includes('.') && stringValue.includes('-')) {
          return stringValue;
        }
        return formatCPF(stringValue);
      } else if (mask === 'cep') {
        if (stringValue.includes('-')) {
          return stringValue;
        }
        return formatCEP(stringValue);
      }
      return stringValue;
    };

    const inputProps: { value?: string } = {};
    if (isControlled && controlledValue !== undefined) {
      inputProps.value = getFormattedValue(controlledValue);
    } else if (!isControlled) {
      inputProps.value = internalValue;
    }

    const inputType = showPasswordToggle && type === 'password' 
      ? (showPassword ? 'text' : 'password')
      : type;

    const sizeClasses = {
      small: 'px-2 py-1 text-sm',
      medium: 'px-3 py-2 text-base',
      large: 'px-4 py-3 text-lg',
    };

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <div className="relative">
          <input
            {...props}
            ref={ref}
            type={inputType}
            {...inputProps}
            onChange={handleChange}
            className={`
              w-full border rounded-md
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
              disabled:bg-gray-100 disabled:cursor-not-allowed
              ${error ? 'border-red-500' : 'border-gray-300'}
              ${sizeClasses[size]}
              ${className}
            `}
            required={required}
          />
          {showPasswordToggle && type === 'password' && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          )}
        </div>
        {error && (
          <p className="mt-1 text-sm text-red-600" role="alert">
            {error}
          </p>
        )}
        {helperText && !error && (
          <p className="mt-1 text-sm text-gray-500">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

