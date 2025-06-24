function glob(): any {
  if (typeof globalThis !== "undefined") return globalThis
  if (typeof self !== "undefined") return self
  if (typeof window !== "undefined") return window
  if (typeof global !== "undefined") return global
}

export function globalRef<T>(key: string, value: () => T): T {
  const g = glob()
  if (!g) return value()
  g[key] ||= value()
  return g[key]
}

export const refSet = globalRef("__zag__refSet", () => new WeakSet())
