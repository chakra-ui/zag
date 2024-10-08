import type { Machine, StateMachine as S } from "@zag-js/core"
import { snapshot, subscribe } from "@zag-js/store"
import type { WebContext } from "brisa"

export function useSnapshot<
  TContext extends Record<string, any>,
  TState extends S.StateSchema,
  TEvent extends S.EventObject = S.AnyEventObject,
>(ctx: WebContext, service: Machine<TContext, TState, TEvent>, options?: S.HookOptions<TContext, TState, TEvent>) {
  const { actions, context } = options ?? {}

  const state = ctx.state(service.state)

  const unsubscribe = subscribe(service.state, () => {
    state.value = snapshot(service.state) as any
    // console.log("service", state.value)
  })

  ctx.cleanup(() => {
    unsubscribe?.()
  })

  ctx.effect(() => {
    service.setOptions({ actions })
  })

  ctx.effect(() => {
    if (context) service.setContext(context)
  })

  return state
}
