export function move<T>(items: T[], fromIndex: number, toIndex: number): T[] {
  const result = [...items]
  const [removed] = result.splice(fromIndex, 1)
  result.splice(toIndex, 0, removed)
  return result
}

export function getDestinationIndex(
  totalCount: number,
  fromIndex: number,
  toIndex: number,
  placement: "before" | "after",
): number {
  let dest = placement === "after" ? toIndex + 1 : toIndex
  if (fromIndex < dest) dest -= 1
  return Math.max(0, Math.min(dest, totalCount - 1))
}

export interface ReorderOptions<T> {
  source: string | string[]
  target: string
  placement: "before" | "after" | "on"
  itemToValue: (item: T) => string
}

export function reorder<T>(items: T[], options: ReorderOptions<T>): T[] {
  const { target, placement, itemToValue } = options
  const sourceValues = new Set(Array.isArray(options.source) ? options.source : [options.source])

  const dragged: T[] = []
  const remaining: T[] = []

  for (const item of items) {
    if (sourceValues.has(itemToValue(item))) {
      dragged.push(item)
    } else {
      remaining.push(item)
    }
  }

  if (dragged.length === 0) return items

  const toIndex = remaining.findIndex((item) => itemToValue(item) === target)
  if (toIndex === -1) return [...remaining, ...dragged]

  const insertAt = placement === "before" ? toIndex : toIndex + 1
  return [...remaining.slice(0, insertAt), ...dragged, ...remaining.slice(insertAt)]
}
