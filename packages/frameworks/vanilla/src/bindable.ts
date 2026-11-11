import type { Bindable, BindableFn, BindableParams } from "@zag-js/core"
import { isFunction } from "@zag-js/utils"

/**
 * Creates a `bindable` whose values are plain cells. Values are replaced, never mutated,
 * so `onUpdate` is all the machine needs to know something changed.
 */
export function createBindable(onUpdate?: VoidFunction): BindableFn {
  function bindable<T>(props: () => BindableParams<T>): Bindable<T> {
    const initial = props().value ?? props().defaultValue

    if (process.env.NODE_ENV !== "production" && props().debug) {
      console.log(`[bindable > ${props().debug}] initial`, initial)
    }

    const eq = props().isEqual ?? Object.is

    let value = initial as T

    // `props()` builds a new object per call, so read it once per access
    const current = () => {
      const controlled = props().value
      return controlled !== undefined ? (controlled as T) : value
    }

    return {
      initial,
      ref: {
        get value() {
          return value
        },
      },
      get: current,
      set(nextValue: T | ((prev: T) => T)) {
        const params = props()
        const prev = params.value !== undefined ? (params.value as T) : value
        const next = isFunction(nextValue) ? nextValue(prev as T) : nextValue

        if (process.env.NODE_ENV !== "production" && params.debug) {
          console.log(`[bindable > ${params.debug}] setValue`, { next, prev })
        }

        if (params.value === undefined && !Object.is(value, next)) {
          value = next
          onUpdate?.()
        }

        if (!eq(next, prev)) {
          params.onChange?.(next, prev)
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
    // No-op in vanilla: cleanup is handled manually via machine.stop()
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

  return bindable
}

export const bindable = createBindable()
