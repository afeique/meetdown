
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

// Legacy function for single input formatting (for backward compatibility)
export const formatSinglePhoneNumber = (input: string): string => {
  // Remove all non-digit characters except +
  const cleaned = input.replace(/[^\d+]/g, '');
  
  // If it doesn't start with +, add +1 for US numbers
  if (cleaned.match(/^\d{10}$/)) {
    return `+1 ${cleaned}`;
  }
  
  // If it starts with 1 and has 11 digits, add +
  if (cleaned.match(/^1\d{10}$/)) {
    return `+${cleaned.slice(0, 1)} ${cleaned.slice(1)}`;
  }
  
  // If it already starts with +, format it properly
  if (cleaned.startsWith('+')) {
    const countryCode = cleaned.match(/^\+\d{1,3}/)?.[0] || '+1';
    const phoneNumber = cleaned.slice(countryCode.length);
    return `${countryCode} ${phoneNumber}`;
  }
  
  // For other formats, add + if not present
  return cleaned.startsWith('+') ? cleaned : `+${cleaned}`;
};
