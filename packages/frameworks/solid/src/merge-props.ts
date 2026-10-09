import { mergeProps as zagMergeProps } from "@zag-js/core"
import { $PROXY } from "solid-js"

export type MaybeAccessor<T> = T | (() => T)

const resolve = (source: any) => (typeof source === "function" ? source() : source) || {}

const isComposed = (key: string) =>
  key === "style" || key === "class" || key === "className" || key === "data-ownedby" || key.startsWith("on")

const keyTraps = {
  get(_: any, key: PropertyKey, receiver: any) {
    if (key === $PROXY) return receiver
    return _.get(key)
  },
  has(_: any, key: PropertyKey) {
    if (key === $PROXY) return true
    return _.keys().includes(key)
  },
  ownKeys(_: any) {
    return _.keys()
  },
  getOwnPropertyDescriptor(_: any, key: PropertyKey) {
    if (!_.keys().includes(key)) return undefined
    return { configurable: true, enumerable: true, get: () => _.get(key) }
  },
  set: () => true,
  deleteProperty: () => true,
}

export function mergeProps<T>(source: MaybeAccessor<T>): T
export function mergeProps<T, U>(source: MaybeAccessor<T>, source1: MaybeAccessor<U>): T & U
export function mergeProps<T, U, V>(
  source: MaybeAccessor<T>,
  source1: MaybeAccessor<U>,
  source2: MaybeAccessor<V>,
): T & U & V
export function mergeProps<T, U, V, W>(
  source: MaybeAccessor<T>,
  source1: MaybeAccessor<U>,
  source2: MaybeAccessor<V>,
  source3: MaybeAccessor<W>,
): T & U & V & W
// Sources are read on every access, so keys a source adds or drops after the first render reach the element.
// The `$PROXY` marker tells Solid's own `mergeProps`/`splitProps` to stay dynamic too.
export function mergeProps(...sources: any[]) {
  return new Proxy(
    {
      get(key: PropertyKey) {
        if (typeof key !== "string") return undefined
        if (isComposed(key)) {
          let merged: any = {}
          for (const source of sources) merged = zagMergeProps(merged, { [key]: resolve(source)[key] })
          return merged[key]
        }
        for (let i = sources.length - 1; i >= 0; i--) {
          const value = resolve(sources[i])[key]
          if (value !== undefined) return value
        }
      },
      keys() {
        const keys = new Set<string>()
        for (const source of sources) for (const key in resolve(source)) keys.add(key)
        return [...keys]
      },
    },
    keyTraps,
  )
}
