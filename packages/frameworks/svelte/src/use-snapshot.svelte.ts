import { subscribe, type Machine, type StateMachine as S, snapshot } from "@zag-js/core"
import { onDestroy, unstate } from "svelte"

export function useSnapshot<
  TContext extends Record<string, any>,
  TState extends S.StateSchema,
  TEvent extends S.EventObject = S.AnyEventObject,
>(service: Machine<TContext, TState, TEvent>, options?: S.HookOptions<TContext, TState, TEvent>) {
  //
  const { actions, context } = options ?? {}

  let state = $state.frozen(service.state)

  $effect.pre(() => {
    return subscribe(service.state, () => {
      state = snapshot(service.state) as any
    })
  })

  $effect(() => {
    service.setOptions({ actions: unstate(actions) })
  })

  $effect(() => {
    service.setContext(unstate(context))
  })

  return {
    get state() {
      return state
    },
  }
}
