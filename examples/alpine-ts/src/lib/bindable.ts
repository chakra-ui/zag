import type { Bindable, BindableParams } from "@zag-js/core"
import { isFunction } from "@zag-js/utils"
import Alpine from "alpinejs"

export function bindable<T>(props: () => BindableParams<T>): Bindable<T> {
  const initial = props().defaultValue ?? props().value
  const eq = props().isEqual ?? Object.is

  const v = Alpine.reactive({ value: initial as T })

  const controlled = () => props().value !== undefined

  return {
    initial,
    ref: v,
    get() {
      return controlled() ? (props().value as T) : v.value
    },
    set(val: T | ((prev: T) => T)) {
      const prev = controlled() ? (props().value as T) : v.value
      const next = isFunction(val) ? val(prev) : val

      if (props().debug) {
        console.log(`[bindable > ${props().debug}] setValue`, { next, prev })
      }

      if (!controlled()) v.value = next
      if (!eq(next, prev)) {
        props().onChange?.(next, prev)
      }
    },
    invoke(nextValue: T, prevValue: T) {
      props().onChange?.(nextValue, prevValue)
    },
    hash(value: T) {
      return props().hash?.(value) ?? String(value)
    },
  }
}

bindable.cleanup = (_fn: VoidFunction) => {
  // No-op in vanilla implementation
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
