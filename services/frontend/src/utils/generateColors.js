export const generateColors = (numColors, transparency) => {
    const colors = [];
    for (let i = 0; i < numColors; i++) {
      const hue = (i * (360 / numColors)) % 360;
      const color = `hsla(${hue}, 70%, 50%, ${transparency})`;
      colors.push(color);
    }
    return colors;
  };

export function hexToRgb(hex, result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)) {
    return result ? result.map(i => parseInt(i, 16)).slice(1) : null
    //returns [23, 14, 45] -> reformat if needed
  }
  