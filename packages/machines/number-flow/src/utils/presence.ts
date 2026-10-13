import { isDigitSegment, type Segment } from "./segments"

/** Merges the rendered segments with the next ones by key: removed ones stay as `exiting` in place, new ones are `entering`, and a key that comes back is present again. On a reorder (locale or format change) the next order wins. */
export function mergeSegments(prev: Segment[], next: Segment[]): Segment[] {
  const nextKeys = new Set(next.map((segment) => segment.key))
  const prevByKey = new Map(prev.map((segment) => [segment.key, segment]))
  const emitted = new Set<string>()
  const result: Segment[] = []

  let i = 0
  let j = 0
  while (i < prev.length || j < next.length) {
    const p = prev[i]
    const n = next[j]

    if (p && emitted.has(p.key)) {
      i++
      continue
    }

    if (p && !nextKeys.has(p.key)) {
      result.push({ ...p, presence: "exiting" })
      emitted.add(p.key)
      i++
      continue
    }

    if (!n) {
      i++
      continue
    }

    const previous = prevByKey.get(n.key)
    if (!previous) {
      result.push({ ...n, presence: "entering" })
    } else {
      result.push(previous.presence === "entering" ? { ...n, presence: "entering" } : { ...n, presence: undefined })
    }
    emitted.add(n.key)
    j++
    if (p && p.key === n.key) i++
  }

  return result
}

/** Drops presence flags - the rest state, and what reduced motion renders. */
export function settleSegments(segments: Segment[]): Segment[] {
  return segments
    .filter((segment) => segment.presence !== "exiting")
    .map((segment) => (segment.presence ? { ...segment, presence: undefined } : segment))
}

/** Exiting digits hold their counter; entering ones start a cell off (opposite the roll) and roll in on commit. */
export function getPresenceCounters(
  segments: Segment[],
  prevCounters: Map<number, number>,
  nextCounters: Map<number, number>,
  step: 1 | -1,
): Map<number, number> {
  const counters = new Map(nextCounters)
  for (const segment of segments) {
    if (!isDigitSegment(segment)) continue
    const prev = prevCounters.get(segment.place)
    if (segment.presence === "exiting" && prev != null) counters.set(segment.place, prev)
    if (segment.presence === "entering" && prev == null)
      counters.set(segment.place, counters.get(segment.place)! - step)
  }
  return counters
}
