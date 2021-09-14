import { MachineSrc, StateMachine as S } from "@ui-machines/core"
import { createSignal, onCleanup, onMount } from "solid-js"

export function useMachine<
  TContext extends Record<string, any>,
  TState extends S.StateSchema,
  TEvent extends S.EventObject = S.AnyEventObject,
>(
  machine: MachineSrc<TContext, TState, TEvent>,
  options?: S.MachineOptions<TContext, TState, TEvent> & {
    state?: S.StateInit<TContext, TState>
  },
) {
  const { actions, state: hydratedState } = options ?? {}
  const resolvedMachine = typeof machine === "function" ? machine() : machine.clone()

  const [service] = createSignal(options ? resolvedMachine.withOptions(options) : resolvedMachine)

  const [state, setState] = createSignal(service().state)

  let unsubscribe: () => void

  onMount(() => {
    service().start(hydratedState)
    unsubscribe = service().subscribe(setState)
  })

  onCleanup(() => {
    service().stop()
    unsubscribe()
  })

  onMount(() => {
    service().updateActions(actions)
  })

  return [state, service().send, service] as const
}
