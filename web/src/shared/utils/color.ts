const interpolateColorHex = (startColorHex: string, endColorHex: string, time: number): string => {
  const hexToRgb = (
    hex: string,
  ): {
    r: number;
    g: number;
    b: number;
  } => {
    const cleanHex: string = hex.replace('#', '');
    const bigint: number = parseInt(cleanHex, 16);

    return {
      r: (bigint >> 16) & 255,
      g: (bigint >> 8) & 255,
      b: bigint & 255,
    };
  };

  const startRGB: {
    r: number;
    g: number;
    b: number;
  } = hexToRgb(startColorHex);
  const endRGB: {
    r: number;
    g: number;
    b: number;
  } = hexToRgb(endColorHex);

  const r: number = Math.round(startRGB.r + (endRGB.r - startRGB.r) * time);
  const g: number = Math.round(startRGB.g + (endRGB.g - startRGB.g) * time);
  const b: number = Math.round(startRGB.b + (endRGB.b - startRGB.b) * time);

  return `rgb(${r},${g},${b})`;
};

export { interpolateColorHex };
