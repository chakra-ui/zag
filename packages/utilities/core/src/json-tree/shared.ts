// a getter that throws shows its error instead of breaking the whole tree
export function getProp(value: object, key: string): unknown {
  try {
    return value[key as keyof typeof value]
  } catch (error) {
    return error
  }
}

export function defu<T>(a: T, b: Partial<T>): T {
  const res = { ...a }
  for (const key in b) {
    if (b[key as keyof T] !== undefined) res[key as keyof T] = b[key as keyof T] as never
  }
  return res
}

export const isObj = (v: unknown): v is Record<string, unknown> =>
  v != null && typeof v === "object" && !Array.isArray(v)

export const typeOf = (value: any): string => Object.prototype.toString.call(value)

export function getNonEnumerableKeys(value: object, enumerableKeys: string[]): string[] {
  const enumerableSet = new Set(enumerableKeys)
  return Object.getOwnPropertyNames(value).filter((key) => !enumerableSet.has(key))
}

export function take<T>(iterable: Iterable<T>, count: number): T[] {
  const result: T[] = []
  if (count <= 0) return result
  for (const value of iterable) {
    result.push(value)
    if (result.length >= count) break
  }
  return result
}
