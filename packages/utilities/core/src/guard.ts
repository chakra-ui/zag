export const isDev = () => process.env.NODE_ENV !== "production"
export const isArray = (v: any): v is any[] => Array.isArray(v)
export const isBoolean = (v: any): v is boolean => v === true || v === false
export const isObject = (v: any): v is Record<string, any> => !(v == null || typeof v !== "object" || isArray(v))
export const isNumber = (v: any): v is number => typeof v === "number" && !Number.isNaN(v)
export const isString = (v: any): v is string => typeof v === "string"
export const isFunction = (v: any): v is Function => typeof v === "function"
export const isNull = (v: any): v is null | undefined => v == null

export const hasProp = <T extends string>(obj: any, prop: T): obj is Record<T, any> =>
  Object.prototype.hasOwnProperty.call(obj, prop)
