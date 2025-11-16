
// Helper function to get a random number within a range
export const random = (min: number, max: number): number => Math.random() * (max - min) + min;

// Helper function to calculate the distance between two points
export const calculateDistance = (p1x: number, p1y: number, p2x: number, p2y: number): number => {
  const xDistance = p1x - p2x;
  const yDistance = p1y - p2y;
  return Math.sqrt(Math.pow(xDistance, 2) + Math.pow(yDistance, 2));
};
