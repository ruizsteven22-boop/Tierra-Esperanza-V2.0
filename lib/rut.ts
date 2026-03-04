/**
 * Validates a Chilean RUT (Rol Único Tributario)
 * @param rut The RUT string (e.g., "12.345.678-9", "123456789", "12345678-k")
 * @returns boolean indicating if the RUT is valid
 */
export function validateRut(rut: string): boolean {
  if (!rut || typeof rut !== 'string') return false;

  // Clean the RUT: remove dots and hyphen, convert to uppercase
  const cleanRut = rut.replace(/[^0-9kK]/g, '').toUpperCase();
  
  if (cleanRut.length < 8 || cleanRut.length > 9) return false;

  const body = cleanRut.slice(0, -1);
  const dv = cleanRut.slice(-1);

  // Calculate check digit
  let sum = 0;
  let multiplier = 2;

  for (let i = body.length - 1; i >= 0; i--) {
    sum += parseInt(body[i]) * multiplier;
    multiplier = multiplier === 7 ? 2 : multiplier + 1;
  }

  const expectedDv = 11 - (sum % 11);
  let calculatedDv = '';
  
  if (expectedDv === 11) calculatedDv = '0';
  else if (expectedDv === 10) calculatedDv = 'K';
  else calculatedDv = expectedDv.toString();

  return calculatedDv === dv;
}

/**
 * Formats a Chilean RUT string
 * @param rut The RUT string to format
 * @returns Formatted RUT (e.g., "12.345.678-9")
 */
export function formatRut(rut: string): string {
  const cleanRut = rut.replace(/[^0-9kK]/g, '').toUpperCase();
  if (cleanRut.length < 2) return cleanRut;

  const body = cleanRut.slice(0, -1);
  const dv = cleanRut.slice(-1);

  let formattedBody = '';
  for (let i = body.length - 1, j = 1; i >= 0; i--, j++) {
    formattedBody = body[i] + formattedBody;
    if (j % 3 === 0 && i !== 0) {
      formattedBody = '.' + formattedBody;
    }
  }

  return `${formattedBody}-${dv}`;
}

/**
 * Cleans a RUT string for storage (removes dots and hyphen)
 * @param rut The RUT string to clean
 * @returns Cleaned RUT (e.g., "123456789")
 */
export function cleanRut(rut: string): string {
  return rut.replace(/[^0-9kK]/g, '').toUpperCase();
}
