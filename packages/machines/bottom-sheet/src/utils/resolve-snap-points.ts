export function resolveSnapPoints(
  snapPoints: (number | string)[] | undefined,
  containerHeight: number,
): number[] | undefined {
  return snapPoints
    ?.map((point) => {
      if (typeof point === "number") return containerHeight * point
      if (typeof point === "string") {
        return parseFloat(point)
      }
      throw new Error(`Invalid snap point: ${point}`)
    })
    .sort((a, b) => a - b)
}
