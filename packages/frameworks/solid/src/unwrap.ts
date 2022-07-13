export function unwrap<T extends Record<string, any>>(state: T, acc = {}): T {
  for (const key of Reflect.ownKeys(state)) {
    const value = Reflect.get(state, key)
    if (key === "tags" || key === "nextEvents") {
      acc[key] = Array.from(value)
    } else if (typeof value === "object") {
      acc[key] = unwrap(value) as any
    } else {
      acc[key] = value
    }
  }
  return acc as T
}
