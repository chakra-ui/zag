export function warn(m: string): void
export function warn(c: boolean, m: string): void
export function warn(...a: any[]): void {
  const m = a.length === 1 ? a[0] : a[1]
  const c = a.length === 2 ? a[0] : true
  if (c && process.env.NODE_ENV !== "production") {
    console.warn(m)
  }
}

export function invariant(m: string): void
export function invariant(c: boolean, m: string): void
export function invariant(...a: any[]): void {
  const m = a.length === 1 ? a[0] : a[1]
  const c = a.length === 2 ? a[0] : true
  if (c && process.env.NODE_ENV !== "production") {
    throw new Error(m)
  }
}

export function ensure<T>(c: T | null | undefined, m: () => string): asserts c is T {
  if (c == null) throw new Error(m())
}

type RequiredBy<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>

export function ensureProps<T, K extends keyof T>(
  props: T,
  keys: K[],
  scope?: string,
): asserts props is T & RequiredBy<T, K> {
  let missingKeys = []
  for (const key of keys) {
    if (props[key] == null) missingKeys.push(key)
  }
  if (missingKeys.length > 0)
    throw new Error(`[zag-js${scope ? ` > ${scope}` : ""}] missing required props: ${missingKeys.join(", ")}`)
}
