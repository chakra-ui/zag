/**
 * Credits to @solid-primitives/props for the original implementation
 * https://github.com/solidjs-community/solid-primitives/blob/acc8b7aff2fc95307461aac94642f7fd296390e4/packages/utils/LICENSE
 */

import { mergeProps as solidMergeProps, type JSX, type MergeProps } from "solid-js"
import { propTraps } from "./prop-trap"

type MaybeAccessor<T> = T | (() => T)

type MaybeAccessorValue<T extends MaybeAccessor<any>> = T extends () => any ? ReturnType<T> : T

const access = <T extends MaybeAccessor<any>>(v: T): MaybeAccessorValue<T> =>
  typeof v === "function" && !v.length ? v() : v

function chain<Args extends [] | any[]>(fns: {
  [Symbol.iterator](): IterableIterator<((...args: Args) => any) | undefined>
}): (...args: Args) => void {
  return (...args: Args) => {
    for (const fn of fns) {
      fn && fn(...args)
    }
  }
}

const cssRegex = /((?:--)?(?:\w+-?)+)\s*:\s*([^;]*)/g

function stringStyleToObject(style: string): JSX.CSSProperties {
  const object: Record<string, string> = {}
  let match: RegExpExecArray | null
  while ((match = cssRegex.exec(style))) {
    object[match[1]!] = match[2]!
  }
  return object
}

function mergeStyle(a: string, b: string): string
function mergeStyle(a: JSX.CSSProperties, b: JSX.CSSProperties): JSX.CSSProperties
function mergeStyle(a: JSX.CSSProperties | string, b: JSX.CSSProperties | string): JSX.CSSProperties
function mergeStyle(a: JSX.CSSProperties | string, b: JSX.CSSProperties | string): JSX.CSSProperties | string {
  if (typeof a === "object" && typeof b === "object") return { ...a, ...b }
  if (typeof a === "string" && typeof b === "string") return `${a};${b}`

  const objA = typeof a === "object" ? a : stringStyleToObject(a)
  const objB = typeof b === "object" ? b : stringStyleToObject(b)

  return { ...objA, ...objB }
}

type PropsInput = {
  class?: string
  className?: string
  classList?: Record<string, boolean | undefined>
  style?: JSX.CSSProperties | string
  ref?: Element | ((el: any) => void)
} & Record<string, any>

const reduce = <K extends keyof PropsInput>(
  sources: MaybeAccessor<PropsInput>[],
  key: K,
  calc: (a: NonNullable<PropsInput[K]>, b: NonNullable<PropsInput[K]>) => PropsInput[K],
) => {
  let v: PropsInput[K] = undefined
  for (const props of sources) {
    const propV = access(props)[key]
    if (!v) v = propV
    else if (propV) v = calc(v, propV)
  }
  return v
}

type AnyVoidFn = (...args: any[]) => void

export function mergeProps<T extends MaybeAccessor<PropsInput>[]>(...sources: T): MergeProps<T> {
  if (sources.length === 1) {
    return sources[0] as MergeProps<T>
  }

  // create a map of event listeners to be chained
  const listeners: Record<string, AnyVoidFn[]> = {}

  for (const props of sources) {
    const properties = access(props)
    for (const key in properties) {
      // skip non event listeners
      if (key[0] === "o" && key[1] === "n" && key[2]) {
        const value = properties[key]
        const name = key.toLowerCase()

        const callback: AnyVoidFn | undefined =
          typeof value === "function"
            ? value
            : // jsx event handlers can be tuples of [callback, arg]
            Array.isArray(value)
            ? value.length === 1
              ? value[0]
              : value[0].bind(void 0, value[1])
            : void 0

        if (callback) listeners[name] ? listeners[name]!.push(callback) : (listeners[name] = [callback])
        else delete listeners[name]
      }
    }
  }

  const merge = solidMergeProps(...sources) as unknown as MergeProps<T>

  return new Proxy(
    {
      get(key) {
        if (typeof key !== "string") {
          return Reflect.get(merge, key)
        }

        // Combine style prop
        if (key === "style") {
          return reduce(sources, "style", mergeStyle)
        }

        // chain props.ref assignments
        if (key === "ref") {
          const fns: ((el: any) => void)[] = []
          for (const props of sources) {
            const fn = access(props)[key]
            if (typeof fn === "function") {
              fns.push(fn)
            }
          }
          return chain(fns)
        }

        // Chain event listeners
        if (key[0] === "o" && key[1] === "n" && key[2]) {
          const fns = listeners[key.toLowerCase()]
          return fns ? chain(fns) : Reflect.get(merge, key)
        }

        // Merge classes or classNames
        if (key === "class" || key === "className") {
          return reduce(sources, key, (a, b) => `${a} ${b}`)
        }

        // Merge classList objects, keys in the last object overrides all previous ones.
        if (key === "classList") {
          return reduce(sources, key, (a, b) => ({ ...a, ...b }))
        }

        return Reflect.get(merge, key)
      },
      has(key) {
        return Reflect.has(merge, key)
      },
      keys() {
        return Object.keys(merge)
      },
    },
    propTraps,
  ) as any
}
