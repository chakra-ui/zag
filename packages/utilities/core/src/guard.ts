type AnyFunction = (...args: any[]) => any

export const isDev = () => process.env.NODE_ENV !== "production"
export const isArray = (v: any): v is any[] => Array.isArray(v)
export const isBoolean = (v: any): v is boolean => v === true || v === false
export const isObjectLike = (v: any): v is Record<string, any> => v != null && typeof v === "object"
export const isObject = (v: any): v is Record<string, any> => isObjectLike(v) && !isArray(v)
export const isNumber = (v: any): v is number => typeof v === "number" && !Number.isNaN(v)
export const isString = (v: any): v is string => typeof v === "string"
export const isFunction = (v: any): v is AnyFunction => typeof v === "function"
export const isNull = (v: any): v is null | undefined => v == null
export const isPromiseLike = <T = unknown>(v: any): v is PromiseLike<T> => v != null && isFunction(v.then)

export const hasProp = <T extends string>(obj: any, prop: T): obj is Record<T, any> =>
  Object.prototype.hasOwnProperty.call(obj, prop)

const baseGetTag = (v: any) => Object.prototype.toString.call(v)
const fnToString = Function.prototype.toString
const objectCtorString = fnToString.call(Object)

export const isPlainObject = (v: any) => {
  if (!isObjectLike(v) || baseGetTag(v) != "[object Object]" || isFrameworkElement(v)) return false
  const proto = Object.getPrototypeOf(v)
  if (proto === null) return true
  const Ctor = hasProp(proto, "constructor") && proto.constructor
  return typeof Ctor == "function" && Ctor instanceof Ctor && fnToString.call(Ctor) == objectCtorString
}

const isReactElement = (x: any) => typeof x === "object" && x !== null && "$$typeof" in x && "props" in x
const isVueElement = (x: any) => typeof x === "object" && x !== null && "__v_isVNode" in x
const isFrameworkElement = (x: any) => isReactElement(x) || isVueElement(x)

export function warn(m: string): void
export function warn(c: boolean, m: string): void
export function warn(...a: any[]): void {
  const m = a.length === 1 ? a[0] : a[1]
  const c = a.length === 2 ? a[0] : true
  if (c && process.env.NODE_ENV !== "production") {
    console.warn(m)
  }
}

export function invariant(m: string): void
export function invariant(c: boolean, m: string): void
export function invariant(...a: any[]): void {
  const m = a.length === 1 ? a[0] : a[1]
  const c = a.length === 2 ? a[0] : true
  if (c && process.env.NODE_ENV !== "production") {
    throw new Error(m)
  }
}

export function ensure<T>(c: T | null | undefined, m: () => string): asserts c is T {
  if (c == null) throw new Error(m())
}

type RequiredBy<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>

export function ensureProps<T, K extends keyof T>(
  props: T,
  keys: K[],
  scope?: string,
): asserts props is T & RequiredBy<T, K> {
  let missingKeys = []
  for (const key of keys) {
    if (props[key] == null) missingKeys.push(key)
  }
  if (missingKeys.length > 0)
    throw new Error(`[zag-js${scope ? ` > ${scope}` : ""}] missing required props: ${missingKeys.join(", ")}`)
}
