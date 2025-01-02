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

const isPlainObject = (v: any) => {
  return v && typeof v === "object" && v.constructor === Object
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

type Dict = Record<string, any>

export function splitProps<T extends Dict>(props: T, keys: (keyof T)[]) {
  const rest: Dict = {}
  const result: Dict = {}

  const keySet = new Set(keys)

  for (const key in props) {
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
