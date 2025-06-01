
export const capitalizeFirstLetter = (str: string | null | undefined): string => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export const formatDisplayName = (firstName: string | null, lastName: string | null): string => {
  const formattedFirst = capitalizeFirstLetter(firstName);
  const formattedLast = capitalizeFirstLetter(lastName);
  
  if (formattedFirst && formattedLast) {
    return `${formattedFirst} ${formattedLast}`;
  }
  
  return formattedFirst || formattedLast || 'Unknown User';
};
