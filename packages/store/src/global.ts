function getGlobal(): any {
  if (typeof globalThis !== "undefined") return globalThis
  if (typeof self !== "undefined") return self
  if (typeof window !== "undefined") return window
  if (typeof global !== "undefined") return global
}

export function makeGlobal<T>(key: string, value: () => T): T {
  const g = getGlobal()
  if (!g) return value()
  g[key] ||= value()
  return g[key]
}
