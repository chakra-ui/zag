import type { Bindable, BindableParams } from "@zag-js/core"
import { isFunction } from "@zag-js/utils"
import { createEffect, createMemo, createSignal, type Accessor } from "solid-js"

export function createBindable<T>(props: Accessor<BindableParams<T>>): Bindable<T> {
  const initial = props().value ?? props().defaultValue

  const eq = props().isEqual ?? Object.is

  const [value, setValue] = createSignal(initial as T)
  const controlled = createMemo(() => props().value != undefined)

  const valueRef = { current: value() }
  const prevValue: Record<"current", T | undefined> = { current: undefined }

  createEffect(() => {
    const v = controlled() ? props().value : value()
    prevValue.current = v
    valueRef.current = v as T
  })

  const set = (v: T | ((prev: T) => T)) => {
    const prev = prevValue.current
    const next = isFunction(v) ? v(valueRef.current as T) : v

    if (props().debug) {
      console.log(`[bindable > ${props().debug}] setValue`, { next, prev })
    }

    if (!controlled()) setValue(next as any)
    if (!eq(next, prev)) {
      props().onChange?.(next, prev)
    }
  }

  function get(): T {
    const v = (controlled() ? props().value : value) as T
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
