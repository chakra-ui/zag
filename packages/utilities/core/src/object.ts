import { isObject } from "./guard"

export function compact<T>(value: T) {
  for (const key in value) {
    if (value[key] === undefined) {
      delete value[key]
    } else if (isObject(value[key])) {
      compact(value[key])
    }
  }
  return value
}

export function split<T, K extends keyof T>(value: T, keys: K[]): [Pick<T, K>, Omit<T, K>] {
  const left = {} as any
  const right = {} as any
  for (const key in value) {
    if (keys.includes(key as any)) {
      left[key] = value[key]
    } else {
      right[key] = value[key]
    }
  }
  return [left, right]
}
