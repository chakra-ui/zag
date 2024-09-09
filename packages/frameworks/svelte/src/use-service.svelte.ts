import type { MachineSrc, StateMachine as S } from "@zag-js/core"

export function useService<
  TContext extends Record<string, any>,
  TState extends S.StateSchema,
  TEvent extends S.EventObject = S.AnyEventObject,
>(machine: MachineSrc<TContext, TState, TEvent>, options?: S.HookOptions<TContext, TState, TEvent>) {
  const { actions, context, state: hydratedState } = options ?? {}

  const service = typeof machine === "function" ? machine() : machine

  const contextSnapshot = $state.snapshot(context)
  //@ts-expect-error - svelte typing issue
  service.setContext(contextSnapshot)

  service._created()

  $effect(() => {
    if (!actions) return
    const actionSnapshot = $state.snapshot(actions)
    //@ts-expect-error - svelte typing issue
    service.setOptions({ actions: actionSnapshot })
  })

  $effect(() => {
    const contextSnapshot = $state.snapshot(context)
    // @ts-expect-error - svelte typing issue
    service.setContext(contextSnapshot)
  })

  $effect(() => {
    service.start(hydratedState)
    return service.stop
  })

  return service
}
