import { $, NoSerialize, noSerialize, QRL, Signal, useComputed$, useStore, useVisibleTask$ } from "@builder.io/qwik"
import type { Machine, StateMachine as S } from "@zag-js/core"

interface UseMachineOptions<
  TContext extends Record<string, any>,
  TState extends S.StateSchema,
  TEvent extends S.EventObject,
> {
  qrl: () => Promise<NoSerialize<Machine<TContext, TState, TEvent>>>
  initialState: NoSerialize<S.State<TContext, TState>>
}

type UseMachineReturn<
  TContext extends Record<string, any>,
  TState extends S.StateSchema,
  TEvent extends S.EventObject,
> = [Signal<S.State<TContext, TState>>, QRL<(event: TEvent) => void>, Signal<Machine<TContext, TState, TEvent>>]

type Store = {
  service: NoSerialize<Machine<any, any, any>> | null
  state: NoSerialize<S.State<any, any>>
}

export function useMachine<
  TContext extends Record<string, any>,
  TState extends S.StateSchema,
  TEvent extends S.EventObject,
>(props: UseMachineOptions<TContext, TState, TEvent>, options?: S.HookOptions<TContext, TState, TEvent>) {
  const { qrl, initialState } = props
  const { state: hydratedState, context, actions } = options ?? {}

  const store = useStore<Store>({
    service: null,
    state: initialState,
  })

  useVisibleTask$(async ({ cleanup, track }) => {
    // Service
    const service = await qrl()
    if (context) {
      service?.setContext(context)
      track(context)
    }

    service!.start(hydratedState)
    store.service = service

    // State
    store.state = noSerialize(service!.getState())

    const unsubscribe = service!.subscribe((state: any) => {
      store.state = noSerialize(state)
    })

    store.service?.setOptions({ actions })

    cleanup(() => {
      service!.stop()
      unsubscribe()
    })
  })

  const send = $((event: TEvent | string) => store.service!.send(event))
  const state = useComputed$(() => store.state)
  const service = useComputed$(() => store.service)

  return [state, send, service] as UseMachineReturn<TContext, TState, TEvent>
}
