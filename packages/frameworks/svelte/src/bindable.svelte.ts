import { type Bindable, type BindableParams } from "@zag-js/core"
import { identity, isEqual, isFunction } from "@zag-js/utils"
import { flushSync } from "svelte"

export function bindable<T>(props: () => BindableParams<T>): Bindable<T> {
  const initial = props().defaultValue ?? props().value
  const eq = props().isEqual ?? isEqual

  let value = $state(initial)
  const controlled = $derived(props().value !== undefined)

  let valueRef = { current: value }
  let prevValue = { current: undefined as T | undefined }

  $effect.pre(() => {
    const v = controlled ? props().value : value
    valueRef = { current: v }
    prevValue = { current: v as T }
  })

  const setValueFn = (v: T | ((prev: T) => T)) => {
    const nextValue = isFunction(v) ? v(valueRef.current as T) : v
    const prev = prevValue.current as T | undefined
    if (!controlled) value = nextValue
    if (!eq(nextValue, prev)) {
      props().onChange?.(nextValue, prev)
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
