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

export const hasProp = <T extends string>(obj: any, prop: T): obj is Record<T, any> =>
  Object.prototype.hasOwnProperty.call(obj, prop)

const baseGetTag = (v: any) => Object.prototype.toString.call(v)
const fnToString = Function.prototype.toString
const objectCtorString = fnToString.call(Object)

export const isPlainObject = (v: any) => {
  if (!isObjectLike(v) || baseGetTag(v) != "[object Object]") return false
  const proto = Object.getPrototypeOf(v)
  if (proto === null) return true
  const Ctor = hasProp(proto, "constructor") && proto.constructor
  return typeof Ctor == "function" && Ctor instanceof Ctor && fnToString.call(Ctor) == objectCtorString
}
