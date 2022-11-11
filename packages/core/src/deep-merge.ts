import { compact, isObject } from "@zag-js/utils"

export function deepMerge<T extends Record<string, any>>(source: T, ...objects: T[]): T {
  for (const obj of objects) {
    const target = compact(obj)
    for (const key in target) {
      if (isObject(obj[key])) {
        if (!source[key]) {
          source[key] = {} as any
        }
        deepMerge(source[key], obj[key])
      } else {
        source[key] = obj[key]
      }
    }
  }
  return source
}
