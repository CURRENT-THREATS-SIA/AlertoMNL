interface ShadowProps {
  shadowColor?: string;
  shadowOffset?: {
    width: number;
    height: number;
  };
  shadowOpacity?: number;
  shadowRadius?: number;
}

export function convertShadowToBoxShadow(shadow: ShadowProps): string {
  const color = shadow.shadowColor || '#000000';
  const offset = shadow.shadowOffset || { width: 0, height: 0 };
  const opacity = shadow.shadowOpacity || 0;
  const radius = shadow.shadowRadius || 0;

  // Convert color with opacity
  const rgba = color.replace(
    /^#?([a-f\d])([a-f\d])([a-f\d])$/i,
    (_, r, g, b) => `#${r}${r}${g}${g}${b}${b}`
  ).replace(
    /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i,
    (_, r, g, b) => `rgba(${parseInt(r, 16)}, ${parseInt(g, 16)}, ${parseInt(b, 16)}, ${opacity})`
  );

  return `${offset.width}px ${offset.height}px ${radius}px ${rgba}`;
}

// Example usage:
// const boxShadow = convertShadowToBoxShadow({
//   shadowColor: '#000000',
//   shadowOffset: { width: 0, height: 2 },
//   shadowOpacity: 0.25,
//   shadowRadius: 3.84
// });
// Result: "0px 2px 3.84px rgba(0, 0, 0, 0.25)" 