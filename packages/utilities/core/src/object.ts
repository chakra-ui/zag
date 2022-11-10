import { isObject } from "./guard"

export function compact<T extends Record<string, unknown> | undefined>(obj: T): T {
  if (obj === undefined) return obj
  return Object.fromEntries(
    Object.entries(obj)
      // remove undefined values
      .filter(([, value]) => value !== undefined)
      // recursively compact nested objects
      .map(([key, value]) => [key, isObject(value) ? compact(value) : value]),
  ) as T
}

export function json(value: any) {
  return JSON.parse(JSON.stringify(value))
}
