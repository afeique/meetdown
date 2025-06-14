
export const isPhone = (input: string): boolean => {
  // Remove all non-digit characters for validation
  const digitsOnly = input.replace(/\D/g, '');
  // Check if it's a valid US/Canada phone number (10 digits starting with 1-9)
  return digitsOnly.length === 10 && /^[1-9][0-9]{9}$/.test(digitsOnly);
};

export const formatPhoneNumber = (phoneNumber: string): string => {
  if (!phoneNumber) return '';
  
  // Clean the phone number (remove all non-digits)
  const cleanPhoneNumber = phoneNumber.replace(/\D/g, '');
  
  // Return formatted as "+1 [phone number]"
  return `+1 ${cleanPhoneNumber}`;
};

export const formatPhoneForDisplay = (phone: string): string => {
  if (!phone || phone.length !== 10) return phone;
  
  // Format as (XXX) XXX-XXXX
  return `(${phone.slice(0, 3)}) ${phone.slice(3, 6)}-${phone.slice(6)}`;
};

export const extractDigitsOnly = (phoneInput: string): string => {
  return phoneInput.replace(/\D/g, '');
};
