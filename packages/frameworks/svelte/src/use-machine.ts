import { onDestroy } from "svelte/internal"
import { readable } from "svelte/store"
import type { MachineSrc, StateMachine as S } from "@zag-js/core"

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

  const _machine = (() => {
    const m = typeof machine === "function" ? machine() : machine
    return options ? m.withOptions(options) : m
  })()

  const service = _machine.start(hydratedState)

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
  $: service.setActions(actions)

  onDestroy(() => {
    service.stop()
  })

  return [state, service.send, service] as const
}
