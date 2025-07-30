/**
 * Converts a hex color string to an RGB object.
 * @param {string} hex The hex color string (e.g., "#RRGGBB" or "#RGB").
 * @returns {{r: number, g: number, b: number} | null} An object with r, g, b properties, or null if the hex is invalid.
 */
export function hexToRgb(hex) {
  if (!hex || typeof hex !== 'string') {
    return null;
  }

  // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
  const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  const fullHex = hex.replace(shorthandRegex, (m, r, g, b) => {
    return r + r + g + g + b + b;
  });

  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(fullHex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}