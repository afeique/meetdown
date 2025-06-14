
export const isPhone = (input: string): boolean => {
  // Remove all non-digit characters for validation
  const digitsOnly = input.replace(/\D/g, '');
  // Check if it's a valid US/Canada phone number (10 digits)
  return digitsOnly.length === 10;
};

export const formatPhoneNumber = (phoneNumber: string): string => {
  if (!phoneNumber) return '';
  
  // Clean the phone number (remove all non-digits)
  const cleanPhoneNumber = phoneNumber.replace(/\D/g, '');
  
  // Return formatted as "+1 [phone number]"
  return `+1 ${cleanPhoneNumber}`;
};
