
export const isPhone = (input: string): boolean => {
  // Remove all non-digit characters for validation
  const digitsOnly = input.replace(/\D/g, '');
  // Check if it's a valid phone number (10-15 digits, optionally starting with +)
  return /^(\+?1?)?[0-9]{10,14}$/.test(digitsOnly) && digitsOnly.length >= 10;
};

export const formatPhoneNumber = (input: string): string => {
  // Remove all non-digit characters except +
  const cleaned = input.replace(/[^\d+]/g, '');
  
  // If it doesn't start with +, add +1 for US numbers
  if (cleaned.match(/^\d{10}$/)) {
    return `+1${cleaned}`;
  }
  
  // If it starts with 1 and has 11 digits, add +
  if (cleaned.match(/^1\d{10}$/)) {
    return `+${cleaned}`;
  }
  
  // If it already starts with +, return as is
  if (cleaned.startsWith('+')) {
    return cleaned;
  }
  
  // For other formats, add + if not present
  return cleaned.startsWith('+') ? cleaned : `+${cleaned}`;
};
