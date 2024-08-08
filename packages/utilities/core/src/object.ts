import { createSplitProps } from "./split-props"

export function compact<T extends Record<string, unknown> | undefined>(obj: T): T {
  if (!isPlainObject(obj) || obj === undefined) {
    return obj
  }

  const keys = Reflect.ownKeys(obj).filter((key) => typeof key === "string")
  const filtered: Partial<T> = {}
  for (const key of keys) {
    const value = (obj as any)[key]
    if (value !== undefined) {
      filtered[key as keyof T] = compact(value)
    }
  }
  return filtered as T
}

export function json(value: any) {
  return JSON.parse(JSON.stringify(value))
}

const isPlainObject = (value: any) => {
  return value && typeof value === "object" && value.constructor === Object
}

export function pick<T extends Record<string, any>, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
  const filtered: Partial<T> = {}

  for (const key of keys) {
    const value = obj[key]
    if (value !== undefined) {
      filtered[key] = value
    }
  }

  return filtered as any
}

export function omit<T extends Record<string, any>>(obj: T, keys: string[]) {
  return createSplitProps(keys)(obj)[1]
}
