export function toArray<T>(v: T | T[] | undefined | null): T[] {
  if (!v) return []
  return Array.isArray(v) ? v : [v]
}

export const fromLength = (length: number) => Array.from(Array(length).keys())

export const first = <T>(v: T[]): T | undefined => v[0]

export const last = <T>(v: T[]): T | undefined => v[v.length - 1]

export const isEmpty = <T>(v: T[]): boolean => v.length === 0

export const has = <T>(v: T[], t: any): boolean => v.indexOf(t) !== -1

export const add = <T>(v: T[], ...items: T[]): T[] => v.concat(items)

export const remove = <T>(v: T[], item: T): T[] => removeAt(v, v.indexOf(item))

export const removeAt = <T>(v: T[], i: number): T[] => {
  if (i > -1) v.splice(i, 1)
  return v
}

export function clear<T>(v: T[]): T[] {
  while (v.length > 0) v.pop()
  return v
}
