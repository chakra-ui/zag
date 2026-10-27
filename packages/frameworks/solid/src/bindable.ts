import type { Bindable, BindableParams } from "@zag-js/core"
import { isFunction } from "@zag-js/utils"
import { createEffect, createMemo, createSignal, type Accessor, onCleanup, untrack } from "solid-js"

export function createBindable<T>(props: Accessor<BindableParams<T>>): Bindable<T> {
  const initial = props().value ?? props().defaultValue

  const eq = props().isEqual ?? Object.is

  // Solid 2 applies writes when the batch flushes, so a signal read right after `set` still answers the
  // old value. Machines read their context right after writing it, so the value lives here and the
  // signal only tells readers it changed.
  let value = initial as T
  const [version, setVersion] = createSignal(0)
  const controlled = createMemo(() => props().value !== undefined)

  const valueRef = { current: value }

  createEffect(
    () => (controlled() ? props().value : (version(), value)),
    (v) => {
      valueRef.current = v as T
    },
  )

  const set = (v: T | ((prev: T) => T)) => {
    const prev = untrack(() => (controlled() ? props().value : value)) as T
    const next = isFunction(v) ? v(prev) : v

    if (props().debug) {
      console.log(`[bindable > ${props().debug}] setValue`, { next, prev })
    }

    if (!controlled()) {
      value = next as T
      valueRef.current = value
      setVersion((n) => n + 1)
    }
    if (!eq(next, prev)) {
      props().onChange?.(next, prev)
    }
  }

  function get(): T {
    if (!controlled()) {
      version()
      return value
    }
    const v = props().value as T
    return isFunction(v) ? v() : v
  }

  return {
    initial,
    ref: valueRef,
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
