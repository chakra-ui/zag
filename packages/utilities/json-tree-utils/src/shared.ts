const regexReturnCharacters = /\r/g

export function hash(str: string) {
  const v = str.replace(regexReturnCharacters, "")
  let hash = 5381
  let i = v.length
  while (i--) hash = ((hash << 5) - hash) ^ v.charCodeAt(i)
  return (hash >>> 0).toString(36)
}

export function hasProp(value: any, key: string): boolean {
  return Object.prototype.hasOwnProperty.call(value, key)
}

export function getProp(value: object, key: string): unknown {
  return value[key as keyof typeof value]
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
