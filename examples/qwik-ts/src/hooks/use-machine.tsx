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

export function useMachine<
  TContext extends Record<string, any>,
  TState extends S.StateSchema,
  TEvent extends S.EventObject,
>(props: UseMachineOptions<TContext, TState, TEvent>) {
  const { qrl, initialState } = props

  const store = useStore<any>({
    service: null,
    state: initialState,
  })

  useVisibleTask$(async ({ cleanup }) => {
    const service = await qrl()

    service!.start()

    store.service = service
    store.state = noSerialize(service!.getState())

    service!.subscribe((state: any) => {
      store.state = noSerialize(state)
    })

    cleanup(() => service!.stop())
  })

  const send = $((event: TEvent | string) => store.service!.send(event))
  const state = useComputed$(() => store.state)
  const service = useComputed$(() => store.service)

  return [state, send, service] as UseMachineReturn<TContext, TState, TEvent>
}
