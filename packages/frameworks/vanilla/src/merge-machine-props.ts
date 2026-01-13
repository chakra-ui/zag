import { isPlainObject } from "@zag-js/utils"

export function mergeMachineProps<T>(prev: T, next: Partial<T>): T {
  if (!isPlainObject(prev) || !isPlainObject(next)) {
    return next === undefined ? prev : (next as T)
  }

  const result: any = { ...prev }

  for (const key of Object.keys(next)) {
    const nextValue = (next as any)[key]
    const prevValue = (prev as any)[key]

    // ignore undefined updates
    if (nextValue === undefined) {
      continue
    }

    if (isPlainObject(prevValue) && isPlainObject(nextValue)) {
      result[key] = mergeMachineProps(prevValue, nextValue)
    } else {
      result[key] = nextValue
    }
  }

  return result
}
