
export const isEmail = (input: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(input);
};

export const getInputType = (emailOrPhone: string): 'email' | 'phone' | 'unknown' => {
  if (!emailOrPhone.trim()) return 'unknown';
  if (isEmail(emailOrPhone)) return 'email';
  
  // Import phone validation from phoneUtils
  const digitsOnly = emailOrPhone.replace(/\D/g, '');
  const isValidPhone = /^(\+?1?)?[0-9]{10,14}$/.test(digitsOnly) && digitsOnly.length >= 10;
  
  if (isValidPhone) return 'phone';
  return 'unknown';
};

export const getPlaceholderText = (inputType: 'email' | 'phone' | 'unknown'): string => {
  if (inputType === 'email') return 'john.doe@example.com';
  if (inputType === 'phone') return '+1 (555) 123-4567';
  return 'Enter email or phone number';
};
