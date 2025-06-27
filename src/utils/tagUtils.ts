
export const parseTagsFromInput = (input: string): string[] => {
  return input
    .split(/[,;]/)
    .map(tag => tag.trim())
    .filter(tag => tag.length > 0)
    .map(tag => tag.toLowerCase());
};
