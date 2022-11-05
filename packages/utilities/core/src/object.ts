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
