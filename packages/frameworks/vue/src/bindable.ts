import type { Bindable, BindableParams } from "@zag-js/core"
import { isFunction } from "@zag-js/utils"
import { computed as __computed, onUnmounted, shallowRef } from "vue"

export function bindable<T>(props: () => BindableParams<T>): Bindable<T> {
  const initial = props().defaultValue ?? props().value
  const eq = props().isEqual ?? Object.is

  const v = shallowRef(initial)
  const controlled = __computed(() => props().value !== undefined)
  const valueRef = shallowRef(controlled.value ? props().value : v.value)

  return {
    initial,
    ref: valueRef,
    get(): T {
      return (controlled.value ? props().value : v.value) as T
    },
    set(val: T | ((prev: T) => T)) {
      const prev = controlled.value ? props().value : v.value
      const next = isFunction(val) ? val(prev as T) : val
      if (props().debug) {
        console.log(`[bindable > ${props().debug}] setValue`, { next, prev })
      }

      if (!controlled.value) v.value = next
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

bindable.cleanup = (fn: VoidFunction) => {
  onUnmounted(() => fn())
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
