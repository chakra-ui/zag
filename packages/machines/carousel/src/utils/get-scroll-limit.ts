import { getLimit } from "./get-limit"

const arrayLast = <T>(array: T[]): T => array[array.length - 1]

export function getScrollLimit(contentSize: number, scrollSnaps: number[], loop: boolean) {
  const startSnap = scrollSnaps[0]
  const endSnap = arrayLast(scrollSnaps)
  const min = loop ? startSnap - contentSize : endSnap
  const max = startSnap
  return getLimit(min, max)
}
