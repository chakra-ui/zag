const isArrayLike = (value: any) => value?.constructor.name === "Array"

export const isEqual = (a: any, b: any): boolean => {
  if (Object.is(a, b)) return true

  if (typeof a?.isEqual === "function" && typeof b?.isEqual === "function") {
    return a.isEqual(b)
  }

  if (typeof a === "function" && typeof b === "function") {
    return a.toString() === b.toString()
  }

  if (isArrayLike(a) && isArrayLike(b)) {
    return Array.from(a).toString() === Array.from(b).toString()
  }

  if (!(typeof a === "object") || !(typeof b === "object")) return false

  const keys = Object.keys(b)
  const length = keys.length

  for (let i = 0; i < length; i++) {
    if (!(keys[i] in a)) return false
  }

  for (let i = 0; i < length; i++) {
    const key = keys[i]
    if (!isEqual(a[key], b[key])) return false
  }

  return true
}
