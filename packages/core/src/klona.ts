// Modified from https://github.com/lukeed/klona

function set(obj: any, key: any, val: any, opt: any) {
  if (typeof val.value === "object") val.value = klona(val.value, opt)
  if (!val.enumerable || val.get || val.set || !val.configurable || !val.writable || key === "__proto__") {
    Object.defineProperty(obj, key, val)
  } else obj[key] = val.value
}

export function klona(x: any, seen = new Map()): any {
  if (typeof x !== "object") return x

  let i = 0,
    k: any,
    list: any,
    tmp: any,
    str = Object.prototype.toString.call(x)

  if (seen.has(x)) return seen.get(x)

  if (str === "[object Object]") {
    tmp = Object.create(Object.getPrototypeOf(x) || null)
  } else if (str === "[object Array]") {
    tmp = Array(x.length)
  } else if (str === "[object Set]") {
    tmp = new Set()
    x.forEach((val: any) => {
      tmp.add(klona(val, seen))
    })
  } else if (str === "[object Map]") {
    tmp = new Map()
    x.forEach((val: any, key: any) => {
      tmp.set(klona(key, seen), klona(val, seen))
    })
  } else if (str === "[object Date]") {
    tmp = new Date(+x)
  } else if (str === "[object RegExp]") {
    tmp = new RegExp(x.source, x.flags)
  } else if (str === "[object DataView]") {
    tmp = new x.constructor(klona(x.buffer, seen))
  } else if (str === "[object ArrayBuffer]") {
    tmp = x.slice(0)
  } else if (str === "[object Blob]") {
    tmp = new Blob([x], { type: x.type })
  } else if (str === "[object File]") {
    tmp = new File([x], x.name, { type: x.type, lastModified: x.lastModified })
  } else if (str.slice(-6) === "Array]") {
    tmp = x.constructor.from(x)
  }

  seen.set(x, tmp)

  if (tmp) {
    for (list = Object.getOwnPropertySymbols(x); i < list.length; i++) {
      set(tmp, list[i], Object.getOwnPropertyDescriptor(x, list[i]), seen)
    }

    for (i = 0, list = Object.getOwnPropertyNames(x); i < list.length; i++) {
      if (Object.hasOwnProperty.call(tmp, (k = list[i])) && tmp[k] === x[k]) continue
      set(tmp, k, Object.getOwnPropertyDescriptor(x, k), seen)
    }
  }

  return tmp || x
}
