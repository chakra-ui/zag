export function getClosestSnapIndex(snapPoints: number[], position: number): number {
  return snapPoints.reduce(
    (closest, point, index) =>
      Math.abs(point - position) < Math.abs(snapPoints[closest] - position) ? index : closest,
    0,
  )
}

// At rest the closest point; on a flick, the next point in its direction
export function getReleaseSnapIndex(snapPoints: number[], position: number, velocity = 0): number {
  if (!velocity) return getClosestSnapIndex(snapPoints, position)
  const sign = Math.sign(velocity)
  let target = -1
  snapPoints.forEach((point, index) => {
    if ((point - position) * sign <= 0) return
    if (target === -1 || Math.abs(point - position) < Math.abs(snapPoints[target] - position)) target = index
  })
  return target === -1 ? getClosestSnapIndex(snapPoints, position) : target
}
