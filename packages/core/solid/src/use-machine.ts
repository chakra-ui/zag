import { MachineSrc, StateMachine as S } from "@ui-machines/core"
import { onCleanup, onMount } from "solid-js"
import { createStore, reconcile } from "solid-js/store"

const toPOJO = (v: any) => JSON.parse(JSON.stringify(v))

const unwrap = (s: any) => ({
  value: String(s.value),
  previousValue: String(s.previousValue),
  context: toPOJO(s.context),
  event: toPOJO(s.event),
  done: Boolean(s.done),
  tags: new Set(Array.from(s.tags)),
})

export function useMachine<
  TContext extends Record<string, any>,
  TState extends S.StateSchema,
  TEvent extends S.EventObject = S.AnyEventObject,
>(machine: MachineSrc<TContext, TState, TEvent>, options?: S.HookOptions<TContext, TState, TEvent>) {
  const { actions, state: hydratedState } = options ?? {}
  const service = typeof machine === "function" ? machine() : machine.clone()

  const [state, setState] = createStore<any>(unwrap(service.state))

  service.start(hydratedState)

  const unsubscribe = service.subscribe((s) => {
    setState(reconcile(s))
  })

  onCleanup(() => {
    unsubscribe()
    service.stop()
  })

  onMount(() => {
    service.setActions(actions)
  })

  const _state = <S.State<TContext, TState>>state

  return [_state, service.send, service] as const
}
