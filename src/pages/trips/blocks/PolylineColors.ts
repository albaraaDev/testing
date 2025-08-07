export const PolylineColors = ['#0c0fd1', '#915404'];

export const getColor = (index: string) => {
  // Hash string to number
  let hash = 0;
  for (let i = 0; i < index.length; i++) {
    hash = index.charCodeAt(i) + ((hash << 5) - hash);
  }
  return PolylineColors[Math.abs(hash) % PolylineColors.length];
};
