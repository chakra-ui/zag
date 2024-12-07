import { refSet } from "./global"

const isReactElement = (x: any) => typeof x === "object" && x !== null && "$$typeof" in x && "props" in x

const isVueElement = (x: any) => typeof x === "object" && x !== null && "__v_isVNode" in x

const isDOMElement = (x: any) =>
  typeof x === "object" && x !== null && "nodeType" in x && typeof x.nodeName === "string"

const isElement = (x: any) => isReactElement(x) || isVueElement(x) || isDOMElement(x)

export const isObject = (x: unknown): x is object => x !== null && typeof x === "object"

export const canProxy = (x: unknown) =>
  isObject(x) &&
  !refSet.has(x) &&
  (Array.isArray(x) || !(Symbol.iterator in x)) &&
  !isElement(x) &&
  !(x instanceof WeakMap) &&
  !(x instanceof WeakSet) &&
  !(x instanceof Error) &&
  !(x instanceof Number) &&
  !(x instanceof Date) &&
  !(x instanceof String) &&
  !(x instanceof RegExp) &&
  !(x instanceof ArrayBuffer) &&
  !(x instanceof Promise)

export const isDev = () => process.env.NODE_ENV !== "production"
