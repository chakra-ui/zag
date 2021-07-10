import { runIfFn } from "@ui-machines/utils"
import { onDestroy } from "svelte/internal"
import { readable } from "svelte/store"
import { MachineSrc, StateMachine as S } from "@ui-machines/core"

export function useMachine<
  TContext extends Record<string, any>,
  TState extends S.StateSchema,
  TEvent extends S.EventObject = S.AnyEventObject,
>(
  machine: MachineSrc<TContext, TState, TEvent>,
  options: S.MachineOptions<TContext, TState, TEvent> & {
    state?: S.StateInit<TContext, TState>
  },
) {
  const { actions, state: hydratedState } = options ?? {}

  const resolvedMachine = (() => {
    const _machine = runIfFn(machine)
    return options ? _machine.withOptions(options) : _machine
  })()

  const service = resolvedMachine.start(hydratedState)

  const state = readable(service.state, (set) => {
    service.subscribe((state) => {
      if (state.changed) {
        set(state)
      }
    })

    return () => {
      service.stop()
    }
  })

  // update machine actives when `action` changes
  $: service.updateActions(actions)

  onDestroy(() => {
    service.stop()
  })

  return [state, service.send, service] as const
}
