const onlyDigits = (s?: string) => (s ?? '').toString().replace(/\D/g, '');

export const formatSSN = (input?: string): string => {
  const digits = onlyDigits(input).slice(0, 9);
  if (digits.length <= 3) return digits;
  if (digits.length <= 5) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 5)}-${digits.slice(5)}`;
};

export const unformatSSN = (input?: string): string => {
  return onlyDigits(input);
};

export const formatEIN = (input?: string): string => {
  const digits = onlyDigits(input).slice(0, 9);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}-${digits.slice(2)}`;
};

export const unformatEIN = (input?: string): string => {
  return onlyDigits(input);
};

export const isValidSSN = (input?: string): boolean =>
  onlyDigits(input).length === 9;
export const isValidEIN = (input?: string): boolean =>
  onlyDigits(input).length === 9;
