import { isPlainObject } from "@zag-js/utils"

export function mergeMachineProps<T>(prev: T, next: Partial<T>): T {
  if (Object.is(prev, next)) return prev
  if (!isPlainObject(prev) || !isPlainObject(next)) {
    return next === undefined ? prev : (next as T)
  }

  let result: any = prev

  for (const key of Object.keys(next)) {
    const nextValue = (next as any)[key]
    const prevValue = (prev as any)[key]

    if (nextValue === undefined || Object.is(prevValue, nextValue)) {
      continue
    }

    const value =
      isPlainObject(prevValue) && isPlainObject(nextValue) ? mergeMachineProps(prevValue, nextValue) : nextValue
    if (Object.is(prevValue, value)) continue
    if (result === prev) result = { ...prev }
    result[key] = value
  }

  return result
}
