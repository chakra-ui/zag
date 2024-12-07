// Modified from https://github.com/lukeed/klona
// MIT License

import { canProxy } from "./utils"

function set(obj: any, key: string | symbol, val: PropertyDescriptor) {
  if (typeof val.value === "object" && !canProxy(val.value)) val.value = clone(val.value)
  if (!val.enumerable || val.get || val.set || !val.configurable || !val.writable || key === "__proto__") {
    Object.defineProperty(obj, key, val)
  } else obj[key] = val.value
}

export function clone<T>(x: T): T {
  if (typeof x !== "object") return x
  var i = 0,
    k: string,
    list: Array<string | symbol>,
    tmp: any,
    str = Object.prototype.toString.call(x)
  if (str === "[object Object]") {
    tmp = Object.create(Object.getPrototypeOf(x) || null)
  } else if (str === "[object Array]") {
    tmp = Array((x as any).length)
  } else if (str === "[object Set]") {
    tmp = new Set()
    ;(x as Set<any>).forEach(function (val: any) {
      tmp.add(clone(val))
    })
  } else if (str === "[object Map]") {
    tmp = new Map()
    ;(x as Map<any, any>).forEach(function (val: any, key: any) {
      tmp.set(clone(key), clone(val))
    })
  } else if (str === "[object Date]") {
    tmp = new Date(+(x as Date))
  } else if (str === "[object RegExp]") {
    tmp = new RegExp((x as RegExp).source, (x as RegExp).flags)
  } else if (str === "[object DataView]") {
    // @ts-expect-error
    tmp = new (x as DataView).constructor(clone((x as DataView).buffer))
  } else if (str === "[object ArrayBuffer]") {
    tmp = (x as ArrayBuffer).slice(0)
  } else if (str === "[object Blob]") {
    tmp = (x as Blob).slice()
  } else if (str.slice(-6) === "Array]") {
    // ArrayBuffer.isView(x)
    // ~> `new` bcuz `Buffer.slice` => ref
    tmp = new (x as any).constructor(x)
  }

  if (tmp) {
    for (list = Object.getOwnPropertySymbols(x as object); i < list.length; i++) {
      set(tmp, list[i], Object.getOwnPropertyDescriptor(x as object, list[i])!)
    }

    for (i = 0, list = Object.getOwnPropertyNames(x as object); i < list.length; i++) {
      //@ts-expect-error
      if (Object.hasOwnProperty.call(tmp, (k = list[i])) && tmp[k] === (x as any)[k]) continue
      set(tmp, k, Object.getOwnPropertyDescriptor(x as object, k)!)
    }
  }

  return tmp || x
}
