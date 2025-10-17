/**
 * Utilitários de validação e formatação para formulários
 */

/**
 * Formata um número de telefone brasileiro
 * @param value - String com números do telefone
 * @returns String formatada no padrão brasileiro (XX) XXXXX-XXXX ou (XX) XXXX-XXXX
 */
export const formatPhoneBrazil = (value: string): string => {
  // Remove tudo que não é número
  const numbers = value.replace(/\D/g, "");
  
  // Limita a 11 dígitos
  const limited = numbers.slice(0, 11);
  
  // Formata conforme o tamanho
  if (limited.length <= 2) {
    return limited;
  } else if (limited.length <= 6) {
    return `(${limited.slice(0, 2)}) ${limited.slice(2)}`;
  } else if (limited.length <= 10) {
    return `(${limited.slice(0, 2)}) ${limited.slice(2, 6)}-${limited.slice(6)}`;
  } else {
    return `(${limited.slice(0, 2)}) ${limited.slice(2, 7)}-${limited.slice(7, 11)}`;
  }
};

/**
 * Valida um endereço de email
 * @param email - String com o email a ser validado
 * @returns Boolean indicando se o email é válido
 */
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Valida um número de telefone brasileiro
 * @param phone - String com o telefone formatado
 * @returns Boolean indicando se o telefone é válido (10 ou 11 dígitos)
 */
export const validatePhone = (phone: string): boolean => {
  const numbers = phone.replace(/\D/g, "");
  return numbers.length === 10 || numbers.length === 11;
};

/**
 * Valida a força de uma senha
 * @param password - String com a senha
 * @returns Objeto com informações sobre a força da senha
 */
export const validatePasswordStrength = (password: string): {
  isValid: boolean;
  strength: 'weak' | 'medium' | 'strong';
  message: string;
} => {
  if (password.length < 6) {
    return {
      isValid: false,
      strength: 'weak',
      message: 'A senha deve ter pelo menos 6 caracteres'
    };
  }
  
  if (password.length < 8) {
    return {
      isValid: true,
      strength: 'weak',
      message: 'Senha fraca'
    };
  }
  
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
  const strengthCount = [hasUpperCase, hasLowerCase, hasNumbers, hasSpecialChar].filter(Boolean).length;
  
  if (strengthCount >= 3 && password.length >= 10) {
    return {
      isValid: true,
      strength: 'strong',
      message: 'Senha forte'
    };
  }
  
  if (strengthCount >= 2 && password.length >= 8) {
    return {
      isValid: true,
      strength: 'medium',
      message: 'Senha média'
    };
  }
  
  return {
    isValid: true,
    strength: 'weak',
    message: 'Senha fraca'
  };
};

/**
 * Formata um CPF brasileiro
 * @param value - String com números do CPF
 * @returns String formatada no padrão XXX.XXX.XXX-XX
 */
export const formatCPF = (value: string): string => {
  const numbers = value.replace(/\D/g, "");
  const limited = numbers.slice(0, 11);
  
  if (limited.length <= 3) {
    return limited;
  } else if (limited.length <= 6) {
    return `${limited.slice(0, 3)}.${limited.slice(3)}`;
  } else if (limited.length <= 9) {
    return `${limited.slice(0, 3)}.${limited.slice(3, 6)}.${limited.slice(6)}`;
  } else {
    return `${limited.slice(0, 3)}.${limited.slice(3, 6)}.${limited.slice(6, 9)}-${limited.slice(9)}`;
  }
};

/**
 * Valida um CPF brasileiro
 * @param cpf - String com o CPF formatado
 * @returns Boolean indicando se o CPF é válido
 */
export const validateCPF = (cpf: string): boolean => {
  const numbers = cpf.replace(/\D/g, "");
  
  if (numbers.length !== 11) return false;
  
  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1{10}$/.test(numbers)) return false;
  
  // Validação do primeiro dígito verificador
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(numbers.charAt(i)) * (10 - i);
  }
  let remainder = 11 - (sum % 11);
  let digit = remainder >= 10 ? 0 : remainder;
  
  if (digit !== parseInt(numbers.charAt(9))) return false;
  
  // Validação do segundo dígito verificador
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(numbers.charAt(i)) * (11 - i);
  }
  remainder = 11 - (sum % 11);
  digit = remainder >= 10 ? 0 : remainder;
  
  return digit === parseInt(numbers.charAt(10));
};

/**
 * Formata um CEP brasileiro
 * @param value - String com números do CEP
 * @returns String formatada no padrão XXXXX-XXX
 */
export const formatCEP = (value: string): string => {
  const numbers = value.replace(/\D/g, "");
  const limited = numbers.slice(0, 8);
  
  if (limited.length <= 5) {
    return limited;
  } else {
    return `${limited.slice(0, 5)}-${limited.slice(5)}`;
  }
};

/**
 * Valida um CEP brasileiro
 * @param cep - String com o CEP formatado
 * @returns Boolean indicando se o CEP é válido
 */
export const validateCEP = (cep: string): boolean => {
  const numbers = cep.replace(/\D/g, "");
  return numbers.length === 8;
};
