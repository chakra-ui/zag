import { MachineSrc, StateMachine as S } from "@ui-machines/core"
import { onCleanup } from "solid-js"
import { createStore } from "solid-js/store"

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
  const { actions, state: _state } = options ?? {}
  const _machine = typeof machine === "function" ? machine() : machine.clone()

  const service = options ? _machine.withOptions(options) : _machine
  service.updateActions(actions)

  const [state, setState] = createStore(Object.assign({}, service.state))

  service.start(_state)
  const unsubscribe = service.subscribe(setState)

  onCleanup(() => {
    service.stop()
    unsubscribe()
  })

  return [state, service.send, service] as const
}
