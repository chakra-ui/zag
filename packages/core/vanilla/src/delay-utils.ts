import { is } from "@core-foundation/utils/is"

import { StateMachine as S } from "./types"

/**
 * Delay can be specified as:
 * - a string (reference to `options.delays`)
 * - a number (in ms)
 * - a function that returns a number (in ms)
 *
 * Let's resolve this to a number
 */
export function determineDelayFn<TContext, TEvent extends S.EventObject>(
  delay: S.Delay<TContext, TEvent> | undefined,
  delaysMap: S.DelayMap<TContext, TEvent> | undefined,
) {
  return (context: TContext, event: TEvent) => {
    if (is.number(delay)) return delay

    if (is.func(delay)) {
      return delay(context, event)
    }

    if (is.string(delay)) {
      const value = Number.parseFloat(delay)

      if (!Number.isNaN(value)) {
        return value
      }

      if (delaysMap) {
        const valueOrFn = delaysMap?.[delay]
        if (valueOrFn == null) {
          const msg = `[machine] Cannot determine delay for ${delay}. It doesn't exist in options.delays`
          throw new Error(msg)
        }
        return is.func(valueOrFn) ? valueOrFn(context, event) : valueOrFn
      }
    }
  }
}
