/**
 * Utilidad para formatear valores monetarios
 * Formatea números como moneda local (pesos argentinos)
 */

/**
 * Formatea un número como moneda local
 * @param value - Valor numérico a formatear
 * @param locale - Locale para el formato (default: es-AR)
 * @param currency - Código de moneda (default: ARS)
 * @returns String formateado como moneda
 */
export const formatCurrency = (
  value: number,
  locale: string = 'es-AR',
  currency: string = 'ARS'
): string => {
  if (value === null || value === undefined || isNaN(value)) {
    return '$0';
  }

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
};

/**
 * Formatea un número como moneda simplificada (sin símbolo de moneda)
 * @param value - Valor numérico a formatear
 * @returns String formateado como número con decimales
 */
export const formatCurrencySimple = (value: number): string => {
  if (value === null || value === undefined || isNaN(value)) {
    return '0';
  }

  return new Intl.NumberFormat('es-AR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
};
