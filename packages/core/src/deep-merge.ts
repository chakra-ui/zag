import { compact, isPlainObject } from "@zag-js/utils"

export function deepMerge<T extends Record<string, any>>(source: T, ...objects: T[]): T {
  if (!isPlainObject(source)) {
    throw new TypeError("Source argument must be a plain object")
  }

  for (const obj of objects) {
    if (!isPlainObject(obj)) continue

    const target = compact(obj)
    for (const key in target) {
      // Skip prototype chain properties
      if (!Object.prototype.hasOwnProperty.call(target, key)) continue

      // Skip dangerous prototype pollution keys
      if (key === "__proto__" || key === "constructor" || key === "prototype") continue

      const sourceVal = source[key]
      const targetVal = obj[key]

      if (isPlainObject(targetVal)) {
        source[key] = isPlainObject(sourceVal) ? deepMerge(sourceVal, targetVal) : { ...targetVal }
      } else {
        source[key] = targetVal
      }
    }
  }
  return source
}
