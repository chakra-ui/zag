export function findClosestSnapPoint(currentY: number, snapPoints: number[]): number {
  return snapPoints.reduce((prev, curr) => (Math.abs(curr - currentY) < Math.abs(prev - currentY) ? curr : prev))
}
