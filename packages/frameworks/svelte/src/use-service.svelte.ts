import type { MachineSrc, StateMachine as S } from "@zag-js/core"

export function useService<
  TContext extends Record<string, any>,
  TState extends S.StateSchema,
  TEvent extends S.EventObject = S.AnyEventObject,
>(machine: MachineSrc<TContext, TState, TEvent>, options?: S.HookOptions<TContext, TState, TEvent>) {
  const { actions, context, state: hydratedState } = options ?? {}

  const service = typeof machine === "function" ? machine() : machine
  service.setContext($state.snapshot(context))
  service._created()

  $effect(() => {
    service.setOptions({ actions: $state.snapshot(actions) })
  })

  $effect(() => {
    service.setContext($state.snapshot(context))
  })

  $effect(() => {
    service.start(hydratedState)
    return service.stop
  })

  return service
}
