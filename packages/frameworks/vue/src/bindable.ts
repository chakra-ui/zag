import type { Bindable, BindableParams } from "@zag-js/core"
import { isFunction, isEqual } from "@zag-js/utils"
import { shallowRef, computed as __computed } from "vue"

export function bindable<T>(props: () => BindableParams<T>): Bindable<T> {
  const initial = props().defaultValue ?? props().value
  const eq = props().isEqual ?? isEqual

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
      const nextValue = isFunction(val) ? val(prev as T) : val
      if (!controlled.value) v.value = nextValue
      if (!eq(nextValue, prev)) {
        props().onChange?.(nextValue, prev)
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
