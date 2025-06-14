
export const formatPhoneDisplay = (phone: string): string => {
  if (!phone) return phone;
  
  // Remove all non-digit characters
  const digitsOnly = phone.replace(/\D/g, '');
  
  // Handle US/Canada numbers (11 digits starting with 1, or 10 digits)
  if (digitsOnly.length === 11 && digitsOnly.startsWith('1')) {
    const areaCode = digitsOnly.slice(1, 4);
    const exchange = digitsOnly.slice(4, 7);
    const number = digitsOnly.slice(7, 11);
    return `+1 (${areaCode}) ${exchange}-${number}`;
  } else if (digitsOnly.length === 10) {
    const areaCode = digitsOnly.slice(0, 3);
    const exchange = digitsOnly.slice(3, 6);
    const number = digitsOnly.slice(6, 10);
    return `+1 (${areaCode}) ${exchange}-${number}`;
  }
  
  // Handle other international formats
  if (phone.startsWith('+')) {
    // For international numbers, try to format nicely
    if (digitsOnly.length >= 10) {
      const countryCode = digitsOnly.slice(0, digitsOnly.length - 10);
      const remaining = digitsOnly.slice(digitsOnly.length - 10);
      const areaCode = remaining.slice(0, 3);
      const exchange = remaining.slice(3, 6);
      const number = remaining.slice(6, 10);
      return `+${countryCode} (${areaCode}) ${exchange}-${number}`;
    }
  }
  
  // If we can't format it nicely, return as is
  return phone;
};
