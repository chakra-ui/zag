import type { Bindable, BindableParams } from "@zag-js/core"
import { identity, isFunction } from "@zag-js/utils"
import { flushSync, onDestroy, untrack } from "svelte"

export function bindable<T>(props: () => BindableParams<T>): Bindable<T> {
  const initial = props().defaultValue ?? props().value
  const eq = props().isEqual ?? Object.is

  let value = $state(initial)
  const controlled = $derived(props().value !== undefined)

  let valueRef = { current: untrack(() => value) }
  let prevValue = { current: undefined as T | undefined }

  $effect.pre(() => {
    const v = controlled ? props().value : value
    valueRef = { current: v }
    prevValue = { current: v as T }
  })

  const setValueFn = (v: T | ((prev: T) => T)) => {
    const next = isFunction(v) ? v(valueRef.current as T) : v
    const prev = prevValue.current as T | undefined
    if (props().debug) {
      console.log(`[bindable > ${props().debug}] setValue`, { next, prev })
    }

    if (!controlled) value = next
    if (!eq(next, prev)) {
      props().onChange?.(next, prev)
    }
  }

  function get(): T {
    return (controlled ? props().value : value) as T
  }

  return {
    initial,
    ref: valueRef,
    get,
    set(val: T | ((prev: T) => T)) {
      const exec = props().sync ? flushSync : identity
      exec(() => setValueFn(val))
    },
    invoke(nextValue: T, prevValue: T) {
      props().onChange?.(nextValue, prevValue)
    },
    hash(value: T) {
      return props().hash?.(value) ?? String(value)
    },
  }
}

bindable.cleanup = (fn: VoidFunction) => {
  onDestroy(() => fn())
}

bindable.ref = <T>(defaultValue: T) => {
  let value = defaultValue
  return {
    get: () => value,
    set: (next: T) => {
      value = next
    },
  }
}
