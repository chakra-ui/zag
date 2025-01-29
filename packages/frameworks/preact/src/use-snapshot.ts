import type { Machine, StateMachine as S } from "@zag-js/core"
import { compact, isEqual } from "@zag-js/utils"
import { useEffect, useMemo, useState } from "preact/hooks"
import { useUpdateEffect } from "./use-update-effect"

export function useSnapshot<
  TContext extends Record<string, any>,
  TState extends S.StateSchema,
  TEvent extends S.EventObject = S.AnyEventObject,
>(
  service: Machine<TContext, TState, TEvent>,
  options?: S.HookOptions<TContext, TState, TEvent>,
): S.State<TContext, TState, TEvent> {
  //

  const { actions, context } = options ?? {}

  /* -----------------------------------------------------------------------------
   * Subscribe to the service state and create a snapshot of it
   * -----------------------------------------------------------------------------*/
  const [currSnapshot, setCurrSnapshot] = useState(() => service.getState())

  useEffect(() => {
    return service.subscribe(() => {
      setCurrSnapshot(service.getState())
    })
  }, [])

  /* -----------------------------------------------------------------------------
   * Sync actions
   * -----------------------------------------------------------------------------*/

  service.setOptions({ actions })

  /* -----------------------------------------------------------------------------
   * Sync context (if changed) to avoid unnecessary renders
   * -----------------------------------------------------------------------------*/

  const ctx = useMemo(() => compact(context ?? {}), [context])

  useUpdateEffect(() => {
    const entries = Object.entries(ctx)

    const previousCtx = service.contextSnapshot ?? {}

    const equality = entries.map(([key, value]) => ({
      key,
      curr: value,
      prev: previousCtx[key],
      equal: isEqual(previousCtx[key], value),
    }))

    const allEqual = equality.every(({ equal }) => equal)

    if (!allEqual) {
      // console.log(equality.filter(({ equal }) => !equal))
      service.setContext(ctx)
    }
  }, [ctx])

  return currSnapshot
}
