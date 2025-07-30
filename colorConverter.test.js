import { hexToRgb } from './colorConverter';

describe('hexToRgb', () => {
  test('should convert a full-length hex color to RGB', () => {
    expect(hexToRgb('#FF5733')).toEqual({ r: 255, g: 87, b: 51 });
  });

  test('should convert a full-length hex color without a hash to RGB', () => {
    expect(hexToRgb('11AACC')).toEqual({ r: 17, g: 170, b: 204 });
  });

  test('should convert a shorthand hex color to RGB', () => {
    expect(hexToRgb('#F0C')).toEqual({ r: 255, g: 0, b: 204 });
  });

  test('should return null for an invalid hex color string', () => {
    expect(hexToRgb('#GGHHII')).toBeNull();
  });

  test('should return null for a hex color string that is too short', () => {
    expect(hexToRgb('#F0')).toBeNull();
  });

  test('should return null for non-string input', () => {
    expect(hexToRgb(123)).toBeNull();
    expect(hexToRgb(null)).toBeNull();
    expect(hexToRgb(undefined)).toBeNull();
  });
});