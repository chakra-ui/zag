import type { Bindable, BindableParams } from "@zag-js/core"
import { isFunction } from "@zag-js/utils"
import { createSignal, onCleanup, untrack, type Accessor } from "solid-js"
import { flushSync } from "./flush"

export function createBindable<T>(props: Accessor<BindableParams<T>>): Bindable<T> {
  const initial = props().value ?? props().defaultValue

  const eq = props().isEqual ?? Object.is

  const [value, setValue] = createSignal<any>(initial)
  const controlled = () => props().value !== undefined

  // Latest uncontrolled value, including writes Solid has not committed yet
  let current = initial as T

  function get(): T {
    return (controlled() ? props().value : value()) as T
  }

  const set = (v: T | ((prev: T) => T)) => {
    flushSync(() => {
      const isControlled = untrack(controlled)
      const prev = isControlled ? (untrack(() => props().value) as T) : current
      const next = isFunction(v) ? v(prev) : v

      if (props().debug) {
        console.log(`[bindable > ${props().debug}] setValue`, { next, prev })
      }

      if (!isControlled) {
        current = next
        setValue(() => next)
      }
      if (!eq(next, prev)) {
        props().onChange?.(next, prev)
      }
    })
  }

  return {
    initial,
    ref: {
      get current() {
        return untrack(get)
      },
    },
    get,
    set,
    invoke(nextValue: T, prevValue: T) {
      props().onChange?.(nextValue, prevValue)
    },
    hash(value: T) {
      return props().hash?.(value) ?? String(value)
    },
  }
}

createBindable.cleanup = (fn: VoidFunction) => {
  onCleanup(() => fn())
}

createBindable.ref = <T>(defaultValue: T) => {
  let value = defaultValue
  return {
    get: () => value,
    set: (next: T) => {
      value = next
    },
  }
}
