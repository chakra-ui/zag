const hasOwn = Object.prototype.hasOwnProperty

const isEqual = (a: any, b: any): boolean => {
  if (Object.is(a, b)) return true
  if (a == null || b == null) return false

  if (typeof a.isEqual === "function" && typeof b.isEqual === "function") return a.isEqual(b)

  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false
    for (let i = 0; i < a.length; i++) if (!isEqual(a[i], b[i])) return false
    return true
  }

  if (typeof a !== "object" || typeof b !== "object") return false

  const keys = Object.keys(b)
  // Compare counts first: it rejects mismatched shapes without walking values, and without it
  // an object that loses a key would compare equal to its wider previous value.
  if (Object.keys(a).length !== keys.length) return false

  for (let i = 0; i < keys.length; i++) {
    const key = keys[i]!
    if (!hasOwn.call(a, key) || !isEqual(a[key], b[key])) return false
  }
  return true
}

export { isEqual }
