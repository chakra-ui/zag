import { MachineSrc, StateMachine as S } from "@ui-machines/core"
import { createEffect, onCleanup, onMount } from "solid-js"
import { createStore, reconcile, Store } from "solid-js/store"

const toPOJO = (v: any) => JSON.parse(JSON.stringify(v))

const unwrap = (state: any) => ({
  value: String(state.value),
  previousValue: String(state.previousValue),
  context: toPOJO(state.context),
  event: toPOJO(state.event),
  done: Boolean(state.done),
  tags: Array.from(state.tags),
})

type HookOptions<
  TContext extends Record<string, any>,
  TState extends S.StateSchema,
  TEvent extends S.EventObject = S.AnyEventObject,
> = Omit<S.HookOptions<TContext, TState, TEvent>, "context"> & {
  context?: Store<Partial<TContext>>
}

export function useMachine<
  TContext extends Record<string, any>,
  TState extends S.StateSchema,
  TEvent extends S.EventObject = S.AnyEventObject,
>(machine: MachineSrc<TContext, TState, TEvent>, options?: HookOptions<TContext, TState, TEvent>) {
  const { actions, state: hydratedState, preserve, context } = options ?? {}
  const service = typeof machine === "function" ? machine() : preserve ? machine : machine.clone()

  const [state, setState] = createStore<any>(unwrap(service.state))

  service.start(hydratedState)

  createEffect(() => {
    if (context) {
      service.setContext(context)
    }
  })

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
