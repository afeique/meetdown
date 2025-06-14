
export const isEmail = (input: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(input);
};

export const getInputType = (input: string): 'email' | 'unknown' => {
  if (isEmail(input)) {
    return 'email';
  }
  return 'unknown';
};

export const getPlaceholderText = (inputType: 'email' | 'unknown'): string => {
  switch (inputType) {
    case 'email':
      return 'Enter your email address';
    default:
      return 'Enter your email address';
  }
};
