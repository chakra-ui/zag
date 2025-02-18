import { compact, isPlainObject } from "@zag-js/utils"

export function deepMerge<T extends Record<string, any>>(source: any, ...objects: any[]): T {
  for (const obj of objects) {
    if (Object.prototype.hasOwnProperty.call(objects, obj)) {
      if (obj === '__proto__' || obj === 'constructor' || obj === 'prototype') {
        continue;
      }

      const target = compact(obj)
      for (const key in target) {
        if (isPlainObject(obj[key])) {
          if (!source[key]) {
            source[key] = {} as any
          }
          deepMerge(source[key], obj[key])
        } else {
          source[key] = obj[key]
        }
      }
    }
  }
  return source
}
