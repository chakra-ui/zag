import { mergeProps as _mergeProps } from "@zag-js/core"
import { createMemo, type Accessor } from "solid-js"

export type MaybeAccessor<T> = T | (() => T)

type Access<T extends MaybeAccessor<any>> = T extends () => any ? ReturnType<T> : T

const access = <T extends MaybeAccessor<any>>(v: T): Access<T> => (typeof v === "function" && !v.length ? v() : v)

export function mergeProps<T>(source: MaybeAccessor<T>): Accessor<T>
export function mergeProps<T, U>(source: MaybeAccessor<T>, source1: MaybeAccessor<U>): Accessor<T & U>
export function mergeProps<T, U, V>(
  source: MaybeAccessor<T>,
  source1: MaybeAccessor<U>,
  source2: MaybeAccessor<V>,
): Accessor<T & U & V>
export function mergeProps<T, U, V, W>(
  source: MaybeAccessor<T>,
  source1: MaybeAccessor<U>,
  source2: MaybeAccessor<V>,
  source3: MaybeAccessor<W>,
): Accessor<T & U & V & W>
export function mergeProps(...sources: any[]) {
  return createMemo(() => _mergeProps(...sources.map((s) => access(s))))
}
