import { isFunction, isObject } from "@zag-js/utils/guard"

const isShallowEqual = (a: unknown, b: unknown): boolean => {
  if (Object.is(a, b)) return true
  if (!isObject(a) || !isObject(b)) return false
  const keys = Object.keys(a)
  return keys.length === Object.keys(b).length && keys.every((key) => Object.is(a[key], b[key]))
}

/**
 * Whether an option is unchanged. Arrays and objects rebuilt on every render compare by content,
 * and a new callback counts as the same option: the latest one is stored and read when needed.
 */
export function isSameOption(a: unknown, b: unknown): boolean {
  if (Object.is(a, b)) return true
  if (isFunction(a) && isFunction(b)) return true
  if (Array.isArray(a) && Array.isArray(b)) {
    return a.length === b.length && a.every((value, index) => isShallowEqual(value, b[index]))
  }
  return isShallowEqual(a, b)
}
