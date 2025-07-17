import type { Bindable, BindableParams } from "@zag-js/core"
import { identity, isFunction } from "@zag-js/utils"
import { useEffect, useRef, useState } from "hono/jsx"
import { flushSync } from "hono/jsx/dom"
import { useSafeLayoutEffect } from "./use-layout-effect"

export function useBindable<T>(props: () => BindableParams<T>): Bindable<T> {
  const initial = props().value ?? props().defaultValue

  const eq = props().isEqual ?? Object.is

  const [initialValue] = useState(initial)
  const [value, setValue] = useState(initialValue)

  const controlled = props().value !== undefined

  const valueRef = useRef(value)
  valueRef.current = controlled ? props().value : value

  const prevValue = useRef(valueRef.current)
  useSafeLayoutEffect(() => {
    prevValue.current = valueRef.current
  }, [value, props().value])

  const setFn = (value: T | ((prev: T) => T)) => {
    const prev = prevValue.current === null ? undefined : prevValue.current
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
    initial: initialValue,
    ref: valueRef,
    get,
    set(value: T | ((prev: T) => T)) {
      const exec = props().sync ? flushSync : identity
      exec(() => setFn(value))
    },
    invoke(nextValue: T, prevValue: T) {
      props().onChange?.(nextValue, prevValue)
    },
    hash(value: T) {
      return props().hash?.(value) ?? String(value)
    },
  }
}

useBindable.cleanup = (fn: VoidFunction) => {
  useEffect(() => fn, [])
}

useBindable.ref = <T>(defaultValue: T) => {
  const value = useRef(defaultValue)
  return {
    get: () => value.current as T,
    set: (next: T) => {
      value.current = next
    },
  }
}
