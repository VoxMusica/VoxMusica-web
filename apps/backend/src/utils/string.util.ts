export const stripAccents = (str: string): string => str.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
