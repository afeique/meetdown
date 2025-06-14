
export const isPhone = (input: string): boolean => {
  // Remove all non-digit characters for validation
  const digitsOnly = input.replace(/\D/g, '');
  // Check if it's a valid phone number (10-15 digits, optionally starting with +)
  return /^(\+?1?)?[0-9]{10,14}$/.test(digitsOnly) && digitsOnly.length >= 10;
};

export const formatPhoneNumber = (countryCode: string, phoneNumber: string): string => {
  if (!countryCode || !phoneNumber) return '';
  
  // Clean the country code (ensure it has + prefix)
  const cleanCountryCode = countryCode.startsWith('+') ? countryCode : `+${countryCode}`;
  
  // Clean the phone number (remove all non-digits)
  const cleanPhoneNumber = phoneNumber.replace(/\D/g, '');
  
  // Return formatted as "+[country code] [phone number]"
  return `${cleanCountryCode} ${cleanPhoneNumber}`;
};
