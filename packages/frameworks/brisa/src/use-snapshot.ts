import type { Machine, StateMachine as S } from "@zag-js/core"
import type { WebContext } from "brisa"
import { subscribe, snapshot } from "@zag-js/store"

export function useSnapshot<
  TContext extends Record<string, any>,
  TState extends S.StateSchema,
  TEvent extends S.EventObject = S.AnyEventObject,
>(ctx: WebContext, service: Machine<TContext, TState, TEvent>, options?: S.HookOptions<TContext, TState, TEvent>) {
  const { actions, context } = options ?? {}

  const state = ctx.state(service.state)

  // const state = service.state

  const unsubscribe = subscribe(service.state, () => {
    // console.log(service.state)
    // console.log("bef", snapshot(service.state))
    // state.value = snapshot(service.state) as any
    console.log("aft", state.value.context)
  })

  // const unsubscribe = service.subscribe((nextState) => {
  //   console.log(nextState)
  //   // // state.value = snapshot(nextState) as any
  //   state.value = nextState as any
  //   // console.log(state.value.context)
  // })

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
