import { isPlainObject } from "./guard"

export function compact<T extends Record<string, unknown> | undefined>(obj: T): T {
  if (!isPlainObject(obj) || obj === undefined) return obj
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

export const json = (v: any) => JSON.parse(JSON.stringify(v))

export const keys = <T extends Record<string, any>>(obj: T) => Object.keys(obj) as (keyof T)[]

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

type Dict = Record<string | symbol, any>

export function splitProps<T extends Dict>(props: T, keys: (keyof T)[]) {
  const rest: Dict = {}
  const result: Dict = {}

  const keySet = new Set(keys)
  const ownKeys = Reflect.ownKeys(props)

  for (const key of ownKeys) {
    if (keySet.has(key)) {
      result[key] = props[key]
    } else {
      rest[key] = props[key]
    }
  }

  return [result, rest]
}

export const createSplitProps = <T extends Dict>(keys: (keyof T)[]) => {
  return function split<Props extends T>(props: Props) {
    return splitProps(props, keys) as [T, Omit<Props, keyof T>]
  }
}

export function omit<T extends Record<string, any>>(obj: T, keys: string[]) {
  return createSplitProps(keys)(obj)[1]
}

type Defined<T> = {
  [K in keyof T]-?: Exclude<T[K], undefined>
}

export type MergeWithDefault<D, O = unknown> = Defined<D> &
  ([NonNullable<O>] extends [never] ? unknown : Omit<NonNullable<O>, keyof D>)

export function mergeWithDefault<D extends object, O extends { [K in keyof D]?: D[K] | undefined } | undefined>(
  defaults: D,
  overrides?: O,
): MergeWithDefault<D, O> {
  if (!overrides) return defaults as MergeWithDefault<D, O>

  const result = { ...defaults } as Record<string, unknown>
  const source = overrides as Record<string, unknown>

  for (const key in source) {
    const value = source[key]
    if (value !== undefined) result[key] = value
  }

  return result as MergeWithDefault<D, O>
}
