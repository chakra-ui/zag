import type { Bindable, BindableParams } from "@zag-js/core"
import { isFunction } from "@zag-js/utils"
import { ref, computed as vueComputed, watchEffect } from "vue"

export function bindable<T>(props: () => BindableParams<T>): Bindable<T> {
  const initial = props().defaultValue ?? props().value
  const eq = props().isEqual ?? Object.is

  const v = ref(initial)
  const controlled = vueComputed(() => props().value !== undefined)
  const valueRef = ref(controlled.value ? props().value : v.value)
  const prevValue = ref(v.value)

  watchEffect(() => {
    const next = controlled.value ? props().value : v.value
    prevValue.value = next
    valueRef.value = next
  })

  return {
    initial,
    ref: valueRef,
    get(): T {
      return (controlled.value ? props().value : v.value) as T
    },
    set(val: T | ((prev: T) => T)) {
      const nextValue = isFunction(val) ? val(valueRef.value as T) : val
      if (!controlled.value) v.value = nextValue
      if (!eq(nextValue, prevValue.value)) {
        props().onChange?.(nextValue, prevValue.value)
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
