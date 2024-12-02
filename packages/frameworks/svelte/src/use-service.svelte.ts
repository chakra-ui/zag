import type { MachineSrc, StateMachine as S } from "@zag-js/core"
import { onMount } from "svelte"

export function useService<
  TContext extends Record<string, any>,
  TState extends S.StateSchema,
  TEvent extends S.EventObject = S.AnyEventObject,
>(machine: MachineSrc<TContext, TState, TEvent>, options?: S.HookOptions<TContext, TState, TEvent>) {
  const service = typeof machine === "function" ? machine() : machine

  const contextSnapshot = $state.snapshot(options?.context)
  //@ts-expect-error - svelte typing issue
  service.setContext(contextSnapshot)

  service._created()

  $effect(() => {
    if (!options?.actions) return
    const actionSnapshot = $state.snapshot(options.actions)
    //@ts-expect-error - svelte typing issue
    service.setOptions({ actions: actionSnapshot })
  })

  $effect(() => {
    const contextSnapshot = $state.snapshot(options?.context)
    // @ts-expect-error - svelte typing issue
    service.setContext(contextSnapshot)
  })

  onMount(() => {
    service.start(options?.state)
    return service.stop
  })

  return service
}
