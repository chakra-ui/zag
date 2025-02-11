import { isFunction } from "@zag-js/utils"
import type { Bindable, BindableParams } from "@zag-js/core"
import { useLayoutEffect, useRef, useState } from "react"

export function useBindable<T>(props: () => BindableParams<T>): Bindable<T> {
  const initial = props().defaultValue ?? props().value
  const eq = props().isEqual ?? Object.is

  const [initialValue] = useState(initial)
  const [value, setValue] = useState(initialValue)

  const controlled = props().value !== undefined

  const valueRef = useRef(value)
  valueRef.current = controlled ? props().value : value

  const prevValue = useRef(valueRef.current)
  useLayoutEffect(() => {
    prevValue.current = valueRef.current
  }, [value, props().value])

  const set = (value: T | ((prev: T) => T)) => {
    const prev = prevValue.current
    const next = isFunction(value) ? value(prev as T) : value

    if (props().debug) {
      console.log(`[bindable > ${props().debug}] setValue`, { next, prev })
    }

    if (!controlled) setValue(next)
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
    set,
    invoke(nextValue: T, prevValue: T) {
      props().onChange?.(nextValue, prevValue)
    },
  }
}
