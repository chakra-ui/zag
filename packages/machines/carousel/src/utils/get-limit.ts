export function getLimit(min: number, max: number) {
  const length = Math.abs(min - max)

  function reachedMin(n: number): boolean {
    return n < min
  }

  function reachedMax(n: number): boolean {
    return n > max
  }

  function reachedAny(n: number): boolean {
    return reachedMin(n) || reachedMax(n)
  }

  function constrain(n: number): number {
    if (!reachedAny(n)) return n
    return reachedMin(n) ? min : max
  }

  function removeOffset(n: number): number {
    if (!length) return n
    return n - length * Math.ceil((n - max) / length)
  }

  return {
    length,
    max,
    min,
    constrain,
    reachedAny,
    reachedMax,
    reachedMin,
    removeOffset,
  }
}
