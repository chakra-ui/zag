import type { Bindable, BindableParams } from "@zag-js/core"
import { isFunction } from "@zag-js/utils"
import Alpine from "alpinejs"

export function bindable<T>(props: () => BindableParams<T>): Bindable<T> {
  const initial = props().defaultValue ?? props().value
  const eq = props().isEqual ?? Object.is

  const v = Alpine.reactive({ value: initial })
  const controlled = {
    get value() {
      return props().value !== undefined
    },
  }

  const valueRef = {
    get value() {
      return controlled.value ? props().value : v.value
    },
  }

  const setFn = (val: T | ((prev: T) => T)) => {
    const prev = controlled.value ? props().value : v.value
    const next = isFunction(val) ? val(prev as T) : val

    if (props().debug) {
      console.log(`[bindable > ${props().debug}] setValue`, { next, prev })
    }

    if (!controlled.value) v.value = next
    if (!eq(next, prev)) {
      props().onChange?.(next, prev)
    }
  }

  function get(): T {
    return (controlled.value ? props().value : v.value) as T
  }

  return {
    initial,
    ref: valueRef,
    get,
    set(val: T | ((prev: T) => T)) {
      setFn(val)
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
  Alpine.onElRemoved(() => fn())
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
