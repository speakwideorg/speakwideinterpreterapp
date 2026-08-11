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

/**
 * Mask a full SSN for display, showing only the last 4 digits: •••-••-1234
 *
 * Interpreters stay permanently signed in so they can receive session-request
 * notifications, which means anyone who picks up an unlocked device can read
 * whatever the profile screen shows. Never render a full SSN — the last 4 is
 * enough for an interpreter to confirm which number is on file.
 */
export const maskSSN = (input?: string): string => {
  const digits = onlyDigits(input);
  if (!digits) return 'N/A';
  if (digits.length < 4) return '•••-••-••••';
  return `•••-••-${digits.slice(-4)}`;
};

/**
 * Mask an EIN for display, showing only the last 4 digits: ••-•••1234
 */
export const maskEIN = (input?: string): string => {
  const digits = onlyDigits(input);
  if (!digits) return 'N/A';
  if (digits.length < 4) return '••-•••••••';
  return `••-•••${digits.slice(-4)}`;
};
