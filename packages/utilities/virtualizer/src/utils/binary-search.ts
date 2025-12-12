/**
 * Binary search utilities for virtualization
 */

export interface BinarySearchOptions {
  count: number
  paddingStart: number
  getSizeFn: (index: number) => number
  getPrefixSizeFn: (index: number) => number
}

/**
 * Find index at target offset using binary search with hint
 */
export function findIndexAtOffsetBinary(
  targetOffset: number,
  options: BinarySearchOptions,
  startHint: number = 0,
): number {
  const { count, paddingStart, getSizeFn, getPrefixSizeFn } = options

  if (count === 0) return 0

  const adjustedOffset = targetOffset - paddingStart
  if (adjustedOffset <= 0) return 0

  // Use hint as starting point for search
  let low = Math.max(0, startHint - 10)
  let high = count - 1

  while (low <= high) {
    const mid = Math.floor((low + high) / 2)
    const midStart = getPrefixSizeFn(mid - 1)
    const midEnd = midStart + getSizeFn(mid)

    if (adjustedOffset >= midStart && adjustedOffset < midEnd) {
      return mid
    } else if (adjustedOffset < midStart) {
      high = mid - 1
    } else {
      low = mid + 1
    }
  }

  return Math.min(Math.max(low, 0), count - 1)
}

/**
 * Find range of indices visible in viewport using binary search
 */
export function findVisibleRangeBinary(
  viewportStart: number,
  viewportEnd: number,
  options: BinarySearchOptions,
): { startIndex: number; endIndex: number } {
  const startIndex = findIndexAtOffsetBinary(viewportStart, options)
  const endIndex = findIndexAtOffsetBinary(viewportEnd, options, startIndex)

  return { startIndex, endIndex }
}

/**
 * Binary search for finding exact or nearest match
 */
export function findNearestIndex<T>(items: T[], target: number, getValue: (item: T) => number): number {
  if (items.length === 0) return -1

  let left = 0
  let right = items.length - 1
  let nearest = 0
  let minDiff = Math.abs(getValue(items[0]) - target)

  while (left <= right) {
    const mid = Math.floor((left + right) / 2)
    const value = getValue(items[mid])
    const diff = Math.abs(value - target)

    if (diff < minDiff) {
      minDiff = diff
      nearest = mid
    }

    if (value === target) {
      return mid
    } else if (value < target) {
      left = mid + 1
    } else {
      right = mid - 1
    }
  }

  return nearest
}

/**
 * Find insertion index in sorted array
 */
export function findInsertionIndex<T>(items: T[], value: number, getValue: (item: T) => number): number {
  let left = 0
  let right = items.length

  while (left < right) {
    const mid = Math.floor((left + right) / 2)
    if (getValue(items[mid]) < value) {
      left = mid + 1
    } else {
      right = mid
    }
  }

  return left
}

/**
 * Find insertion index to the right of existing matches in a sorted array (upper bound).
 * Returns the first index where `getValue(item) > value`.
 */
export function findInsertionIndexRight<T>(items: T[], value: number, getValue: (item: T) => number): number {
  let left = 0
  let right = items.length

  while (left < right) {
    const mid = Math.floor((left + right) / 2)
    if (getValue(items[mid]) <= value) {
      left = mid + 1
    } else {
      right = mid
    }
  }

  return left
}
