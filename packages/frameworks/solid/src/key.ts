import type { JSX } from "@solidjs/web"
import { type Accessor, For } from "solid-js"

export interface KeyProps<T> {
  each: readonly T[] | undefined | null | false
  by: keyof T | ((item: T) => any)
  fallback?: JSX.Element
  children: (item: Accessor<T>, index: Accessor<number>) => JSX.Element
}

/** Renders a list keyed by `by`, so a row survives being replaced by a new object with the same key. */
export function Key<T>(props: KeyProps<T>): JSX.Element {
  const by = props.by
  const key = typeof by === "function" ? by : (item: T) => item[by]
  return For({
    get each() {
      return props.each
    },
    keyed: key,
    get fallback() {
      return props.fallback
    },
    get children() {
      return props.children
    },
  } as any)
}
